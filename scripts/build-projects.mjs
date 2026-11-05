// Generira sekciju s projektima (referencama) iz content/projekti/*.json.
// Fotografije se uzimaju iz uploads/projekti/, optimiziraju u public/img/projekti/
// (WebP + JPEG, 800 i 1600 px), a HTML kartica se upisuje u index.html između
// oznaka <!-- PROJEKTI --> i <!-- /PROJEKTI -->.
// Pokretanje: npm run projekti   (build i dev to rade sami)
// Podatke i slike uređuje admin sučelje (/admin/), ručno se ne mora ništa dirati.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content", "projekti");
const outDir = join(root, "public", "img", "projekti");
const WIDTHS = [800, 1600];
const FIELDS = [
  ["investitor", "Investitor"],
  ["lokacija", "Lokacija"],
  ["opseg", "Opseg radova"],
  ["godina", "Godina"],
];

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

// Vraća veličinu najveće verzije; preskače već obrađene fotografije.
async function optimize(srcPath, destBase) {
  const srcTime = statSync(srcPath).mtimeMs;
  let size;
  for (const w of WIDTHS) {
    const webp = `${destBase}-${w}.webp`;
    const jpg = `${destBase}-${w}.jpg`;
    if (!(existsSync(webp) && existsSync(jpg) && statSync(webp).mtimeMs >= srcTime)) {
      const base = sharp(srcPath).rotate();
      const { width } = await base.metadata();
      const resize = { width: Math.min(w, width ?? w), withoutEnlargement: true };
      await base.clone().resize(resize).webp({ quality: 78, effort: 6 }).toFile(webp);
      await base.clone().resize(resize).jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(jpg);
    }
  }
  const info = await sharp(`${destBase}-${WIDTHS.at(-1)}.webp`).metadata();
  size = [info.width, info.height];
  return size;
}

const projects = readdirSync(contentDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => ({ slug: f.replace(/\.json$/, ""), ...JSON.parse(readFileSync(join(contentDir, f), "utf-8")) }))
  .filter((p) => p.slike?.length)
  .sort((a, b) => (a.redoslijed ?? 999) - (b.redoslijed ?? 999) || a.naziv.localeCompare(b.naziv, "hr"));

const cards = [];
for (const p of projects) {
  mkdirSync(join(outDir, p.slug), { recursive: true });
  const album = [];
  let cover;
  let size;
  for (const [i, image] of p.slike.entries()) {
    const n = String(i + 1).padStart(2, "0");
    const srcPath = join(root, image.replace(/^\//, ""));
    if (!existsSync(srcPath)) throw new Error(`Projekt "${p.naziv}": nema slike ${image}`);
    const base = join(outDir, p.slug, n);
    const s = await optimize(srcPath, base);
    if (i === 0) {
      cover = `/img/projekti/${p.slug}/${n}`;
      size = s;
    }
    album.push({ src: `/img/projekti/${p.slug}/${n}-${WIDTHS.at(-1)}.webp`, alt: `${p.naziv}, fotografija ${i + 1}` });
  }

  const rows = FIELDS.filter(([k]) => String(p[k] ?? "").trim())
    .map(([k, label]) => `\n            <div><dt>${label}</dt><dd>${esc(String(p[k]).trim())}</dd></div>`)
    .join("");
  const meta = rows ? `\n          <dl class="project__meta">${rows}\n          </dl>` : "";
  const count = album.length;
  const few = [2, 3, 4].includes(count % 10) && !(count % 100 >= 12 && count % 100 <= 14);
  const t = esc(p.naziv);
  const sizes = "(min-width: 1081px) 33vw, (min-width: 641px) 50vw, 100vw";
  cards.push(`        <article class="project">
          <button type="button" class="project__open" data-album='${esc(JSON.stringify(album))}' data-title="${t}" aria-label="Otvori fotografije: ${t}">
            <picture>
              <source type="image/webp" srcset="${cover}-800.webp 800w, ${cover}-1600.webp 1600w" sizes="${sizes}">
              <img src="${cover}-800.jpg" srcset="${cover}-800.jpg 800w, ${cover}-1600.jpg 1600w" sizes="${sizes}" alt="${t}" width="${size[0]}" height="${size[1]}" loading="lazy" decoding="async">
            </picture>
            <span class="project__count">${count} ${few ? "fotografije" : "fotografija"}</span>
          </button>
          <h3>${t}</h3>${meta}
        </article>`);
}

const htmlPath = join(root, "index.html");
const page = readFileSync(htmlPath, "utf-8");
const re = /<!-- PROJEKTI -->[\s\S]*?<!-- \/PROJEKTI -->/;
if (!re.test(page)) throw new Error("Oznake PROJEKTI nisu pronađene u index.html");
const block = "<!-- PROJEKTI -->\n" + cards.join("\n") + "\n        <!-- /PROJEKTI -->";
writeFileSync(htmlPath, page.replace(re, () => block));
console.log(`Projekata: ${cards.length}`);

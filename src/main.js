import "@fontsource-variable/archivo/wdth.css";
import "./style.css";

// Header: proziran iznad hero fotografije, pun nakon skrolanja
const header = document.querySelector("[data-header]");
const hero = document.querySelector(".hero");
if (header && hero && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => header.classList.toggle("is-solid", !entry.isIntersecting), {
    rootMargin: "-90px 0px 0px 0px",
  }).observe(hero);
} else {
  header?.classList.add("is-solid");
}

// Mobilni izbornik
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");
const setNav = (open) => {
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
};
toggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
nav.addEventListener("click", (e) => e.target.closest("a") && setNav(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && setNav(false));

// Projekti: "Prikaži sve projekte"
const projects = document.getElementById("projekti");
const moreBtn = document.querySelector("[data-projects-more]");
moreBtn.addEventListener("click", () => {
  projects.classList.add("is-expanded");
  moreBtn.setAttribute("aria-expanded", "true");
  moreBtn.hidden = true;
});

// Projekti: klik otvara sve fotografije projekta (strelice, tipkovnica, swipe)
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImg = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("figcaption");
let album = [];
let albumTitle = "";
let current = 0;

// dok se nova fotografija ne učita, skrivamo staru (inače bi na trenutak ostala prethodna)
const hideUntilLoaded = () => lightbox.classList.remove("is-loading");
lightboxImg.addEventListener("load", hideUntilLoaded);
lightboxImg.addEventListener("error", hideUntilLoaded);

const show = (i) => {
  current = (i + album.length) % album.length;
  if (lightboxImg.getAttribute("src") !== album[current].src) {
    lightbox.classList.add("is-loading");
    lightboxImg.src = album[current].src;
  }
  lightboxImg.alt = album[current].alt;
  lightboxCaption.textContent = album.length > 1 ? `${albumTitle} (${current + 1}/${album.length})` : albumTitle;
  // sljedeću fotografiju učitaj unaprijed da listanje bude odmah
  if (album.length > 1) new Image().src = album[(current + 1) % album.length].src;
};

projects.querySelectorAll(".project__open").forEach((btn) =>
  btn.addEventListener("click", () => {
    album = JSON.parse(btn.dataset.album);
    albumTitle = btn.dataset.title;
    lightbox.classList.toggle("is-single", album.length < 2);
    lightboxImg.removeAttribute("src"); // nikad ne prikazuj fotografiju prethodnog projekta
    show(0);
    lightbox.showModal();
  })
);
lightbox.querySelector(".lightbox__prev").addEventListener("click", () => show(current - 1));
lightbox.querySelector(".lightbox__next").addEventListener("click", () => show(current + 1));
lightbox.querySelector(".lightbox__close").addEventListener("click", () => lightbox.close());
// pri zatvaranju (gumb, klik izvan, Esc) makni fotografiju da se ne pojavi u sljedećem projektu
lightbox.addEventListener("close", () => {
  lightboxImg.removeAttribute("src");
  lightbox.classList.remove("is-loading");
});
// klik izvan fotografije zatvara
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox || e.target.tagName === "FIGURE") lightbox.close();
});
lightbox.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});
let touchX = null;
lightbox.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
lightbox.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();

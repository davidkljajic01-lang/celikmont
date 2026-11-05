// Mobilni izbornik
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// Obrazac -> otvara e-mail klijent s popunjenim upitom (bez servera)
const EMAIL = "info@celik-mont.hr";
document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(e.target);
  const subject = `Upit za ponudu – ${d.get("vrsta")}`;
  const body = `Ime i prezime: ${d.get("ime")}\nKontakt: ${d.get("kontakt")}\nVrsta posla: ${d.get("vrsta")}\n\n${d.get("poruka")}`;
  location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.getElementById("year").textContent = new Date().getFullYear();

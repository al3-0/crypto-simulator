// js/navbar.js
document.addEventListener("DOMContentLoaded", () => {
  fetch("./components/navbar.html")
    .then((res) => {
      if (!res.ok) throw new Error("Errore nel caricamento della navbar");
      return res.text();
    })
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;

      // Abilita toggle navbar
      const navToggle = document.querySelector(".nav-toggle");
      const navMenu = document.querySelector(".nav-menu");

      navToggle?.addEventListener("click", () => {
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!expanded));
        navMenu.classList.toggle("show");
      });

      // Gestione tema chiaro/scuro
      const themeToggleBtn = document.getElementById("theme-toggle");
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        themeToggleBtn.textContent = "☀️";
      }

      themeToggleBtn?.addEventListener("click", () => {
        const isLight = document.body.classList.toggle("light-theme");
        localStorage.setItem("theme", isLight ? "light" : "dark");
        themeToggleBtn.textContent = isLight ? "☀️" : "🌙";
      });
    })
    .catch((err) => {
      console.error("Errore caricamento navbar:", err);
    });
});

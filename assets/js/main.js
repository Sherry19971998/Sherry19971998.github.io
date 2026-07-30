/* ==========================================================================
   Shared site behaviour: active nav, mobile menu toggle, footer year.
   Loaded on every page.
   ========================================================================== */
(function () {
  "use strict";

  // Highlight the current page in the nav.
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("is-active");
    }
  });

  // Mobile nav toggle.
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Current year in footer.
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Day / night theme toggle (persisted in localStorage; overrides the system).
  var root = document.documentElement;
  var themeBtn = document.querySelector(".theme-toggle");

  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }
  function paintIcon() {
    if (themeBtn) themeBtn.textContent = isDark() ? "☀️" : "🌙";
  }
  paintIcon();

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      paintIcon();
    });
  }
})();

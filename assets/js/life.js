/* ==========================================================================
   Life page: fade slideshow (auto-play + arrows + dots) and a photo grid,
   driven by data/life.json. Safe no-op unless the slideshow container exists.
   ========================================================================== */
(function () {
  "use strict";

  var slideshow = document.getElementById("life-slideshow");
  if (!slideshow) return;

  var slidesWrap = document.getElementById("life-slides");
  var dotsWrap = document.getElementById("life-dots");
  var grid = document.getElementById("life-grid");
  var AUTOPLAY_MS = 4000;

  fetch("data/life.json")
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (photos) {
      if (!photos.length) {
        slideshow.innerHTML =
          '<p class="loading" style="padding:2rem;text-align:center">No photos yet.</p>';
        return;
      }

      var slides = [];
      var dots = [];

      photos.forEach(function (p, i) {
        // slide
        var slide = document.createElement("div");
        slide.className = "slide" + (i === 0 ? " is-active" : "");
        // blurred fill background (same photo) so portraits have no empty bars
        var bg = document.createElement("div");
        bg.className = "slide__bg";
        slide.appendChild(bg);
        var img = document.createElement("img");
        img.className = "slide__img";
        img.alt = p.caption || "Photo";
        img.onerror = function () {
          this.style.display = "none";
        };
        // lazy: only load the first slide now; the rest load on demand
        img.dataset.src = p.src;
        slide.appendChild(img);
        if (p.caption) {
          var cap = document.createElement("div");
          cap.className = "slide__caption";
          cap.textContent = p.caption;
          slide.appendChild(cap);
        }
        slidesWrap.appendChild(slide);
        slides.push(slide);

        // dot
        var dot = document.createElement("button");
        dot.className = "dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Go to photo " + (i + 1));
        dot.addEventListener("click", function () {
          go(i);
          restart();
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);

        // grid thumbnail
        if (grid) {
          var t = document.createElement("img");
          t.src = p.src;
          t.alt = p.caption || "Photo";
          t.loading = "lazy";
          t.onerror = function () {
            this.style.visibility = "hidden";
          };
          t.addEventListener("click", function () {
            go(i);
            restart();
            slideshow.scrollIntoView({ behavior: "smooth", block: "center" });
          });
          grid.appendChild(t);
        }
      });

      // scroll-reveal: grid thumbnails fade/rise in as they enter view
      if (grid) {
        var imgs = grid.querySelectorAll("img");
        if ("IntersectionObserver" in window) {
          var io = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (e) {
                if (e.isIntersecting) {
                  e.target.style.transitionDelay =
                    (Number(e.target.dataset.i) % 3) * 0.08 + "s";
                  e.target.classList.add("is-visible");
                  io.unobserve(e.target);
                }
              });
            },
            { threshold: 0.12 }
          );
          Array.prototype.forEach.call(imgs, function (im, k) {
            im.dataset.i = k;
            io.observe(im);
          });
        } else {
          Array.prototype.forEach.call(imgs, function (im) {
            im.classList.add("is-visible");
          });
        }
      }

      var current = 0;
      var timer = null;

      // load a slide's image + blurred bg only when first needed
      function loadSlide(i) {
        var s = slides[i];
        var img = s.querySelector(".slide__img");
        if (img && img.dataset.src) {
          img.src = img.dataset.src;
          var bg = s.querySelector(".slide__bg");
          if (bg) bg.style.backgroundImage = 'url("' + img.dataset.src + '")';
          img.removeAttribute("data-src");
        }
      }

      function go(n) {
        slides[current].classList.remove("is-active");
        dots[current].classList.remove("is-active");
        current = (n + slides.length) % slides.length;
        slides[current].classList.add("is-active");
        dots[current].classList.add("is-active");
        loadSlide(current);
        loadSlide((current + 1) % slides.length); // preload the next one
      }
      function next() {
        go(current + 1);
      }
      function start() {
        if (slides.length > 1) timer = setInterval(next, AUTOPLAY_MS);
      }
      function restart() {
        clearInterval(timer);
        start();
      }

      document
        .getElementById("life-prev")
        .addEventListener("click", function () {
          go(current - 1);
          restart();
        });
      document
        .getElementById("life-next")
        .addEventListener("click", function () {
          go(current + 1);
          restart();
        });

      loadSlide(0); // first photo loads immediately
      loadSlide(1 % slides.length);
      start();
    })
    .catch(function () {
      slideshow.innerHTML =
        '<p class="error" style="padding:2rem;text-align:center">Could not load photos. If viewing this file directly, run a local server (see README).</p>';
    });
})();

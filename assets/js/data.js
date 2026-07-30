/* ==========================================================================
   Data loading + rendering for the JSON-driven sections (news, publications).
   Each renderer is a no-op unless its container exists on the page, so this
   file is safe to include on both Home and CV.

   NOTE: fetch() of local JSON needs an http(s) origin. On GitHub Pages this
   just works. For local preview run a static server (see README) rather than
   opening the file directly.
   ========================================================================== */
(function () {
  "use strict";

  var MY_NAME = "Xinyi Xie"; // highlighted in author lists

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function fail(container, label) {
    container.innerHTML =
      '<p class="error">Could not load ' +
      label +
      ". If you are viewing this file directly, run a local server (see README).</p>";
  }

  function fetchJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.status + " " + r.statusText);
      return r.json();
    });
  }

  /* ---- News ------------------------------------------------------------- */
  function renderNews() {
    var container = document.getElementById("news-list");
    if (!container) return;
    fetchJSON("data/news.json")
      .then(function (items) {
        container.innerHTML = "";
        if (!items.length) {
          container.appendChild(el("p", "loading", "No news yet."));
          return;
        }
        items.forEach(function (n) {
          var row = el("div", "news-item");
          row.appendChild(el("time", null, escapeHTML(n.date)));
          row.appendChild(el("div", null, n.html || escapeHTML(n.text || "")));
          container.appendChild(row);
        });
      })
      .catch(function () {
        fail(container, "news");
      });
  }

  /* ---- Publications ----------------------------------------------------- */
  function authorLine(authors) {
    return authors
      .map(function (a) {
        return a === MY_NAME
          ? '<span class="me">' + escapeHTML(a) + "</span>"
          : escapeHTML(a);
      })
      .join(", ");
  }

  function pubNode(p) {
    var node = el("div", "pub");

    var title = el("div", "pub__title", escapeHTML(p.title));
    if (p.badge) {
      title.insertAdjacentHTML(
        "beforeend",
        ' <span class="pub__badge">' + escapeHTML(p.badge) + "</span>"
      );
    }
    // venue may contain a link, so it is treated as trusted HTML (author-controlled data)
    var venueText = (p.venue || "") + (p.year ? ", " + p.year : "");
    var authorsShown = p.authors && p.authors.length && !p.hideAuthors;
    // no visible authors → show the status inline, right after the title
    if (!authorsShown && venueText) {
      title.insertAdjacentHTML(
        "beforeend",
        ' <span class="pub__status">(' + venueText + ")</span>"
      );
    }
    node.appendChild(title);
    if (authorsShown) {
      node.appendChild(el("div", "pub__authors", authorLine(p.authors)));
    }
    // with authors shown, the venue sits on its own line, as usual
    if (authorsShown && venueText) {
      node.appendChild(el("div", "pub__venue", venueText));
    }

    if (p.links && Object.keys(p.links).length) {
      var links = el("div", "pub__links");
      Object.keys(p.links).forEach(function (label) {
        var a = el("a", null, escapeHTML(label));
        a.href = p.links[label];
        a.target = "_blank";
        a.rel = "noopener";
        links.appendChild(a);
      });
      node.appendChild(links);
    }
    return node;
  }

  function renderPublications() {
    var container = document.getElementById("pub-list");
    if (!container) return;

    // On the Home page, show only entries flagged "selected"; on the CV, all.
    var selectedOnly = container.dataset.selected === "true";

    fetchJSON("data/publications.json")
      .then(function (pubs) {
        pubs.sort(function (a, b) {
          return (b.year || 0) - (a.year || 0);
        });
        var shown = selectedOnly
          ? pubs.filter(function (p) {
              return p.selected;
            })
          : pubs;

        container.innerHTML = "";
        if (!shown.length) {
          container.appendChild(el("p", "loading", "Nothing here yet."));
          return;
        }
        shown.forEach(function (p) {
          container.appendChild(pubNode(p));
        });
      })
      .catch(function () {
        fail(container, "publications");
      });
  }

  renderNews();
  renderPublications();
})();

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

  // Icons for publication resource links (paper / code / project).
  var ICON_DOC =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.6V9h5.4L13 3.6ZM8 12.5h8V14H8v-1.5Zm0 3.1h8v1.5H8v-1.5Z"/></svg>';
  var ICON_GH =
    '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>';
  var ICON_WEB =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18"/></svg>';
  var LINK_ICONS = {
    paper: ICON_DOC, pdf: ICON_DOC, arxiv: ICON_DOC, preprint: ICON_DOC,
    code: ICON_GH, github: ICON_GH,
    website: ICON_WEB, project: ICON_WEB, page: ICON_WEB, demo: ICON_WEB,
  };
  function linkIcon(label) {
    return LINK_ICONS[String(label).toLowerCase()] || null;
  }

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
        var a = el("a", "pub__link");
        a.href = p.links[label];
        a.target = "_blank";
        a.rel = "noopener";
        a.title = label;
        a.setAttribute("aria-label", label);
        var icon = linkIcon(label);
        if (icon) a.innerHTML = icon;
        else a.textContent = label;
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

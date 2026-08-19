# personal website

A minimal two-page academic site (**Home** + **CV**), built with plain HTML,
CSS, and JavaScript. No build step, no framework. Content for News and
Publications is data-driven from JSON. Design: sans-serif, single-column, soft
rose accent.

## Structure

```
sherry-website/
├── index.html            # Home: profile, bio, research, news, selected pubs, service
├── cv.html               # CV: education, experience, full publications, awards, teaching, service, skills
├── assets/
│   ├── css/style.css     # all styling + dark mode + rose theme variables
│   ├── js/main.js        # active-nav + footer year
│   ├── js/data.js        # loads + renders news.json and publications.json
│   ├── images/           # headshot.jpg goes here
│   └── icons/favicon.svg
├── data/
│   ├── news.json
│   └── publications.json
├── assets/Xinyi_Xie_CV.pdf   # (add your PDF here)
├── CNAME                 # custom domain (edit when ready)
└── README.md
```

## Editing content

- **News** — edit `data/news.json`. Each item has a `date` and either `text`
  (plain) or `html` (may contain links). Newest first.
- **Publications** — edit `data/publications.json`. Set `"selected": true` to
  show an entry in the Home "Selected Publications" section; the CV shows all.
  Your name (`Xinyi Xie`) is auto-highlighted in author lists. Optional
  `badge` (e.g. "Oral", "Preprint") and `links` map (label → URL).
- **Everything else** (bio, research areas, education, awards, …) is plain HTML
  in `index.html` / `cv.html`. Search for "Placeholder" to find what to replace.
- **Photo** — drop a square image at `assets/images/headshot.jpg`.
- **Colors** — change the `--color-accent*` variables at the top of
  `assets/css/style.css`.

## Local preview

`fetch()` needs an http origin, so open via a tiny static server rather than
double-clicking the file:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a repo and push these files.
2. Repo → Settings → Pages → deploy from the `main` branch, root folder.
3. To use a custom domain, put it in the `CNAME` file and configure DNS.

# TaskPilot AI

Describe a task and get ranked AI tool recommendations, with filters, side-by-side comparison, an Explore page and session search history.

It is a plain static site (HTML, CSS and vanilla JavaScript). There is no build step, no dependencies, no backend and no API keys. The recommendation engine is a local keyword and category matcher, not a live AI model.

## Structure
```
index.html          page shell (nav, footer, script/style links)
src/styles.css      all styling (light and dark themes)
src/data.js         tool catalogue, category keywords, example prompts
src/app.js          recommendation engine, state and rendering
public/favicon.svg  icon
```

## Run locally
Open `index.html` in a browser, or run `npm start` and visit http://localhost:3000 (needs Node.js).

## Deploy (all free, no configuration needed)
- **GitHub Pages:** push to GitHub, then Settings > Pages > Deploy from a branch > `main` / root.
- **Netlify:** New site from Git, leave build command empty, publish directory `.`
- **Vercel:** Import the repo, Framework Preset "Other", leave build settings empty.

## Updating the catalogue
Add an entry to `TOOLS` in `src/data.js` using the `T(...)` helper. Keywords (`k`) are lowercase substrings matched against the user's task. Check pricing and features on each tool's official site, as they change often.

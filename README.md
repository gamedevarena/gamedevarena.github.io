# Game Dev Arena Website

Website for the Game Dev Arena Community: a hub for game developers, artists, and enthusiasts in Northern Italy.

## Features

- **Single-page home:** `index.html` fetches `data/site.json` and renders home, eventi passati,
  chi siamo and contatti client-side (hash routing, no build step).
- **Live Reload Development Server:** Instant browser refresh on file changes.
- **Responsive Design:** Mobile-friendly and accessible.
- **Community Info:** Mission, founders, partners, sponsors and contact details.

Content lives entirely in [`data/site.json`](data/site.json) — see [AUTOMAZIONE.md](AUTOMAZIONE.md)
for which parts are automated (n8n/CI) and which are hand-edited.

`socials.html` (link-in-bio page) and `upcoming-event.html` (redirect to the latest Eventbrite
event) are separate standalone pages and still use the older `src/css/design.css` design system.

## Project Structure

```
website/
├── index.html                # Home SPA (fetches data/site.json)
├── socials.html               # Standalone link-in-bio page
├── upcoming-event.html        # Standalone Eventbrite redirect page
├── data/site.json             # Content feed for index.html
├── package.json               # Project metadata and scripts
├── public/                    # Static assets (images, logos, icons)
├── scripts/build-events.js    # Rebuilds data/site.json's events/upcoming from events*.json
├── server/                    # Node.js server and live reload
│   ├── server.js
│   └── livereload.js
├── src/
│   ├── css/
│   │   ├── site.css           # index.html only
│   │   └── design.css, styles.css  # socials.html / upcoming-event.html
│   └── js/
│       └── site.js            # index.html rendering + interactions
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

- Open [http://localhost:6969](http://localhost:6969) in your browser.
- The server supports live reload: changes to HTML, CSS, or JS files will auto-refresh the page.

### Build & Production

This project is static and does not require a build step. For production, serve the `website` folder with any static file server.

## Scripts

- `npm start` — Start the server (no live reload)
- `npm run dev` — Start the server with live reload (using nodemon)

## Main Technologies

- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [WebSocket](https://www.npmjs.com/package/ws) for live reload
- [Chokidar](https://www.npmjs.com/package/chokidar) for file watching
- Vanilla JS, no framework, no build step
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) and modern responsive design

## Community

- **Mission:** Support, connect, and grow the local game development ecosystem.
- **Founders:** Eugenio Perinelli, Nicola Castellani, Emanuele Vinci
- **Contact:** hello.gamedevarena@gmail.com

---

Game Dev Arena © 2025. All rights reserved.

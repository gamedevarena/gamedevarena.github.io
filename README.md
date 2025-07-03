# Game Dev Arena Website

Website for the Game Dev Arena Community: a hub for game developers, artists, and enthusiasts in Northern Italy.

## Features

- **Event Listing:** Upcoming talks, workshops, and community events.
- **Custom Web Components:** Modern UI with custom elements (e.g., `<event-card>`).
- **Live Reload Development Server:** Instant browser refresh on file changes.
- **Responsive Design:** Mobile-friendly and accessible.
- **Community Info:** Mission, founders, and contact details.

## Project Structure

```
website/
├── index.html                # Main landing page
├── package.json              # Project metadata and scripts
├── public/                   # Static assets (images, logos)
├── server/                   # Node.js server and live reload
│   ├── server.js
│   └── livereload.js
├── src/
│   ├── css/                  # CSS styles (design system, layout)
│   └── js/                   # Custom JS components
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
- [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) (Web Components)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) and modern responsive design

## Community

- **Mission:** Support, connect, and grow the local game development ecosystem.
- **Founders:** Cesare Montresor, Nicola Castellani, Eugenio Perinelli, Fabrizio Radica
- **Contact:** info@gamedevarena.it

---

Game Dev Arena © 2025. All rights reserved.

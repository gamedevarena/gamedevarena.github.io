// GDA — SPA: fetch data/site.json, render, hash-route between the 4 screens.
// No framework: the markup is small enough that direct DOM writes are simpler
// and lighter than shipping a component runtime for it.

const FALLBACK = {
  community: {
    intro: [
      "Una nuova community dedicata agli sviluppatori e appassionati di videogame del nordest italiano.",
      "L'iniziativa vuole creare connessioni, condividere conoscenze e far crescere l'ecosistema locale del game development.",
    ],
  },
  upcoming: {
    date: "2026-09-24T19:00:00+02:00",
    dateLabel: "24 Settembre 2026",
    title: "Titolo da definire",
    speaker: "Diego Zamprogno",
    location: "311 Verona",
    url: "",
    ticketLabel: "Biglietti in arrivo",
  },
  events: [],
  mission: [],
  activities: [],
  founders: [],
  partners: [],
  sponsors: [],
  contacts: [],
  links: {},
};

const MESI = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

const ROUTES = ["home", "eventi", "chi-siamo", "contatti"];

const ICON_COPY = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="1.5"></rect><path d="M5 15V5a1.5 1.5 0 0 1 1.5-1.5H15"></path></svg>';
const ICON_DONE = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 12.5 9.5 18 20 6.5"></polyline></svg>';

function pad(n) { return n < 10 ? "0" + n : String(n); }

function monthLabel(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.getDate() + " " + MESI[d.getMonth()] + " " + d.getFullYear();
}

// Content comes from data/site.json, and events/upcoming ultimately trace back
// to an externally-editable Google Sheet via n8n — escape before innerHTML.
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// This module lives at <site-root>/src/js/site.js on every deployment
// (production root, or a PR preview under /pr-preview/<n>/) — resolving
// against its own import.meta.url gives the right site root either way.
const ICONS_BASE = new URL("../../public/icons/", import.meta.url);

function icon(name) {
  // Used inside a CSS custom property (--icon): a *relative* url() there
  // resolves against the stylesheet that declares the rule (site.css), not
  // against the page, so this must stay a fully-resolved absolute URL.
  return new URL(`${name}.svg`, ICONS_BASE).href;
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

// ── tilt (pointer-tracked 3D card tilt, writes straight to style: no re-render) ──

function attachTilt(node, soft) {
  const strength = soft ? 7 : 16;
  node.addEventListener("mousemove", (e) => {
    const r = node.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    node.style.transition = "transform 0.12s ease-out, border-color 0.2s ease, box-shadow 0.25s ease";
    node.style.transform = `rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength).toFixed(2)}deg)`;
  });
  node.addEventListener("mouseleave", () => {
    node.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease, box-shadow 0.25s ease";
    node.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

// ── countdown ──────────────────────────────────────────────────────────────

let countdownTarget = null;
let countdownTimer = null;

function renderCountdown(container, target) {
  container.innerHTML = "";
  const units = [
    { label: "Giorni", key: "d" },
    { label: "Ore", key: "h" },
    { label: "Min", key: "m" },
    { label: "Sec", key: "s" },
  ];
  units.forEach((u) => {
    const box = el("div", "gda-countdown__unit");
    box.innerHTML = `<p class="gda-countdown__value" data-unit="${u.key}">00</p><p class="gda-countdown__label">${u.label}</p>`;
    container.appendChild(box);
  });
  countdownTarget = target;
  tickCountdown(container);
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => tickCountdown(container), 1000);
}

function tickCountdown(container) {
  const ms = new Date(countdownTarget).getTime() - Date.now();
  const clamped = isNaN(ms) || ms < 0 ? 0 : ms;
  const s = Math.floor(clamped / 1000);
  const vals = {
    d: pad(Math.floor(s / 86400)),
    h: pad(Math.floor((s % 86400) / 3600)),
    m: pad(Math.floor((s % 3600) / 60)),
    s: pad(s % 60),
  };
  Object.keys(vals).forEach((k) => {
    const node = container.querySelector(`[data-unit="${k}"]`);
    if (node) node.textContent = vals[k];
  });
}

// ── render sections ──────────────────────────────────────────────────────────

function renderIntro(container, lines) {
  container.innerHTML = "";
  (lines || []).forEach((line) => container.appendChild(el("p", null, esc(line))));
}

function renderIconCards(container, items) {
  container.innerHTML = "";
  (items || []).forEach((item) => {
    const card = el("div", "gda-card");
    card.innerHTML = `
      <span class="gda-card__icon" style="--icon: url('${esc(icon(item.icon))}')"></span>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.description)}</p>
    `;
    container.appendChild(card);
  });
}

function renderFounders(container, founders) {
  container.innerHTML = "";
  (founders || []).forEach((f) => {
    const card = el("div", "gda-founder gda-tilt");
    const bio = (f.bio || []).map((p) => `<p>${esc(p)}</p>`).join("");
    const highlight = f.bioHighlight ? `<p><span class="gda-highlight">${esc(f.bioHighlight)}</span></p>` : "";
    card.innerHTML = `
      <div class="gda-founder__head">
        <img src="${esc(f.avatar)}" alt="${esc(f.name)}" />
        <div>
          <h3>${esc(f.name)}</h3>
          <p class="gda-founder__role">${esc(f.role)}</p>
        </div>
      </div>
      <div class="gda-founder__bio">${bio}${highlight}</div>
    `;
    attachTilt(card, false);
    container.appendChild(card);
  });
}

function renderLogos(container, items, small) {
  container.innerHTML = "";
  (items || []).forEach((item) => {
    const link = el("a", `gda-logo gda-tilt${small ? " gda-logo--sm" : ""}`);
    link.href = item.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = item.name;
    link.innerHTML = `<img src="${esc(item.logo)}" alt="${esc(item.name)}" />`;
    attachTilt(link, false);
    container.appendChild(link);
  });
}

function fallbackCopy(value) {
  const ta = document.createElement("textarea");
  ta.value = value;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (err) { /* best-effort */ }
  document.body.removeChild(ta);
}

function copyToClipboard(value) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Permissions can silently deny/hang here (e.g. no user-activation, no
    // clipboard-write permission): always fall back so the UI still confirms.
    return navigator.clipboard.writeText(value).catch(() => fallbackCopy(value));
  }
  fallbackCopy(value);
  return Promise.resolve();
}

function renderContacts(container, contacts) {
  container.innerHTML = "";
  (contacts || []).forEach((c) => {
    const row = el("div", "gda-contact");
    row.innerHTML = `
      <span class="gda-contact__label"><span class="gda-card__icon" style="--icon: url('${esc(icon(c.icon))}')"></span>${esc(c.label)}</span>
      <span class="gda-contact__value">
        <a href="${esc(c.href)}" target="_blank" rel="noopener noreferrer">${esc(c.value)}</a>
        <button type="button" class="gda-copy" title="Copia" aria-label="Copia">${ICON_COPY}</button>
      </span>
    `;
    const btn = row.querySelector(".gda-copy");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      copyToClipboard(c.value).then(() => {
        btn.innerHTML = ICON_DONE;
        btn.classList.add("is-copied");
        btn.title = "Copiato";
        clearTimeout(btn._t);
        btn._t = setTimeout(() => {
          btn.innerHTML = ICON_COPY;
          btn.classList.remove("is-copied");
          btn.title = "Copia";
        }, 1600);
      });
    });
    container.appendChild(row);
  });
}

function groupByYear(events) {
  const buckets = {};
  (events || []).forEach((ev) => {
    const year = String(ev.date || "").slice(0, 4) || "—";
    if (!buckets[year]) buckets[year] = [];
    buckets[year].push(ev);
  });
  return Object.keys(buckets)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({ year, items: buckets[year] }));
}

function renderEventYears(container, events) {
  container.innerHTML = "";
  groupByYear(events).forEach((group) => {
    const section = el("section", "gda-year");
    const count = group.items.length;
    section.innerHTML = `
      <div class="gda-year__head">
        <h2>${esc(group.year)}</h2>
        <span>${count} ${count === 1 ? "evento" : "eventi"}</span>
      </div>
      <div class="gda-grid gda-grid--events"></div>
    `;
    const grid = section.querySelector(".gda-grid--events");
    group.items.forEach((ev) => {
      const label = ev.dateLabel || monthLabel(ev.date);
      const card = el("div", "gda-event gda-tilt");
      card.innerHTML = `
        <img src="${esc(ev.image)}" alt="Evento del ${esc(label)}" />
        <div class="gda-event__body">
          <p class="gda-event__date">${esc(label)}</p>
          ${ev.title ? `<p class="gda-event__title">${esc(ev.title)}</p>` : ""}
        </div>
      `;
      attachTilt(card, false);
      grid.appendChild(card);
    });
    container.appendChild(section);
  });
}

// ── routing ──────────────────────────────────────────────────────────────────

function readRoute() {
  const raw = (location.hash || "").replace(/^#\/?/, "").split("?")[0];
  return ROUTES.indexOf(raw) >= 0 ? raw : "home";
}

function applyRoute() {
  document.body.dataset.route = readRoute();
  window.scrollTo(0, 0);
}

// ── boot ─────────────────────────────────────────────────────────────────────

async function loadData() {
  try {
    const res = await fetch("data/site.json", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch (err) {
    console.warn("[GDA] feed non disponibile, uso i dati di fallback:", err);
    return FALLBACK;
  }
}

function setText(selector, value) {
  document.querySelectorAll(`[data-out="${selector}"]`).forEach((n) => { n.textContent = value || ""; });
}

function render(data) {
  const up = data.upcoming || {};
  const links = data.links || {};
  const hasTicket = !!up.url;

  setText("upcoming-date", up.dateLabel || monthLabel(up.date));
  setText("upcoming-title", up.title || "");
  setText("upcoming-speaker", up.speaker || "");
  setText("upcoming-location", up.location || "");
  setText("upcoming-cta-label", hasTicket ? "Prenota il posto" : up.ticketLabel || "Biglietti in arrivo");
  document.querySelectorAll('[data-link="upcoming-cta"]').forEach((n) => {
    n.href = hasTicket ? up.url : links.speakerForm || "#/contatti";
  });
  renderCountdown(document.querySelector('[data-out="countdown"]'), up.date);

  const intro = (data.community && data.community.intro) || [];
  renderIntro(document.querySelector('[data-out="home-intro"]'), intro);
  renderIntro(document.querySelector('[data-out="about-intro"]'), intro);

  const events = data.events || [];
  setText("event-count", events.length);
  renderEventYears(document.querySelector('[data-out="event-years"]'), events);

  renderIconCards(document.querySelector('[data-out="mission"]'), data.mission);
  renderIconCards(document.querySelector('[data-out="activities"]'), data.activities);
  renderFounders(document.querySelector('[data-out="founders"]'), data.founders);
  renderLogos(document.querySelector('[data-out="partners"]'), data.partners, false);
  renderLogos(document.querySelector('[data-out="sponsors"]'), data.sponsors, true);
  renderContacts(document.querySelector('[data-out="contacts"]'), data.contacts);

  document.querySelectorAll('[data-link="speakerForm"]').forEach((n) => { n.href = links.speakerForm || "#/contatti"; });
  document.querySelectorAll('[data-link="sponsorMail"]').forEach((n) => { n.href = links.sponsorMail || "#/contatti"; });
  document.querySelectorAll('[data-link="newsletterAction"]').forEach((n) => {
    if (links.newsletterAction) n.action = links.newsletterAction;
  });
}

document.querySelectorAll(".gda-tilt[data-tilt]").forEach((n) => attachTilt(n, n.dataset.tilt === "soft"));

window.addEventListener("hashchange", applyRoute);
applyRoute();

loadData().then(render);

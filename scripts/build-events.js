#!/usr/bin/env node
'use strict';

/**
 * GDA — build eventi
 *
 * Legge events.json (scritto da n8n) + events-legacy.json (statico, scritto a mano)
 * e riscrive tre cose:
 *   1. il blocco hero di index.html      -> link Eventbrite + locandina desktop/mobile
 *   2. la griglia "Eventi Passati"       -> una card per evento concluso
 *   3. eventbrite-url.json               -> consumato da upcoming-event.html
 *
 * Idempotente: rilanciarlo sullo stesso input riproduce lo stesso output.
 * Nessuna dipendenza esterna: solo moduli nativi di Node.
 *
 * Uso:  node scripts/build-events.js [--check]
 *       --check  non scrive niente, esce 1 se l'output differisce da quello su disco
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const F = {
  events: path.join(ROOT, 'events.json'),
  legacy: path.join(ROOT, 'events-legacy.json'),
  index: path.join(ROOT, 'index.html'),
  ebUrl: path.join(ROOT, 'eventbrite-url.json'),
};

const CHECK = process.argv.includes('--check');

const MARK = {
  hero: ['<!-- GDA:HERO:START -->', '<!-- GDA:HERO:END -->'],
  past: ['<!-- GDA:PAST:START -->', '<!-- GDA:PAST:END -->'],
};

const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

const log = (...a) => console.log('[build-events]', ...a);
const fail = (msg) => { console.error('[build-events] ERRORE:', msg); process.exit(1); };

/** Escape per attributi HTML: i titoli arrivano dal foglio e possono contenere " o &. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** "2026-03-12" -> "12 Marzo 2026". Ritorna '' se la data non e' valida. */
function dataEstesa(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
  if (!m) return '';
  const [, y, mo, d] = m;
  const mese = MESI[Number(mo) - 1];
  if (!mese) return '';
  return `${Number(d)} ${mese} ${y}`;
}

/** "Evento del 12 Marzo 2026" / "Evento dell'11 Dicembre 2025" (8 e 11 vogliono l'elisione). */
function altText(iso) {
  const esteso = dataEstesa(iso);
  if (!esteso) return 'Evento Game Dev Arena';
  const giorno = Number(iso.slice(8, 10));
  const art = (giorno === 8 || giorno === 11) ? "dell'" : 'del ';
  return `Evento ${art}${esteso}`;
}

function leggiJson(file, obbligatorio) {
  if (!fs.existsSync(file)) {
    if (obbligatorio) fail(`file mancante: ${path.relative(ROOT, file)}`);
    log(`${path.relative(ROOT, file)} assente, ignorato`);
    return { events: [] };
  }
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    fail(`${path.relative(ROOT, file)} non e' JSON valido: ${e.message}`);
  }
  if (!raw || !Array.isArray(raw.events)) {
    fail(`${path.relative(ROOT, file)}: manca l'array "events"`);
  }
  return raw;
}

/**
 * Percorso immagine di un evento.
 * Legacy: campo "image" esplicito (file flat, nomi storici irregolari).
 * Nuovi:  derivato da event_id -> public/events/<id>/<nome>.jpg
 */
function imgPath(ev, nome) {
  if (ev.image) return ev.image;
  if (!ev.id) return '';
  return `public/events/${ev.id}/${nome}.jpg`;
}

function rimpiazzaBlocco(html, [start, end], contenuto, nome) {
  const i = html.indexOf(start);
  const j = html.indexOf(end);
  if (i === -1 || j === -1) {
    fail(`marker ${nome} non trovati in index.html. Attesi:\n  ${start}\n  ${end}`);
  }
  if (j < i) fail(`marker ${nome} invertiti in index.html`);
  return html.slice(0, i + start.length) + contenuto + html.slice(j);
}

// ── raccolta dati ────────────────────────────────────────────────────────────

const evJson = leggiJson(F.events, false);
const legacy = leggiJson(F.legacy, false);

const nuovi = evJson.events.filter((e) => e && (e.id || e.image));
const upcoming = nuovi.filter((e) => String(e.status || '').toLowerCase() === 'upcoming');

if (upcoming.length > 1) {
  log(`ATTENZIONE: ${upcoming.length} eventi "upcoming", uso il piu' vicino nel tempo`);
}
upcoming.sort((a, b) => String(a.date).localeCompare(String(b.date)));
const prossimo = upcoming[0] || null;

const passati = nuovi
  .filter((e) => String(e.status || '').toLowerCase() !== 'upcoming')
  .concat(legacy.events.filter((e) => e && (e.image || e.id)))
  .filter((e) => {
    if (dataEstesa(e.date)) return true;
    log(`evento scartato, data non valida: ${JSON.stringify(e.date)}`);
    return false;
  })
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));

// ── generazione blocchi ──────────────────────────────────────────────────────

function bloccoHero(ev) {
  const desktop = imgPath(ev, 'hero');
  const mobile = imgPath(ev, 'hero-mobile');
  const label = ev.title ? `Vai a "${ev.title}" su Eventbrite` : "Vai all'evento su Eventbrite";
  return `
    <a href="${esc(ev.eb_url)}" target="_blank" aria-label="${esc(label)}" class="w-full flex justify-center">
      <picture class="w-full">
      <source
        media="(min-width: 768px)"
        srcset="${esc(desktop)}"
      />
      <img
        src="${esc(mobile)}"
        alt="${esc(ev.title || 'Prossimo evento Game Dev Arena')}"
        class="w-full h-auto"
        style="object-fit: contain; max-width: 100%; height: auto;"
      />
    </picture>
    </a>
    `;
}

function bloccoPassati(lista) {
  if (!lista.length) return '\n      ';
  const cards = lista.map((ev) => {
    const src = imgPath(ev, 'hero');
    return `        <div class="event-image-card radius-lg overflow-hidden">
          <img src="${esc(src)}"
               alt="${esc(ev.title ? ev.title : altText(ev.date))}"
               class="w-full h-auto"
               style="object-fit: cover;" />
        </div>`;
  });
  return `\n${cards.join('\n')}\n      `;
}

// ── scrittura ────────────────────────────────────────────────────────────────

let html = fs.readFileSync(F.index, 'utf8');
const htmlPrima = html;

if (prossimo && prossimo.eb_url) {
  html = rimpiazzaBlocco(html, MARK.hero, bloccoHero(prossimo), 'HERO');
  log(`hero: ${prossimo.id} — ${prossimo.title || '(senza titolo)'}`);
} else {
  // Nessun evento futuro: l'hero resta quello che c'e' gia'. Non lo svuotiamo,
  // altrimenti la home mostrerebbe un buco fino al prossimo talk.
  if (html.indexOf(MARK.hero[0]) === -1) fail('marker HERO non trovati in index.html');
  log('nessun evento upcoming: hero lasciato invariato');
}

html = rimpiazzaBlocco(html, MARK.past, bloccoPassati(passati), 'PAST');
log(`eventi passati: ${passati.length}`);

const ebJson = prossimo && prossimo.eb_url
  ? JSON.stringify({
      latestEventUrl: prossimo.eb_url,
      updatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      eventName: prossimo.title || '',
    }, null, 2) + '\n'
  : null;

if (CHECK) {
  const diffHtml = html !== htmlPrima;
  log(diffHtml ? 'index.html: DIFFERENTE da quello su disco' : 'index.html: allineato');
  process.exit(diffHtml ? 1 : 0);
}

if (html !== htmlPrima) {
  fs.writeFileSync(F.index, html, 'utf8');
  log('index.html aggiornato');
} else {
  log('index.html gia\' allineato, non riscritto');
}

if (ebJson !== null) {
  const vecchio = fs.existsSync(F.ebUrl) ? fs.readFileSync(F.ebUrl, 'utf8') : '';
  // updatedAt cambia a ogni run: confronto solo i campi che contano.
  const stessoUrl = (() => {
    try {
      const v = JSON.parse(vecchio);
      return v.latestEventUrl === prossimo.eb_url && v.eventName === (prossimo.title || '');
    } catch (e) { return false; }
  })();
  if (stessoUrl) {
    log('eventbrite-url.json gia\' allineato, non riscritto');
  } else {
    fs.writeFileSync(F.ebUrl, ebJson, 'utf8');
    log('eventbrite-url.json aggiornato');
  }
} else {
  log('nessun evento upcoming: eventbrite-url.json lasciato invariato');
}

log('fatto.');

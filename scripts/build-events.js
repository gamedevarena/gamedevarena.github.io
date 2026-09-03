#!/usr/bin/env node
'use strict';

/**
 * GDA — build eventi
 *
 * Legge events.json (scritto da n8n) + events-legacy.json (statico, scritto a mano)
 * e riscrive due cose dentro data/site.json (il feed che alimenta index.html):
 *   1. "events"  -> archivio eventi passati
 *   2. "upcoming" -> prossimo evento, SOLO se c'e' un evento con status "upcoming" e eb_url.
 *                    Se non c'e', "upcoming" resta quello gia' su disco (puo' essere
 *                    un evento annunciato a mano, in attesa del biglietto Eventbrite).
 * Riscrive anche eventbrite-url.json, consumato da upcoming-event.html.
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
  site: path.join(ROOT, 'data', 'site.json'),
  ebUrl: path.join(ROOT, 'eventbrite-url.json'),
};

const CHECK = process.argv.includes('--check');

// Ora di default per gli eventi pubblicati da n8n: events.json porta solo la
// data (AAAA-MM-GG), non l'orario. Le serate GDA sono sempre alle 19:00.
const ORA_DEFAULT = '19:00:00';
const FUSO_DEFAULT = '+02:00';

const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

const log = (...a) => console.log('[build-events]', ...a);
const fail = (msg) => { console.error('[build-events] ERRORE:', msg); process.exit(1); };

/** "2026-03-12" -> "12 Marzo 2026". Ritorna '' se la data non e' valida. */
function dataEstesa(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
  if (!m) return '';
  const [, y, mo, d] = m;
  const mese = MESI[Number(mo) - 1];
  if (!mese) return '';
  return `${Number(d)} ${mese} ${y}`;
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

// ── raccolta dati ────────────────────────────────────────────────────────────

const evJson = leggiJson(F.events, false);
const legacy = leggiJson(F.legacy, false);

if (!fs.existsSync(F.site)) fail(`file mancante: ${path.relative(ROOT, F.site)}`);
let site;
try {
  site = JSON.parse(fs.readFileSync(F.site, 'utf8'));
} catch (e) {
  fail(`${path.relative(ROOT, F.site)} non e' JSON valido: ${e.message}`);
}

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

// ── data/site.json ──────────────────────────────────────────────────────────

const sitePrima = JSON.stringify(site);

site.events = passati.map((ev) => ({
  date: ev.date,
  dateLabel: dataEstesa(ev.date),
  image: imgPath(ev, 'hero'),
  title: ev.title || '',
}));

if (prossimo && prossimo.eb_url) {
  const ora = prossimo.time || ORA_DEFAULT;
  site.upcoming = Object.assign({}, site.upcoming, {
    date: `${prossimo.date}T${ora}${FUSO_DEFAULT}`,
    dateLabel: dataEstesa(prossimo.date),
    title: prossimo.title || (site.upcoming && site.upcoming.title) || '',
    speaker: prossimo.speaker || (site.upcoming && site.upcoming.speaker) || '',
    location: prossimo.location || (site.upcoming && site.upcoming.location) || '',
    url: prossimo.eb_url,
  });
  log(`upcoming: ${prossimo.id || prossimo.date} — ${prossimo.title || '(senza titolo)'}`);
} else {
  // Nessun evento futuro con biglietto pubblicato: "upcoming" resta quello gia'
  // su disco (puo' essere un evento annunciato a mano, senza link Eventbrite).
  log('nessun evento upcoming con eb_url: campo "upcoming" lasciato invariato');
}

log(`eventi passati: ${passati.length}`);

const siteDiverso = JSON.stringify(site) !== sitePrima;

const ebJson = prossimo && prossimo.eb_url
  ? JSON.stringify({
      latestEventUrl: prossimo.eb_url,
      updatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      eventName: prossimo.title || '',
    }, null, 2) + '\n'
  : null;

if (CHECK) {
  log(siteDiverso ? 'data/site.json: DIFFERENTE da quello su disco' : 'data/site.json: allineato');
  process.exit(siteDiverso ? 1 : 0);
}

if (siteDiverso) {
  site.generated_at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  fs.writeFileSync(F.site, JSON.stringify(site, null, 2) + '\n', 'utf8');
  log('data/site.json aggiornato');
} else {
  log('data/site.json gia\' allineato, non riscritto');
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

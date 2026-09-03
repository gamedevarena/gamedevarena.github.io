// GDA flyer generator — shared poster template, driven by one data object.
// renderPoster() fills every frame variant (hero / hero-mobile / post / story)
// from the same data, so a future automated path (n8n -> headless Chrome)
// can call it the same way this form does.
//
// Text markup, matching the existing Slides workflow (see AUTOMAZIONE.md):
//   // -> line break
//   ==word== -> gold highlight

const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

const FRAMES = [
  { key: 'hero', kind: 'web', file: 'hero.jpg', exportW: 1956, exportH: 1200 },
  { key: 'hero-mobile', kind: 'web', file: 'hero-mobile.jpg', exportW: 1100, exportH: 1528 },
  { key: 'post', kind: 'social', file: 'post.jpg', exportW: 1080, exportH: 1350 },
  { key: 'story', kind: 'social', file: 'story.jpg', exportW: 1080, exportH: 1920 },
  { key: 'locandina', kind: 'print', file: 'locandina.jpg', exportW: 3508, exportH: 4960 },
];

const DATE_BLOCK_MARKUP = `
  <p class="weekday"></p>
  <p class="day"></p>
  <p class="location"><span class="at">@</span> <span class="loc-text"></span> <span class="year-tag"></span></p>
`;

const WEB_MARKUP = `
  <div class="photo-panel">
    <div class="photo"></div>
    <div class="date-block">${DATE_BLOCK_MARKUP}</div>
  </div>
  <div class="content-card">
    <span class="quote-glyph">&ldquo;</span>
    <div class="card-columns">
      <div class="title-col">
        <h1 class="title"></h1>
        <p class="subtitle"></p>
      </div>
      <div class="speaker-block">
        <p class="name"></p>
        <p class="role"></p>
      </div>
    </div>
    <p class="cta">Clicca e prenota!</p>
  </div>
`;

const SOCIAL_MARKUP = `
  <div class="gda-logo"><img src="/public/logo.webp" alt="GDA" /></div>
  <div class="decor-circle"></div>
  <div class="decor-circle"></div>
  <div class="date-block date-block--pill">${DATE_BLOCK_MARKUP}</div>
  <span class="quote-glyph">&ldquo;</span>
  <h1 class="title"></h1>
  <p class="subtitle"></p>
  <div class="speaker-block speaker-box">
    <p class="name"></p>
    <p class="role"></p>
  </div>
`;

const PRINT_MARKUP = `
  <div class="locandina-wordmark">
    <span class="icon-crop"><img src="/public/logo.webp" alt="GDA" /></span>
    <span>GAME DEV<br>ARENA.it</span>
  </div>
  <img class="locandina-swoosh" src="/public/locandina-top-left-decoration.svg" alt="" />
  <div class="photo locandina-photo"></div>
  <div class="speaker-block speaker-box locandina-speaker">
    <p class="name"></p>
    <p class="role"></p>
  </div>
  <div class="title-row">
    <div class="left-image"></div>
    <div class="title-col">
      <p class="episode-tag"></p>
      <h1 class="title"></h1>
      <p class="subtitle"></p>
    </div>
  </div>
  <div class="content-grid">
    <div class="description-col">
      <span class="quote-glyph">&ldquo;</span>
      <p class="description"></p>
    </div>
    <div class="date-venue-col">
      <div class="date-block">${DATE_BLOCK_MARKUP}</div>
      <p class="venue-details"></p>
      <div class="reg-row">
        <div class="qr-box reg-qr-box"><img src="/public/qr/registrazione.svg" alt="QR Registrazione" /></div>
        <p class="reg-text">Registrazione<br>Gratuita</p>
      </div>
    </div>
    <div class="telegram-row">
      <div class="qr-box telegram-qr"></div>
      <p class="telegram-text">Seguici ed entra<br>nel gruppo Telegram</p>
    </div>
    <div class="program-block">
      <h3>Programma</h3>
      <p class="program-lines"></p>
    </div>
  </div>
  <img class="partner-strip" src="/public/locandina-footer.svg" alt="" />
`;

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function parseInline(text) {
  return esc(text)
    .split('//')
    .map((line) => line.replace(/==(.+?)==/g, '<span class="hl">$1</span>'))
    .join('<br>');
}

function dataUrlFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dayMonthLabel(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || '');
  if (!m) return { weekday: '', day: '', year: '' };
  const d = new Date(`${isoDate}T12:00:00`);
  return { weekday: GIORNI[d.getDay()], day: `${Number(m[3])} ${MESI[Number(m[2]) - 1]}`, year: m[1] };
}

function renderPoster(frameEl, data) {
  const { weekday, day, year } = dayMonthLabel(data.date);
  frameEl.querySelector('.weekday').textContent = weekday;
  frameEl.querySelector('.day').textContent = day;
  frameEl.querySelector('.loc-text').textContent = data.location || '';
  frameEl.querySelector('.year-tag').textContent = year ? `\\${year}` : '';

  frameEl.querySelector('.title').innerHTML = parseInline(data.title) || 'Titolo evento';
  frameEl.querySelector('.subtitle').innerHTML = parseInline(data.subtitle);
  frameEl.querySelector('.name').textContent = data.speaker || '';
  frameEl.querySelector('.role').innerHTML = parseInline(data.speakerRole);

  const photo = frameEl.querySelector('.photo');
  if (photo) photo.style.backgroundImage = data.bgImage ? `url("${data.bgImage}")` : 'none';
  const leftImage = frameEl.querySelector('.left-image');
  if (leftImage) leftImage.style.backgroundImage = data.leftImage ? `url("${data.leftImage}")` : 'none';

  const episodeTag = frameEl.querySelector('.episode-tag');
  if (episodeTag) {
    const season = String(data.season || '1').padStart(2, '0');
    const episode = String(data.episode || '1').padStart(2, '0');
    episodeTag.innerHTML = `s${season}<span class="hl">e${episode}</span>`;
  }
  const description = frameEl.querySelector('.description');
  if (description) description.innerHTML = parseInline(data.description);
  const venueDetails = frameEl.querySelector('.venue-details');
  if (venueDetails) venueDetails.innerHTML = parseInline(data.venueDetails);
  const programLines = frameEl.querySelector('.program-lines');
  if (programLines) programLines.innerHTML = parseInline(data.program);

  const regQrBox = frameEl.querySelector('.reg-qr-box');
  if (regQrBox && data.regQrImage) {
    regQrBox.innerHTML = `<img src="${data.regQrImage}" alt="QR Registrazione" />`;
  }
}

// Telegram QR is "fisso" (AUTOMAZIONE.md): same code on every poster, pointing
// at the Telegram group already listed in site.json — generated client-side,
// no external QR API call. Rendered to a canvas then swapped for a plain
// <img src="data:...">, since html-to-image can't reliably capture live
// <canvas> content when serializing the DOM for export.
// The registration QR is a separate fixed asset (public/qr/registrazione.svg,
// set in FRAME markup) and can be overridden with a user-uploaded QR image
// (see .qrImage handling in renderPoster).
function qrDataUrl(text) {
  const scratch = document.createElement('div');
  // eslint-disable-next-line no-undef
  new QRCode(scratch, { text, width: 400, height: 400, colorDark: '#1d1d1b', colorLight: '#ffffff' });
  return scratch.querySelector('canvas').toDataURL('image/png');
}

async function renderQr(frameEl) {
  const telegramBox = frameEl.querySelector('.telegram-qr');
  if (!telegramBox) return;
  const site = await fetch('/data/site.json').then((r) => r.json()).catch(() => null);
  const telegram = site?.contacts?.find((c) => c.icon === 'send')?.href || 'https://t.me/GameDevArena';
  const dataUrl = qrDataUrl(telegram);
  telegramBox.innerHTML = `<img src="${dataUrl}" alt="QR Telegram" />`;
}

function readForm(form) {
  const fd = new FormData(form);
  return {
    eventId: fd.get('eventId') || '',
    title: fd.get('title') || '',
    subtitle: fd.get('subtitle') || '',
    speaker: fd.get('speaker') || '',
    speakerRole: fd.get('speakerRole') || '',
    location: fd.get('location') || '',
    date: fd.get('date') || '',
    season: fd.get('season') || '',
    episode: fd.get('episode') || '',
    description: fd.get('description') || '',
    venueDetails: fd.get('venueDetails') || '',
    program: fd.get('program') || '',
  };
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

async function exportFrame(frameEl, frameSpec) {
  await document.fonts.ready;
  const pixelRatio = frameSpec.exportW / frameEl.clientWidth;
  const dataUrl = await htmlToImage.toJpeg(frameEl, { quality: 0.95, pixelRatio });
  downloadDataUrl(dataUrl, frameSpec.file);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('flyer-form');
  const bgInput = document.getElementById('bgImage');
  const leftImageInput = document.getElementById('leftImage');
  const regQrInput = document.getElementById('regQrImage');
  const frameEls = {};
  let bgImage = '';
  let leftImage = '';
  let regQrImage = '';

  const MARKUP_BY_KIND = { web: WEB_MARKUP, social: SOCIAL_MARKUP, print: PRINT_MARKUP };

  for (const spec of FRAMES) {
    const el = document.querySelector(`.frame[data-frame="${spec.key}"]`);
    el.innerHTML = MARKUP_BY_KIND[spec.kind];
    frameEls[spec.key] = el;
    if (spec.kind === 'print') renderQr(el);

    const btn = el.closest('.preview').querySelector('button[data-export]');
    btn.addEventListener('click', () => exportFrame(el, spec));
  }

  function rerender() {
    const data = { ...readForm(form), bgImage, leftImage, regQrImage };
    for (const spec of FRAMES) renderPoster(frameEls[spec.key], data);
    document.querySelectorAll('.target-path').forEach((el) => {
      el.textContent = data.eventId
        ? `public/events/${data.eventId}/`
        : 'public/events/<event_id>/';
    });
  }

  form.addEventListener('input', rerender);

  bgInput.addEventListener('change', async () => {
    const file = bgInput.files[0];
    if (!file) return;
    bgImage = await dataUrlFromFile(file);
    rerender();
  });

  leftImageInput.addEventListener('change', async () => {
    const file = leftImageInput.files[0];
    if (!file) return;
    leftImage = await dataUrlFromFile(file);
    rerender();
  });

  regQrInput.addEventListener('change', async () => {
    const file = regQrInput.files[0];
    if (!file) return;
    regQrImage = await dataUrlFromFile(file);
    rerender();
  });

  document.getElementById('export-all').addEventListener('click', async () => {
    for (const spec of FRAMES) await exportFrame(frameEls[spec.key], spec);
  });

  rerender();
});

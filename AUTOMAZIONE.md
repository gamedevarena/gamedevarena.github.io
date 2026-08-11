# Automazione eventi — regole

Il sito è alimentato in parte da **n8n** (workflow "GDA"), che scrive nel repo via GitHub API.
Questo documento dice chi tocca cosa. Se lo ignori, il prossimo deploy sovrascrive il tuo lavoro.

---

## Chi scrive cosa

| File | Chi lo scrive | Note |
|---|---|---|
| `events.json` | **n8n** | Riscritto **per intero** a ogni pubblicazione. Non modificarlo a mano: la modifica sparisce al commit successivo. |
| `events-legacy.json` | **tu, a mano** | Eventi precedenti all'automazione. n8n non lo apre mai. |
| `public/events/<event_id>/` | **n8n** | Immagini prese da Google Drive e committate as-is. |
| `index.html` — blocchi tra i marker | **lo script di build** | Vedi sotto. |
| `eventbrite-url.json` | **lo script di build** | Consumato da `upcoming-event.html`. |
| tutto il resto | **tu** | CSS, componenti, sezioni non marcate. |

---

## I marker in `index.html`

Due blocchi sono rigenerati automaticamente. **Quello che scrivi dentro viene cancellato.**

```html
<!-- GDA:HERO:START -->   ... locandina + link Eventbrite ...   <!-- GDA:HERO:END -->
<!-- GDA:PAST:START -->   ... griglia eventi passati ...        <!-- GDA:PAST:END -->
```

Se cancelli un marker il build fallisce con un errore esplicito e **il deploy si ferma**: il sito
online resta quello di prima. È voluto — meglio un deploy mancato che una home rotta.

Per cambiare l'aspetto di quei blocchi si modifica il *template* dentro
`scripts/build-events.js` (funzioni `bloccoHero` e `bloccoPassati`), non l'HTML generato.

---

## Il build

```bash
npm run build          # rigenera index.html + eventbrite-url.json
npm run build:check    # non scrive niente, esce 1 se qualcosa è disallineato
npm run dev            # build + server locale su http://localhost:6969
```

Node puro, nessuna dipendenza. Gira anche in CI: lo step "Build eventi" di
`.github/workflows/static.yml` lo esegue a ogni push su `main`, prima del deploy.

**Non serve committare l'`index.html` rigenerato**: ci pensa la CI. Se lo committi comunque non
succede niente di male, il risultato è identico.

---

## `event_id`

Formato `gda-NNN` — `gda-001`, `gda-002`, … Lo scrivi **tu** nel Google Sheet quando crei la riga.

> **Si scrive una volta e non si tocca mai più, nemmeno se la data dell'evento cambia.**

È la chiave di tutto: cambiarlo dopo la prima pubblicazione fa ripubblicare l'evento da capo su
tutti i canali e rende orfana la cartella immagini. Se la data slitta, aggiorna `event_date` nel
foglio e basta.

---

## Immagini

Tre file per evento, nomi fissi, dentro `public/events/<event_id>/`:

| File | Uso |
|---|---|
| `hero.jpg` | Locandina desktop (hero + griglia quando l'evento è passato) |
| `hero-mobile.jpg` | Locandina mobile (crop verticale) |
| `post.jpg` | Post Instagram (fase 4) |

**JPEG, non webp**: Instagram accetta solo JPEG e non conviene mantenere due formati. Le
locandine storiche sono `.webp` flat in `public/events/` e restano dove sono — `events-legacy.json`
le referenzia con un campo `image` esplicito.

Le carichi in Google Drive nella cartella dell'evento; n8n le committa senza convertirle.

---

## Cosa succede quando qualcosa va storto

| Sintomo | Causa | Rimedio |
|---|---|---|
| Deploy fallito, mail da GitHub | JSON malformato o marker mancante | Leggi il log dell'Action: lo script stampa il motivo. Il sito online non è cambiato. |
| Un evento non compare nella griglia | `date` non nel formato `AAAA-MM-GG` | Il log del build lo dice: `evento scartato, data non valida`. |
| L'hero mostra ancora l'evento vecchio | Nessun evento con `status: upcoming` in `events.json` | Voluto: senza evento futuro l'hero non viene toccato, così la home non resta vuota. |
| Immagine rotta nella griglia | Cartella `public/events/<event_id>/` mancante o file con nome diverso | I nomi sono fissi: `hero.jpg`, `hero-mobile.jpg`, `post.jpg`. |

---

## Schema `events.json`

```json
{
  "generated_at": "2026-08-11T10:00:00+02:00",
  "events": [
    {
      "id": "gda-001",
      "date": "2026-09-17",
      "title": "Titolo del talk",
      "eb_url": "https://www.eventbrite.it/e/...",
      "status": "upcoming"
    }
  ]
}
```

`status`: `upcoming` (va nell'hero) oppure qualsiasi altro valore (va tra i passati).
Se ci sono più `upcoming`, il build usa quello con la data più vicina e avvisa nel log.
`generated_at` è solo diagnostico, lo script lo ignora.

# LeadAgent

LeadAgent turns live market signals into explainable, ready-to-contact B2B opportunities.

## Stack

- Xano: database, REST API, SerpApi orchestration, AI qualification, pipeline state
- SerpApi Google News: live funding and growth evidence
- React/Vite: research form and ranked lead dashboard
- Nutrient DWS: server-side PDF intelligence brief export

## Local setup

1. Copy `.env.example` to `.env` and set `VITE_XANO_API_BASE` after the Xano API group is deployed.
2. Add `SERPAPI_API_KEY` under Xano Dashboard > Keys & Variables. Never expose it in Vite variables.
3. Add `NUTRIENT_API_KEY` under Xano Dashboard > Keys & Variables for PDF generation.
4. Run `npm install` and `npm run dev`.

## Xano workflow

The Xano workspace source lives in `xano/`.

```bash
xano workspace pull -w 168182 -d xano
xano workspace push -w 168182 -d xano --dry-run
xano workspace push -w 168182 -d xano
```

## AI qualification

`POST /research` passes the saved Google News evidence to the tool-free Xano
`Lead Qualification Agent`. The agent is grounded to those results, deduplicates
companies, scores fit and urgency, explains why each lead matters now, and drafts
source-backed outreach. The frontend consumes `qualification` when available and
falls back to the existing deterministic parser if the agent returns no usable leads.

The current agent uses Xano's free development model, so no model credential is
stored in the repository or exposed to Vite.

## PDF generation

`POST /pdf/generate` accepts complete HTML and an optional `.pdf` filename. Xano
uploads the HTML to Nutrient DWS Processor API and returns the PDF as base64 with
its filename and MIME type. Returning the bytes inline avoids exposing the
Nutrient credential and works on Xano plans without server-side file storage.
`NUTRIENT_API_KEY` stays in Xano and is never returned to the browser.

```json
{
  "html": "<!doctype html><html><body><h1>Lead brief</h1></body></html>",
  "filename": "lead-brief.pdf"
}
```

## Company enrichment

After qualification, the frontend calls `POST /companies/enrich` for up to five
companies. Xano performs the Google enrichment search through SerpApi and keeps
`SERPAPI_API_KEY` server-side. Knowledge Graph data and relevant organic results
are normalized into the company website, logo, description, social profiles,
careers/contact pages, and other useful company links. Article evidence remains
separate and fully linked in every company card.

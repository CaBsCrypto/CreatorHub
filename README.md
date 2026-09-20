# 🎬 CreatorHub

> Operations platform connecting content creators with clients — onboarding, delivery, review and analytics in one place.

<p>
<img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white">
<img alt="Supabase" src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white">
<img alt="Gemini" src="https://img.shields.io/badge/Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white">
<img alt="Express" src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white">
</p>

**[→ Live](https://creator-hub-three-lake.vercel.app)**

## What it does

Three roles, three views, one pipeline:

| Role | Gets |
| :-- | :-- |
| **Creator** | Their assignments, deliverables and performance |
| **Client** | Progress on their campaigns and content under review |
| **Admin** | The whole board — onboarding console, scraper logs, analytics |

Plus a **public review page** so a client can approve work without needing an account.

- AI assistance for content work (Gemini)
- Transactional email via Resend
- Scraping service with its own logging layer
- Bilingual UI (`translations.ts`)
- Rate limiting, Helmet and CORS on the API

## Stack

React · TypeScript · Vite · Tailwind · Supabase · Google Gemini · Express · Resend · Google APIs · Recharts · Framer Motion

## Run it

```bash
npm install
cp .env.example .env      # Supabase, Gemini, Resend keys
npm run dev
```

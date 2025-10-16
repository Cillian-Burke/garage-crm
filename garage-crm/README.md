# Garage CRM (Next.js + Supabase + n8n)

Prelinked to your Supabase project and n8n webhooks.

## 1) Install
```bash
npm install
```

## 2) Run
```bash
npm run dev
# http://localhost:3000
```

## 3) Login
- Create a user in Supabase Auth (email/password). For testing, you can use `skibidi@email.ie`.
- On login, the app loads the matching row from `public.clients` where `id = user.id` to fetch sender defaults and timezone.

## 4) Pages
- `/login` — Email/password auth via Supabase.
- `/dashboard` — KPI cards + counts (filtered by `client_id = user.id`).
- `/settings` — Update timezone in `public.clients`.
- `/confirm-booking` — Calls n8n booking confirmation webhook with `bookingId`, `start`, `end` query params.
- `/job-cards/upload` — Uploads a file to n8n media webhook with `client_id` & `job_card_id`.

## 5) Environment
Configured via `.env.local` (already included with your URLs/keys). You can change:
- `NEXT_PUBLIC_N8N_BOOKING_URL`
- `NEXT_PUBLIC_N8N_UPLOAD_URL`

## 6) Optional: Hide n8n URLs
Use `src/pages/api/proxy-n8n.js` and point the frontend to `/api/proxy-n8n` instead of the public webhook URL.

## 7) Production notes
- Replace test emails with real, verified SendGrid senders.
- Ensure Supabase RLS policies restrict data by `client_id = auth.uid()`.
- Turn on a Cron node for your n8n reminder workflow.

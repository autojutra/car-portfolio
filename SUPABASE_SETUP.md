# Supabase setup for autojutra.pl

## 1. Environment variables

Set these in `.env.local` locally and in Vercel production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=car-images
RESEND_API_KEY=...
NOTIFY_EMAIL_FROM=kontakt@autojutra.pl
```

## 2. Database and storage

In Supabase SQL Editor run:

- [`supabase/schema.sql`](/C:/Users/huszc/Desktop/car-portfolio/supabase/schema.sql)

This creates:

- `cars`
- `inquiries`
- `site_settings`
- public storage bucket `car-images`

## 3. Current app behavior

- If Supabase envs are set, the app reads and writes cars, inquiries, settings, and uploaded images through Supabase.
- If Supabase envs are missing, the app falls back to local `data/portfolio.json`.
- This fallback is useful locally, but production on Vercel should use Supabase.

## 4. Suggested migration of current data

1. Run the SQL schema.
2. Copy current rows from `data/portfolio.json` into Supabase.
3. Re-upload local `/uploads/...` assets to the `car-images` bucket or replace them in admin.
4. Set Vercel envs and redeploy.

## 5. Important note

`SUPABASE_SERVICE_ROLE_KEY` must stay server-only. Do not expose it with a `NEXT_PUBLIC_` prefix.

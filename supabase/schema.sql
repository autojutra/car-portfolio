create extension if not exists pgcrypto;

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  portfolio_type text not null check (portfolio_type in ('example', 'available')),
  name text not null,
  image text not null,
  images text[] not null default '{}',
  price_range text not null,
  year text not null,
  mileage text not null default '',
  summary_pl text not null,
  summary_en text not null,
  description_pl text not null,
  description_en text not null,
  highlights_pl text[] not null default '{}',
  highlights_en text[] not null default '{}',
  battery text not null,
  range text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists cars_created_at_idx on public.cars (created_at desc);
create index if not exists cars_portfolio_type_idx on public.cars (portfolio_type);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  car_slug text not null,
  car_name text not null,
  portfolio_type text not null check (portfolio_type in ('example', 'available')),
  customer_name text not null,
  email text not null,
  phone text not null,
  message text not null default '',
  delivery_email text not null default 'not configured',
  delivery_whatsapp text not null default 'not configured',
  created_at timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

create table if not exists public.site_settings (
  id text primary key,
  public_email text not null,
  public_phone text not null,
  public_whatsapp text not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id, public_email, public_phone, public_whatsapp)
values ('primary', 'kontakt@autojutra.pl', '+48 500 000 000', '+48 500 000 000')
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('car-images', 'car-images', true)
on conflict (id) do update set public = excluded.public;

alter table if exists public.patches
  add column if not exists published boolean not null default true;

alter table if exists public.patches
  add column if not exists published_at timestamp with time zone default now();

alter table if exists public.patches
  add column if not exists updated_at timestamp with time zone not null default now();

alter table if exists public.patches
  add column if not exists changelog text;

alter table if exists public.patches
  add column if not exists breaks_saves boolean not null default false;

alter table if exists public.patches
  add column if not exists archived boolean not null default false;

alter table if exists public.patches
  add column if not exists archived_at timestamp with time zone;

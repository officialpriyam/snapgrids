create table if not exists app_schema_migrations (
  name text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists app_admin_settings (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table app_admin_settings
  add column if not exists created_at timestamptz not null default now();

alter table app_admin_settings
  add column if not exists updated_at timestamptz not null default now();

update app_admin_settings
set value = value #- '{paymenter,apiKeyPlaintext}'
where value #> '{paymenter,apiKeyPlaintext}' is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'app_admin_settings_no_plaintext_paymenter_key'
  ) then
    alter table app_admin_settings
      add constraint app_admin_settings_no_plaintext_paymenter_key
      check (value #> '{paymenter,apiKeyPlaintext}' is null);
  end if;
end
$$;

create or replace function app_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists app_admin_settings_set_updated_at on app_admin_settings;

create trigger app_admin_settings_set_updated_at
before update on app_admin_settings
for each row
execute function app_set_updated_at();

create table if not exists usopen_picks (
  id uuid primary key default gen_random_uuid(),
  participant_name text not null unique,
  golfer1 text not null,
  golfer2 text not null,
  golfer3 text not null,
  golfer4 text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on upsert
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger usopen_picks_updated_at
  before update on usopen_picks
  for each row execute procedure update_updated_at();

alter table usopen_picks disable row level security;

-- Quote management
create table if not exists quotes (
  id uuid default gen_random_uuid() primary key,
  quote_number text unique not null,
  client_id uuid references clients(id) on delete set null,
  status text not null check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired')) default 'draft',
  valid_until date,
  total_net decimal(12,2) default 0,
  total_sell decimal(12,2) default 0,
  margin decimal(12,2) default 0,
  currency text default 'THB',
  items jsonb not null default '[]'::jsonb,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_quotes_quote_number on quotes(quote_number);
create index if not exists idx_quotes_client_id on quotes(client_id);
create index if not exists idx_quotes_status on quotes(status);
create index if not exists idx_quotes_created_at on quotes(created_at desc);

-- Trigger
create trigger update_quotes_updated_at
  before update on quotes
  for each row
  execute function update_updated_at_column();

-- RLS
alter table quotes enable row level security;

-- Function to generate quote number
create or replace function generate_quote_number()
returns trigger as $$
begin
  if new.quote_number is null then
    new.quote_number := 'Q-' || to_char(now(), 'YYYYMMDD') || '-' ||
                        lpad(nextval('quote_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

-- Sequence for quote numbers
create sequence if not exists quote_number_seq start 1;

-- Trigger for auto quote number
create trigger set_quote_number
  before insert on quotes
  for each row
  execute function generate_quote_number();

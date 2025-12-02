-- B2B/Agent client management
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  country text default 'Vietnam',
  client_type text check (client_type in ('B2B', 'Agent', 'Corporate', 'Direct')) default 'B2B',
  markup_percentage decimal(5,2) default 15.00,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_clients_company_name on clients(company_name);
create index if not exists idx_clients_country on clients(country);

-- Trigger for updated_at (reuse function from schema)
create trigger update_clients_updated_at
  before update on clients
  for each row
  execute function update_updated_at_column();

-- RLS: Admin access only (bypass via service role)
alter table clients enable row level security;

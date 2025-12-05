-- Transport pricing
create table if not exists transport_rates (
  id uuid default gen_random_uuid() primary key,
  vehicle_type text not null check (vehicle_type in ('sedan', 'suv', 'van', 'minibus', 'coach')),
  route_type text not null check (route_type in ('airport_transfer', 'golf_transfer', 'day_trip', 'hourly')),
  origin_area text not null,
  destination_area text not null,
  net_rate decimal(10,2) not null,
  rack_rate decimal(10,2),
  max_passengers int not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_transport_rates_vehicle_type on transport_rates(vehicle_type);
create index if not exists idx_transport_rates_route on transport_rates(origin_area, destination_area);

-- Trigger
create trigger update_transport_rates_updated_at
  before update on transport_rates
  for each row
  execute function update_updated_at_column();

-- RLS
alter table transport_rates enable row level security;

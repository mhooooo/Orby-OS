-- Course pricing tiers
create table if not exists course_rates (
  id uuid default gen_random_uuid() primary key,
  course_id uuid not null references courses(id) on delete cascade,
  rate_type text not null check (rate_type in ('green_fee', 'caddie', 'cart', 'package')),
  net_rate decimal(10,2) not null,
  rack_rate decimal(10,2),
  valid_from date,
  valid_to date,
  day_type text check (day_type in ('weekday', 'weekend', 'holiday', 'all')) default 'all',
  season text check (season in ('high', 'low', 'shoulder', 'all')) default 'all',
  includes_caddie boolean default false,
  includes_cart boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- Indexes for lookups
create index if not exists idx_course_rates_course_id on course_rates(course_id);
create index if not exists idx_course_rates_valid_dates on course_rates(valid_from, valid_to);
create index if not exists idx_course_rates_rate_type on course_rates(rate_type);

-- RLS
alter table course_rates enable row level security;

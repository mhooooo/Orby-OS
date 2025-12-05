-- Add B2B fields to courses table
alter table courses
add column if not exists contact_email text,
add column if not exists contact_phone text,
add column if not exists booking_email text,
add column if not exists commission_rate decimal(5,2),
add column if not exists internal_notes text;

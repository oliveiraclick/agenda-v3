alter table appointments 
add column if not exists professional_id uuid references professionals(id);

alter table appointments 
add column if not exists service_id uuid references services(id);

NOTIFY pgrst, 'reload config';

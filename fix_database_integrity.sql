-- Vamos recriar a tabela de agendamentos para garantir que ela aponte para os profissionais certos.
-- ATENÇÃO: Isso limpa os agendamentos (que parecem não estar salvando mesmo).

drop table if exists appointments;

create table appointments (
  id uuid default gen_random_uuid() primary key,
  client_name text not null,
  service_id uuid references services(id),
  service_name text,
  professional_id uuid references professionals(id),
  date date not null,
  time text not null, -- Usando text para evitar problemas com formato de hora HH:mm
  price numeric(10,2),
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar segurança
alter table appointments enable row level security;

-- Política de acesso total para usuários logados
create policy "Auth all appointments" 
on appointments 
for all 
using (auth.role() = 'authenticated');

-- Recarregar schema
NOTIFY pgrst, 'reload schema';

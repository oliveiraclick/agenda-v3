-- Inserir Serviços de Exemplo
insert into services (name, duration, price, description) values 
('Corte de Cabelo', 45, 50.00, 'Corte masculino completo com acabamento.'),
('Barba', 30, 35.00, 'Barba desenhada com toalha quente.'),
('Corte + Barba', 60, 80.00, 'Combo completo para o visual perfeito.');

-- Inserir Profissionais de Exemplo
insert into professionals (name, role, commission, image) values 
('João Silva', 'Barbeiro Master', 50, 'https://i.pravatar.cc/150?u=joao'),
('Carlos Souza', 'Barbeiro', 40, 'https://i.pravatar.cc/150?u=carlos'),
('Ana Pereira', 'Manicure', 60, 'https://i.pravatar.cc/150?u=ana');

-- Garantir que as tabelas tenham RLS habilitado e políticas públicas (se ainda não tiverem)
alter table services enable row level security;
alter table professionals enable row level security;

-- Políticas simples para permitir leitura pública e escrita autenticada (caso não existam)
create policy "Public services read" on services for select using (true);
create policy "Authenticated services insert" on services for insert with check (auth.role() = 'authenticated');

create policy "Public professionals read" on professionals for select using (true);
create policy "Authenticated professionals insert" on professionals for insert with check (auth.role() = 'authenticated');

-- 1. Remove mock data (don't worry, it won't delete data linked to real users if RLS prevents it, but cascading might)
-- We target the specific mock names I inserted earlier to avoid deleting real user salons if any existed.
delete from public.establishments 
where name in ('Studio Beauty Elite', 'Don Barbearia', 'Pet Shop Amigo Fiel', 'Lava Rápido Jet', 'Cantinho do Pet');

-- 2. Insert "Salão Denys" (only if it doesn't match the deleted ones and doesn't exist)
insert into public.establishments (name, type, category, rating, image_url, slug, description, address_city, phone)
select 'Salão Denys', 'Corte Premium • Barba', 'salao', 5.0, 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000', 'salao-denys', 'O melhor corte da região com atendimento exclusivo.', 'São Paulo, SP', '11999999999'
where not exists (
    select 1 from public.establishments where slug = 'salao-denys'
);

-- 3. Ensure services exist for Salão Denys
do $$
declare
  v_est_id uuid;
begin
  select id into v_est_id from public.establishments where slug = 'salao-denys';
  
  if v_est_id is not null then
    insert into public.services (establishment_id, name, description, duration, price, category)
    select v_est_id, 'Corte Cabelo', 'Corte degradê ou social', 45, 50.00, 'Cabelo'
    where not exists (select 1 from public.services where establishment_id = v_est_id and name = 'Corte Cabelo');

    insert into public.services (establishment_id, name, description, duration, price, category)
    select v_est_id, 'Barba & Bigode', 'Sobrancelha e barba com toalha quente', 30, 35.00, 'Barba'
    where not exists (select 1 from public.services where establishment_id = v_est_id and name = 'Barba & Bigode');
    
    insert into public.services (establishment_id, name, description, duration, price, category)
    select v_est_id, 'Combo Completo', 'Corte + Barba + Sobrancelha', 75, 80.00, 'Combos'
    where not exists (select 1 from public.services where establishment_id = v_est_id and name = 'Combo Completo');
  end if;
end $$;

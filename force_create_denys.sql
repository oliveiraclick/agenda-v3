-- 1. APAGO TUDO para garantir que não tenha duplicidade
delete from public.establishments;

-- 2. Crio o Salão Denys do zero com os dados corretos e o link certo
insert into public.establishments (id, name, type, category, rating, image_url, slug, description, address_city, phone)
values (
    gen_random_uuid(),
    'Salão Denys', 
    'Corte Premium • Barba', 
    'salao', 
    5.0, 
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000', 
    'salao-denys', 
    'O melhor corte da região com atendimento exclusivo.', 
    'São Paulo, SP', 
    '11999999999'
);

-- 3. Crio os Serviços para este salão
do $$
declare
  v_est_id uuid;
begin
  select id into v_est_id from public.establishments where slug = 'salao-denys';
  
  if v_est_id is not null then
    insert into public.services (establishment_id, name, description, duration, price, category) values
    (v_est_id, 'Corte Cabelo', 'Corte degradê ou social', 45, 50.00, 'Cabelo'),
    (v_est_id, 'Barba & Bigode', 'Sobrancelha e barba com toalha quente', 30, 35.00, 'Barba'),
    (v_est_id, 'Combo Completo', 'Corte + Barba + Sobrancelha', 75, 80.00, 'Combos');
  end if;
end $$;

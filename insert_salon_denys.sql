-- Insert "Salão Denys" if it doesn't exist
insert into public.establishments (name, type, category, rating, image_url, slug, description, address_city, phone)
select 'Salão Denys', 'Corte Premium • Barba', 'salao', 5.0, 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000', 'salao-denys', 'O melhor corte da região com atendimento exclusivo.', 'São Paulo, SP', '11999999999'
where not exists (
    select 1 from public.establishments where slug = 'salao-denys'
);

-- Ensure services exist for it
do $$
declare
  v_est_id uuid;
begin
  select id into v_est_id from public.establishments where slug = 'salao-denys';
  
  if v_est_id is not null then
    insert into public.services (establishment_id, name, description, duration, price, category)
    select v_est_id, 'Corte Cabelo', 'Corte degradê ou social', '45 min', 50.00, 'Cabelo'
    where not exists (select 1 from public.services where establishment_id = v_est_id and name = 'Corte Cabelo');

    insert into public.services (establishment_id, name, description, duration, price, category)
    select v_est_id, 'Barba & Bigode', 'Sobrancelha e barba com toalha quente', '30 min', 35.00, 'Barba'
    where not exists (select 1 from public.services where establishment_id = v_est_id and name = 'Barba & Bigode');
  end if;
end $$;

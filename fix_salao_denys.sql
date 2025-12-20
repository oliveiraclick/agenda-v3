-- 1. Cleaning up everything EXCEPT "salao do denys"
-- We keep the one you registered.
delete from public.establishments 
where name not ilike '%salao do denys%';

-- 2. Update your salon to have the correct link (slug) and image if missing
update public.establishments
set 
    slug = 'salao-denys',
    image_url = coalesce(image_url, 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000'), -- Keep existing if set, else use default
    rating = 5.0
where name ilike '%salao do denys%';

-- 3. Ensure services exist for your salon
do $$
declare
  v_est_id uuid;
begin
  select id into v_est_id from public.establishments where name ilike '%salao do denys%' limit 1;
  
  if v_est_id is not null then
    -- Insert services only if they don't exist
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

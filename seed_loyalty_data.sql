-- Clean up existing data for clean slate (optional, but good for "Zerar")
DELETE FROM public.loyalty_cards; 
DELETE FROM public.loyalty_rewards;
DELETE FROM public.loyalty_redemptions;


-- Assuming we have a user and an establishment
-- We'll look up the first establishment or a specific one "Barbearia Elite" if exists, or create one.
-- For this script, we'll try to find an establishment, if not found, we insert a placeholder.

DO $$
DECLARE
    v_est_id UUID;
    v_user_id UUID;
BEGIN
    -- 1. Find or Create Establishment "Barbearia Elite"
    SELECT id INTO v_est_id FROM public.establishments WHERE name = 'Barbearia Elite' LIMIT 1;
    
    IF v_est_id IS NULL THEN
        -- Fallback: try to get ANY establishment
        SELECT id INTO v_est_id FROM public.establishments LIMIT 1;
        
        -- If still null, we can't really proceed without creating one, but let's assume one exists or create a dummy
        IF v_est_id IS NULL THEN
           -- Create dummy establishment for testing if none exists
           INSERT INTO public.establishments (name, slug, status, subscription_plan)
           VALUES ('Barbearia Elite', 'barbearia-elite', 'active', 'pro')
           RETURNING id INTO v_est_id;
        END IF;
    END IF;

    -- 2. Get Current Auth User (or a specific test user if running from SQL editor manually without auth context)
    -- Since this is running via migration/rpc often, auth.uid() might be null if run as admin service role.
    -- Let's check if we can grab a user key text or similar. 
    -- Ideally, we want to target the user "Denys".
    
    SELECT id INTO v_user_id FROM public.profiles WHERE email ILIKE '%denys%' LIMIT 1;
    
    IF v_user_id IS NULL THEN
        -- If not found, just grab the first user
        SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    END IF;

    -- Proceed only if we have both
    IF v_est_id IS NOT NULL AND v_user_id IS NOT NULL THEN
        
        -- 3. Create Rewards
        -- Clear old rewards for this establishment to avoid dupes on re-run
        DELETE FROM public.loyalty_rewards WHERE establishment_id = v_est_id;

        INSERT INTO public.loyalty_rewards (establishment_id, title, description, cost, active)
        VALUES 
            (v_est_id, 'Corte Grátis', 'Ganhe um corte de cabelo totalmente gratuito', 10, true),
            (v_est_id, 'Bebida Grátis', 'Refrigerante ou Cerveja durante o atendimento', 5, true);

        -- 4. Create Loyalty Card
        -- Upsert card
        INSERT INTO public.loyalty_cards (user_id, establishment_id, stamps)
        VALUES (v_user_id, v_est_id, 6)
        ON CONFLICT (user_id, establishment_id) 
        DO UPDATE SET stamps = 6, updated_at = now();
        
    END IF;
END $$;

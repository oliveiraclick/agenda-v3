-- Create Loyalty Cards Table
CREATE TABLE IF NOT EXISTS public.loyalty_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    establishment_id UUID REFERENCES public.establishments(id) ON DELETE CASCADE,
    stamps INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, establishment_id)
);

-- Create Loyalty Rewards Table
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    establishment_id UUID REFERENCES public.establishments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cost INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Loyalty Redemptions Table
CREATE TABLE IF NOT EXISTS public.loyalty_redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES public.loyalty_rewards(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to handle reward redemption
CREATE OR REPLACE FUNCTION public.redeem_reward(
    p_user_id UUID,
    p_reward_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cost INTEGER;
    v_stamps INTEGER;
    v_establishment_id UUID;
    v_reward_title TEXT;
BEGIN
    -- Get reward details
    SELECT cost, establishment_id, title INTO v_cost, v_establishment_id, v_reward_title
    FROM public.loyalty_rewards
    WHERE id = p_reward_id AND active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reward not found or inactive';
    END IF;

    -- Get user stamps for this establishment
    SELECT stamps INTO v_stamps
    FROM public.loyalty_cards
    WHERE user_id = p_user_id AND establishment_id = v_establishment_id;

    IF v_stamps IS NULL OR v_stamps < v_cost THEN
        RAISE EXCEPTION 'Insufficient stamps';
    END IF;

    -- Update stamps
    UPDATE public.loyalty_cards
    SET stamps = stamps - v_cost,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = p_user_id AND establishment_id = v_establishment_id;

    -- Record redemption
    INSERT INTO public.loyalty_redemptions (user_id, reward_id)
    VALUES (p_user_id, p_reward_id);

    RETURN jsonb_build_object(
        'success', true,
        'new_stamps', v_stamps - v_cost,
        'message', 'Reward ' || v_reward_title || ' redeemed successfully'
    );
END;
$$;

-- RLS Policies
ALTER TABLE public.loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- Cards: Users can see their own cards
DROP POLICY IF EXISTS "Users can view own loyalty cards" ON public.loyalty_cards;
CREATE POLICY "Users can view own loyalty cards"
    ON public.loyalty_cards FOR SELECT
    USING (auth.uid() = user_id);

-- Rewards: Everyone can view active rewards
DROP POLICY IF EXISTS "Everyone can view active rewards" ON public.loyalty_rewards;
CREATE POLICY "Everyone can view active rewards"
    ON public.loyalty_rewards FOR SELECT
    USING (true);

-- Redemptions: Users can see their own redemptions
DROP POLICY IF EXISTS "Users can view own redemptions" ON public.loyalty_redemptions;
CREATE POLICY "Users can view own redemptions"
    ON public.loyalty_redemptions FOR SELECT
    USING (auth.uid() = user_id);

-- Create table for Platform Payments (Owner Subscriptions)
CREATE TABLE IF NOT EXISTS public.platform_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    establishment_id UUID REFERENCES public.establishments(id),
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL, -- 'paid', 'refunded', 'chargedback'
    plan_type TEXT, -- 'base', 'tier_3', 'tier_5', 'tier_10'
    kiwify_order_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.platform_payments ENABLE ROW LEVEL SECURITY;

-- Admins can view all
CREATE POLICY "Admins view all payments" ON public.platform_payments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Owners can view own payments
CREATE POLICY "Owners view own payments" ON public.platform_payments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.establishments WHERE id = platform_payments.establishment_id AND owner_id = auth.uid())
    );

-- Function to record payment (Called by Webhook Service Role)
-- Service Role bypasses RLS, so no special insert policy needed given we write from Edge Function.

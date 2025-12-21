-- Tabela de Códigos Promocionais
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text NOT NULL UNIQUE,
    days_granted int NOT NULL, -- 30, 60, 90
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- RLS para Promo Codes (Apenas Admin vê tudo)
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access promo_codes" ON public.promo_codes;

CREATE POLICY "Admin full access promo_codes" ON public.promo_codes
    FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Função segura para validar código (Qualquer um pode chamar, mas só vê se for válido)
CREATE OR REPLACE FUNCTION public.validate_promo_code(input_code text)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    days int;
BEGIN
    SELECT days_granted INTO days
    FROM public.promo_codes
    WHERE code ILIKE input_code AND active = true;
    
    RETURN days; -- Retorna NULL se não achar
END;
$$;

-- Função segura para aplicar código (Valida e aplica em uma transação)
CREATE OR REPLACE FUNCTION public.apply_promo_code(input_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    found_days int;
    promo_id uuid;
    user_id uuid;
    est_id uuid;
    new_date timestamp with time zone;
BEGIN
    user_id := auth.uid();
    
    -- 1. Validar Código
    SELECT id, days_granted INTO promo_id, found_days
    FROM public.promo_codes
    WHERE code ILIKE input_code AND active = true;
    
    IF promo_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Código inválido ou expirado.');
    END IF;

    -- 2. Buscar Estabelecimento do Usuário
    SELECT id INTO est_id
    FROM public.establishments
    WHERE owner_id = user_id;

    IF est_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Estabelecimento não encontrado.');
    END IF;

    -- 3. Calcular Nova Data (Hoje + Dias)
    -- Opcional: Se já tiver trial futuro, somar a ele? Por simplicidade, reseta a partir de hoje.
    new_date := now() + (found_days || ' days')::interval;

    -- 4. Atualizar Estabelecimento
    UPDATE public.establishments
    SET 
        trial_ends_at = new_date,
        subscription_plan = 'pro',
        updated_at = now()
    WHERE id = est_id;

    RETURN json_build_object('success', true, 'days', found_days, 'new_date', new_date);
END;
$$;

-- Inserir Configurações de Preço no System Settings
INSERT INTO public.system_settings (key, value, updated_at)
VALUES 
    ('price_base', '{"amount": 29.00, "description": "Preço Base do Estabelecimento", "link": "https://pay.kiwify.com.br/ZqDT7Lt"}', now()),
    ('price_professional', '{"amount": 10.00, "description": "Preço por Profissional Adicional", "link": "https://pay.kiwify.com.br/RBJo25T"}', now())
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = now();

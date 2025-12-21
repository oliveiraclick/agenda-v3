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

-- Inserir Configurações de Preço no System Settings
INSERT INTO public.system_settings (key, value, updated_at)
VALUES 
    ('price_base', '{"amount": 29.00, "description": "Preço Base do Estabelecimento", "link": "https://pay.kiwify.com.br/ZqDT7Lt"}', now()),
    ('price_professional', '{"amount": 10.00, "description": "Preço por Profissional Adicional", "link": "https://pay.kiwify.com.br/RBJo25T"}', now())
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = now();

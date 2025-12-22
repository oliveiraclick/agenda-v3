-- LEIA COM ATENÇÃO:
-- Este script corrige a falta da tabela 'establishments' e adiciona a coluna 'establishment_id' aos profissionais.
-- Ele é essencial para o funcionamento do cadastro de equipe e configurações.

-- 1. Criar tabela de Estabelecimentos (se não existir)
CREATE TABLE IF NOT EXISTS public.establishments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT,
    slug TEXT UNIQUE,
    description TEXT,
    history TEXT,
    address_full TEXT,
    phone TEXT,
    logo_url TEXT,
    cover_url TEXT,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_plan TEXT DEFAULT 'free'
);

-- Habilitar RLS em Establishments
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

-- Políticas para Establishments
DROP POLICY IF EXISTS "Public read access on establishments" ON public.establishments;
CREATE POLICY "Public read access on establishments" ON public.establishments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can update own establishment" ON public.establishments;
CREATE POLICY "Owners can update own establishment" ON public.establishments
    FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can insert own establishment" ON public.establishments;
CREATE POLICY "Owners can insert own establishment" ON public.establishments
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can select own establishment" ON public.establishments;
CREATE POLICY "Owners can select own establishment" ON public.establishments
    FOR SELECT USING (auth.uid() = owner_id);

-- 2. Corrigir tabela de Profissionais (Adicionar establishment_id)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professionals' AND column_name = 'establishment_id') THEN
        ALTER TABLE public.professionals ADD COLUMN establishment_id UUID REFERENCES public.establishments(id);
    END IF;
END $$;

-- 3. Atualizar Políticas de Profissionais para usar establishment_id
DROP POLICY IF EXISTS "Allow public read access on professionals" ON public.professionals;
CREATE POLICY "Allow public read access on professionals" ON public.professionals
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage professionals" ON public.professionals;
CREATE POLICY "Owners can manage professionals" ON public.professionals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.establishments
            WHERE establishments.id = professionals.establishment_id
            AND establishments.owner_id = auth.uid()
        )
    );

-- 4. Garantir que outras tabelas importantes tenham establishment_id (para evitar bugs futuros)
DO $$
BEGIN
    -- Services
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'establishment_id') THEN
        ALTER TABLE public.services ADD COLUMN establishment_id UUID REFERENCES public.establishments(id);
    END IF;
    -- Products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'establishment_id') THEN
        ALTER TABLE public.products ADD COLUMN establishment_id UUID REFERENCES public.establishments(id);
    END IF;
     -- Appointments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'establishment_id') THEN
        ALTER TABLE public.appointments ADD COLUMN establishment_id UUID REFERENCES public.establishments(id);
    END IF;
END $$;

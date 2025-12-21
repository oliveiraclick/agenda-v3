-- 1. Adiciona STATUS na tabela PROFILES (para banir usuários)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' 
CHECK (status IN ('active', 'blocked'));

-- 2. Tabela de CONFIGURAÇÕES DO SISTEMA (Manutenção, etc)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users
);

-- Habilitar RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Admin manage settings" ON public.system_settings;
DROP POLICY IF EXISTS "Public read settings" ON public.system_settings;

-- Admin pode fazer tudo em settings
CREATE POLICY "Admin manage settings" ON public.system_settings FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Todos podem LER settings (para saber se está em manutenção)
CREATE POLICY "Public read settings" ON public.system_settings FOR SELECT USING (true);

-- 3. Inserir configuração padrão de manutenção
INSERT INTO public.system_settings (key, value)
VALUES ('maintenance_mode', '{"enabled": false, "message": "Estamos em manutenção. Voltamos logo!"}')
ON CONFLICT (key) DO NOTHING;

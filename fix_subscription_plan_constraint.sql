-- Corrige a restrição de plano de assinatura para permitir o valor 'trial'
ALTER TABLE public.establishments 
DROP CONSTRAINT IF EXISTS establishments_subscription_plan_check;

ALTER TABLE public.establishments 
ADD CONSTRAINT establishments_subscription_plan_check 
CHECK (subscription_plan IN ('free', 'pro', 'enterprise', 'trial'));

-- Garante que o valor padrão seja consistente (opcional, já é 'free')
ALTER TABLE public.establishments 
ALTER COLUMN subscription_plan SET DEFAULT 'free';

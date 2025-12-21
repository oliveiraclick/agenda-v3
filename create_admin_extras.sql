-- 1. Tabela de FEEDBACK (Suporte/Contato)
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  type text NOT NULL CHECK (type IN ('bug', 'feature', 'support', 'other')),
  message text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at timestamptz DEFAULT now()
);

-- 2. Tabela de NOTIFICAÇÕES DO SISTEMA (Global)
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  target_audience text DEFAULT 'all' CHECK (target_audience IN ('all', 'owners', 'customers')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 3. Tabela de PAGAMENTOS DA PLATAFORMA (Revenue)
CREATE TABLE IF NOT EXISTS public.platform_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id uuid REFERENCES public.establishments,
  amount numeric NOT NULL,
  plan_type text NOT NULL, -- 'pro', 'enterprise'
  status text DEFAULT 'paid',
  payment_date timestamptz DEFAULT now()
);

-- RLS Policies (Simplificado para Admin ver tudo)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_payments ENABLE ROW LEVEL SECURITY;

-- Admin pode ver tudo
CREATE POLICY "Admin view all feedback" ON public.feedback FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
CREATE POLICY "Admin manage notifications" ON public.system_notifications FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
CREATE POLICY "Admin view payments" ON public.platform_payments FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Usuários podem criar feedback
CREATE POLICY "Users create feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Todos podem ver notificações (se não expiradas)
CREATE POLICY "Public view notifications" ON public.system_notifications FOR SELECT USING (true);

-- SCRIPT PARA DESTRAVAR A EXCLUSÃO DE USUÁRIOS
-- O erro "Database error deleting user" acontece porque o usuário ainda tem dados na tabela 'profiles'.
-- Este script limpa TUDO para você conseguir apagar os usuários no painel.

-- 1. Limpa a tabela de perfis (que é o que está travando a exclusão)
TRUNCATE TABLE public.profiles CASCADE;

-- 2. (Opcional) Corrige a constraint para que no futuro, ao apagar no Auth, apague no Profile automaticamente.
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey,
ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 3. Limpa outras tabelas para garantir o "Zero Absoluto"
TRUNCATE TABLE public.appointments CASCADE;
TRUNCATE TABLE public.campaigns CASCADE;
TRUNCATE TABLE public.expenses CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.services CASCADE;
TRUNCATE TABLE public.professionals CASCADE;
TRUNCATE TABLE public.establishments CASCADE;

-- AGORA TENTE APAGAR OS USUÁRIOS NO PAINEL DO SUPABASE NOVAMENTE.

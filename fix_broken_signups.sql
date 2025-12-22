-- FIX BROKEN SIGNUPS (Versão Corrigida com Cascade Manual)
-- O erro aconteceu porque o usuário já tinha agendamentos vinculados.
-- Precisamos apagar as dependências antes de apagar o usuário.

-- 1. Apagar Agendamentos do usuário
delete from public.appointments 
where user_id in (select id from auth.users where email like '%@agenda.app');

-- 2. Apagar Notificações do usuário
delete from public.notifications 
where user_id in (select id from auth.users where email like '%@agenda.app');

-- 3. Apagar Favoritos do usuário
delete from public.favorites 
where user_id in (select id from auth.users where email like '%@agenda.app');

-- 4. Apagar Campanhas (se houver visualizações vinculadas, embora raro aqui)
-- (Geralmente não tem FK para user_id direto que trave delete, mas por segurança)

-- 5. Agora sim: Apagar Perfis
delete from public.profiles
where id in (select id from auth.users where email like '%@agenda.app');

-- 6. Finalmente: Apagar da Autenticação
delete from auth.users
where email like '%@agenda.app';

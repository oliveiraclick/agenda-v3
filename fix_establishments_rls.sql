-- Verificando e Corrigindo RLS para Establishments
-- O erro "Estabelecimento não encontrado" geralmente ocorre porque a política de segurança (RLS)
-- impede que o usuário veja o próprio estabelecimento que criou.

-- 1. Habilita RLS (caso não esteja)
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

-- 2. Remove políticas antigas (para evitar conflitos/duplicatas)
DROP POLICY IF EXISTS "Users can insert their own establishment" ON public.establishments;
DROP POLICY IF EXISTS "Users can select their own establishment" ON public.establishments;
DROP POLICY IF EXISTS "Users can update their own establishment" ON public.establishments;
DROP POLICY IF EXISTS "Users can delete their own establishment" ON public.establishments;

-- 3. Cria políticas permissivas para o Dono
-- INSERT: Permite criar se o owner_id for igual ao id do usuário logado
CREATE POLICY "Users can insert their own establishment"
ON public.establishments
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- SELECT: Permite ver se for o dono
CREATE POLICY "Users can select their own establishment"
ON public.establishments
FOR SELECT
USING (auth.uid() = owner_id);

-- UPDATE: Permite editar se for o dono
CREATE POLICY "Users can update their own establishment"
ON public.establishments
FOR UPDATE
USING (auth.uid() = owner_id);

-- DELETE: Permite apagar se for o dono
CREATE POLICY "Users can delete their own establishment"
ON public.establishments
FOR DELETE
USING (auth.uid() = owner_id);

-- 4. Opcional: Política para clientes virem o estabelecimento (Público ou por agendamento)
-- Para facilitar, vamos deixar leitura pública por enquanto (necessário para o perfil público / slug)
DROP POLICY IF EXISTS "Public read establishments" ON public.establishments;
CREATE POLICY "Public read establishments"
ON public.establishments
FOR SELECT
USING (true); 
-- Nota: A política "Users can select their own establishment" torna-se redundante com a pública,
-- mas é bom manter a granularidade se decidirmos fechar o público depois.

-- Adiciona coluna CATEGORIA na tabela ESTABLISHMENTS
ALTER TABLE public.establishments 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Salão de Beleza';

-- Atualiza alguns registros existentes para ter dados variados (opcional, para teste)
UPDATE public.establishments SET category = 'Barbearia' WHERE name ILIKE '%barber%';
UPDATE public.establishments SET category = 'Estética' WHERE name ILIKE '%estetica%';
UPDATE public.establishments SET category = 'Pet Shop' WHERE name ILIKE '%pet%';

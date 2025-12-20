-- Inserir Jr Salão na tabela establishments se não existir
INSERT INTO public.establishments (name, slug, description, address, phone, image_url, rating, category)
VALUES (
    'Jr Salão', 
    'jr-salao', 
    'Especialistas em cortes modernos e clássicos para todas as idades.', 
    'Rua das Flores, 123 - Centro', 
    '(11) 99999-8888', 
    'https://images.unsplash.com/photo-1503951914875-452162b7f304?q=80&w=400', 
    4.8, 
    'Barbearia'
)
ON CONFLICT (slug) DO NOTHING;

-- Pegar o ID do Jr Salão recém inserido (ou existente)
DO $$
DECLARE
    v_est_id uuid;
BEGIN
    SELECT id INTO v_est_id FROM public.establishments WHERE slug = 'jr-salao';

    IF v_est_id IS NOT NULL THEN
        -- Inserir Profissionais para o Jr Salão
        DELETE FROM public.professionals WHERE establishment_id = v_est_id;
        
        INSERT INTO public.professionals (establishment_id, name, role, commission, image) VALUES
        (v_est_id, 'Junior Oliveira', 'Barbeiro Chefe', 60, 'https://i.pravatar.cc/150?u=junior'),
        (v_est_id, 'Lucas Pereira', 'Barbeiro', 40, 'https://i.pravatar.cc/150?u=lucas');

        -- Inserir Produtos para o Jr Salão
        DELETE FROM public.products WHERE establishment_id = v_est_id;

        INSERT INTO public.products (establishment_id, name, description, price, image) VALUES
        (v_est_id, 'Gel Cola', 'Fixação extrema', 25.00, 'https://picsum.photos/seed/gel/200'),
        (v_est_id, 'Shampoo 2 em 1', 'Cabelo e Barba', 30.00, 'https://picsum.photos/seed/shampoo/200');
    END IF;
END $$;

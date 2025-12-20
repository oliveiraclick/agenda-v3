do $$
declare
  v_est_id uuid;
begin
  -- 1. Pega o ID do Salão Denys
  select id into v_est_id from public.establishments where slug = 'salao-denys' limit 1;
  
  if v_est_id is not null then
  
    -- 2. Atualiza a História
    update public.establishments 
    set history = 'Fundado em 2015, o Salão Denys nasceu com a missão de redefinir o conceito de barbearia clássica. Começamos em uma pequena garagem e hoje somos referência em cortes modernos e atendimento de excelência. Nossa filosofia é tratar cada cliente como um amigo, oferecendo não apenas um corte, mas uma experiência de relaxamento e confiança. Venha tomar um café conosco e renovar seu visual!'
    where id = v_est_id;

    -- 3. Insere 5 Profissionais (apaga os antigos desse salão para não duplicar se rodar de novo)
    delete from public.professionals where establishment_id = v_est_id;
    
    insert into public.professionals (establishment_id, name, role, commission, image) values
    (v_est_id, 'Carlos Silva', 'Barbeiro Master', 50, 'https://images.unsplash.com/photo-1583336137348-dda1d1e434e3?q=80&w=300'),
    (v_est_id, 'Ana Paula', 'Cabeleireira', 45, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300'),
    (v_est_id, 'Marcos Santos', 'Especialista em Barba', 40, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300'),
    (v_est_id, 'Julia Lima', 'Colorista', 45, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300'),
    (v_est_id, 'Pedro Souza', 'Aprendiz', 30, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300');

    -- 4. Insere 5 Produtos (apaga os antigos desse salão)
    delete from public.products where establishment_id = v_est_id;
    
    insert into public.products (establishment_id, name, description, price, image) values
    (v_est_id, 'Pomada Modeladora Matte', 'Fixação forte e efeito seco', 45.00, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=300'),
    (v_est_id, 'Óleo para Barba Premium', 'Hidratação e maciez', 35.00, 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?q=80&w=300'),
    (v_est_id, 'Shampoo Anti-Caspa', 'Limpeza profunda e refrescância', 28.00, 'https://images.unsplash.com/photo-1627384113972-f4c0392fe5aa?q=80&w=300'),
    (v_est_id, 'Gel de Barbear Transparente', 'Precisão total no desenho', 22.00, 'https://images.unsplash.com/photo-1616788494725-b74c5d2b78a9?q=80&w=300'),
    (v_est_id, 'Pente de Madeira Artesanal', 'Anti-frizz para barba e cabelo', 15.00, 'https://images.unsplash.com/photo-1595204430032-473d09beeb63?q=80&w=300');
    
  end if;
end $$;

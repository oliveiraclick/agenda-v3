-- A coluna 'scheduled_at' é antiga e está exigindo valor, mas agora usamos 'date' e 'time'.
-- Vamos torná-la opcional (nullable) para não travar o sistema.

alter table appointments alter column scheduled_at drop not null;

-- Opcional: Se quiser manter compatibilidade, podemos criar um trigger no futuro, 
-- mas por enquanto isso resolve o erro de inserção.

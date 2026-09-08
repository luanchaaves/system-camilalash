-- ========================================================================
-- SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
-- Seed Data: supabase/seed.sql
-- ========================================================================

-- Obs: O user_id padrão é preenchido dinamicamente pela aplicação ou autenticação.
-- As queries abaixo demonstram a estrutura inicial de seed.

-- Categorias de Serviço Padrão
INSERT INTO public.service_categories (id, user_id, name, description)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'Extensão de Cílios', 'Procedimentos de visagismo e extensão de fios'),
    ('c2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'Sobrancelhas & Visagismo', 'Design e harmonização facial'),
    ('c3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'Cursos & Mentorias', 'Capacitação profissional')
ON CONFLICT DO NOTHING;

-- Serviços Iniciais Exatos do Studio
INSERT INTO public.services (id, user_id, category_id, name, description, price, duration_minutes, maintenance_price, maintenance_duration_minutes, is_active)
VALUES 
    ('s1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'c1111111-1111-1111-1111-111111111111', 'Volume Cristal', 'Efeito rímel refinado e ultra natural para o dia a dia.', 120.00, 120, 75.00, 90, true),
    ('s2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'c1111111-1111-1111-1111-111111111111', 'Volume Esmeralda', 'Volume suave com preenchimento harmonioso e acabamento aveludado.', 125.00, 120, 80.00, 90, true),
    ('s3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'c1111111-1111-1111-1111-111111111111', 'Volume Jade', 'Densidade equilibrada com fios ultra macios e alinhamento impecável.', 135.00, 130, 85.00, 90, true),
    ('s4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'c1111111-1111-1111-1111-111111111111', 'Volume Rubi', 'Volume expressivo com efeito delineado e densidade marcante.', 145.00, 140, 90.00, 100, true),
    ('s5555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'c1111111-1111-1111-1111-111111111111', 'Volume Pérola (VIP)', 'Efeito Fox Eyes sofisticado e olhar luxuosamente alongado.', 150.00, 150, 95.00, 100, true)
ON CONFLICT DO NOTHING;

-- Formas de Pagamento
INSERT INTO public.payment_methods (name, is_active)
VALUES 
    ('Pix', true),
    ('Cartão de Crédito', true),
    ('Cartão de Débito', true),
    ('Dinheiro em Espécie', true),
    ('Transferência Bancária', true)
ON CONFLICT DO NOTHING;

-- Categorias de Despesas
INSERT INTO public.expense_categories (name, cost_type, is_active)
VALUES 
    ('Aluguel & Condomínio', 'fixed', true),
    ('Internet & Telefonia', 'fixed', true),
    ('Energia Elétrica', 'fixed', true),
    ('Água & Saneamento', 'fixed', true),
    ('Contabilidade & Sistemas', 'fixed', true),
    ('Materiais & Colas', 'variable', true),
    ('Fios & Descartáveis', 'variable', true),
    ('Marketing & Tráfego Pago', 'variable', true),
    ('Impostos & Taxas', 'variable', true),
    ('Transporte & Combustível', 'variable', true),
    ('Equipamentos & Ferramentas', 'variable', true),
    ('Manutenção do Espaço', 'variable', true),
    ('Cursos & Especializações', 'variable', true),
    ('Outros Custos', 'variable', true)
ON CONFLICT DO NOTHING;

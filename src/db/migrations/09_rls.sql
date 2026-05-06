-- Migration: Configuração de Row-Level Security (RLS) baseada em Perfis

-- 1. Funções Auxiliares para ler o contexto da sessão (JWT) e obter dados do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
    v_role VARCHAR;
BEGIN
    SELECT role INTO v_role FROM usuarios WHERE id = get_current_user_id();
    RETURN v_role;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_current_user_unidade_id()
RETURNS UUID AS $$
DECLARE
    v_unidade_id UUID;
BEGIN
    SELECT unidade_id INTO v_unidade_id FROM usuarios WHERE id = get_current_user_id();
    RETURN v_unidade_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Habilitar RLS nas tabelas solicitadas
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para Gestor e Secretário (Acesso Total / Bypass RLS)
CREATE POLICY bypass_gestor_secretario_entregas ON entregas FOR ALL USING (get_current_user_role() IN ('gestor', 'secretario'));
CREATE POLICY bypass_gestor_secretario_rotas ON rotas FOR ALL USING (get_current_user_role() IN ('gestor', 'secretario'));
CREATE POLICY bypass_gestor_secretario_pedidos ON pedidos FOR ALL USING (get_current_user_role() IN ('gestor', 'secretario'));
CREATE POLICY bypass_gestor_secretario_pacientes ON pacientes FOR ALL USING (get_current_user_role() IN ('gestor', 'secretario'));
CREATE POLICY bypass_gestor_secretario_receitas ON receitas FOR ALL USING (get_current_user_role() IN ('gestor', 'secretario'));

-- 4. Políticas para Entregador
CREATE POLICY rotas_entregador_select ON rotas FOR SELECT 
USING (get_current_user_role() = 'entregador' AND entregador_id = get_current_user_id());

CREATE POLICY entregas_entregador_select ON entregas FOR SELECT 
USING (get_current_user_role() = 'entregador' AND rota_id IN (
    SELECT id FROM rotas WHERE entregador_id = get_current_user_id()
));

-- 5. Políticas para Postinho
CREATE POLICY pedidos_postinho_select ON pedidos FOR SELECT 
USING (get_current_user_role() = 'postinho' AND unidade_id = get_current_user_unidade_id());

CREATE POLICY pedidos_postinho_insert ON pedidos FOR INSERT 
WITH CHECK (get_current_user_role() = 'postinho' AND unidade_id = get_current_user_unidade_id());

-- 6. Políticas para Médico
CREATE POLICY receitas_medico_select ON receitas FOR SELECT 
USING (get_current_user_role() = 'medico' AND medico_id = get_current_user_id());

CREATE POLICY receitas_medico_insert ON receitas FOR INSERT 
WITH CHECK (get_current_user_role() = 'medico' AND medico_id = get_current_user_id());

-- 7. Políticas para Paciente
CREATE POLICY entregas_paciente_select ON entregas FOR SELECT 
USING (get_current_user_role() = 'paciente' AND paciente_id = get_current_user_id());

CREATE POLICY receitas_paciente_select ON receitas FOR SELECT 
USING (get_current_user_role() = 'paciente' AND paciente_id = get_current_user_id());

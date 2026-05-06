-- Migration: Criação da tabela de Estoque e Triggers de Atualização

-- Adicionando unidade_id na tabela lotes (necessário para que a trigger e o estoque por unidade funcionem corretamente)
ALTER TABLE lotes ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES unidades(id) ON DELETE CASCADE;

-- Tabela de Estoque Consolidado
CREATE TABLE IF NOT EXISTS estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicamento_id UUID REFERENCES medicamentos(id) ON DELETE CASCADE,
    unidade_id UUID REFERENCES unidades(id) ON DELETE CASCADE,
    quantidade_total INT DEFAULT 0,
    quantidade_reservada INT DEFAULT 0,
    dias_cobertura INT DEFAULT 0,
    atualizado_em TIMESTAMP DEFAULT now(),
    UNIQUE(medicamento_id, unidade_id)
);

-- Função que recalcula o estoque agregado
CREATE OR REPLACE FUNCTION recalcular_estoque(p_medicamento_id UUID, p_unidade_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total INT;
    v_reservada INT;
BEGIN
    -- Se p_unidade_id for nulo (caso lotes antigos não tenham unidade), não fazemos nada.
    IF p_unidade_id IS NULL THEN
        RETURN;
    END IF;

    -- Soma quantidade atual dos lotes disponíveis e reservados daquele medicamento na unidade
    SELECT 
        COALESCE(SUM(quantidade_atual), 0),
        COALESCE(SUM(CASE WHEN status = 'reservado' THEN quantidade_atual ELSE 0 END), 0)
    INTO v_total, v_reservada
    FROM lotes
    WHERE medicamento_id = p_medicamento_id
      AND unidade_id = p_unidade_id
      AND status IN ('disponivel', 'reservado');

    -- Atualiza ou insere (Upsert) na tabela estoque
    INSERT INTO estoque (medicamento_id, unidade_id, quantidade_total, quantidade_reservada, atualizado_em)
    VALUES (p_medicamento_id, p_unidade_id, v_total, v_reservada, now())
    ON CONFLICT (medicamento_id, unidade_id)
    DO UPDATE SET 
        quantidade_total = EXCLUDED.quantidade_total,
        quantidade_reservada = EXCLUDED.quantidade_reservada,
        atualizado_em = now();
END;
$$ LANGUAGE plpgsql;

-- Função da Trigger
CREATE OR REPLACE FUNCTION trigger_recalcular_estoque()
RETURNS TRIGGER AS $$
BEGIN
    -- No caso de INSERT ou UPDATE
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        PERFORM recalcular_estoque(NEW.medicamento_id, NEW.unidade_id);
    END IF;
    
    -- No caso de UPDATE (onde mudou o medicamento_id ou unidade_id) ou DELETE
    IF (TG_OP = 'UPDATE' AND (NEW.medicamento_id != OLD.medicamento_id OR NEW.unidade_id IS DISTINCT FROM OLD.unidade_id)) OR (TG_OP = 'DELETE') THEN
        PERFORM recalcular_estoque(OLD.medicamento_id, OLD.unidade_id);
    END IF;

    RETURN NULL; -- AFTER trigger deve retornar NULL
END;
$$ LANGUAGE plpgsql;

-- Criação da trigger na tabela lotes
DROP TRIGGER IF EXISTS trg_atualiza_estoque ON lotes;
CREATE TRIGGER trg_atualiza_estoque
AFTER INSERT OR UPDATE OR DELETE ON lotes
FOR EACH ROW
EXECUTE FUNCTION trigger_recalcular_estoque();

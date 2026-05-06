-- Migration: Criação da tabela de Recalls e módulo de busca

CREATE TABLE IF NOT EXISTS recalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_id UUID REFERENCES lotes(id) ON DELETE CASCADE,
    motivo TEXT NOT NULL,
    status VARCHAR DEFAULT 'ativo' CHECK (
        status IN ('ativo', 'em_andamento', 'concluido')
    ),
    iniciado_em TIMESTAMP DEFAULT now(),
    pacientes_afetados INT DEFAULT 0
);

-- Função do coração do módulo de Recall
CREATE OR REPLACE FUNCTION buscar_pacientes_recall(p_lote_id UUID)
RETURNS SETOF pacientes AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.*
    FROM recalls r
    JOIN lotes l ON r.lote_id = l.id
    JOIN entregas e ON e.lote_id = l.id
    JOIN pacientes p ON e.paciente_id = p.id
    WHERE l.id = p_lote_id;
END;
$$ LANGUAGE plpgsql;

-- Migration: Criação da tabela de Lotes e Motor FEFO

CREATE TABLE IF NOT EXISTS lotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicamento_id UUID REFERENCES medicamentos(id) ON DELETE RESTRICT,
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE RESTRICT,
    numero_lote VARCHAR NOT NULL,
    data_validade DATE NOT NULL,
    quantidade_inicial INT NOT NULL,
    quantidade_atual INT NOT NULL,
    status VARCHAR NOT NULL CHECK (
        status IN ('disponivel', 'reservado', 'esgotado', 'vencido', 'recall')
    ),
    criado_em TIMESTAMP DEFAULT now()
);

-- Índice composto CRÍTICO para motor FEFO
CREATE INDEX IF NOT EXISTS idx_lotes_fefo ON lotes(medicamento_id, data_validade, status);

-- Função SQL do motor FEFO
CREATE OR REPLACE FUNCTION fefo_next_lote(p_medicamento_id UUID)
RETURNS SETOF lotes AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM lotes
    WHERE medicamento_id = p_medicamento_id
      AND quantidade_atual > 0
      AND status = 'disponivel'
    ORDER BY data_validade ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

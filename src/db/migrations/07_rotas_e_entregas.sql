-- Migration: Criação das tabelas de Rotas e Entregas

CREATE TABLE IF NOT EXISTS rotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entregador_id UUID REFERENCES usuarios(id) ON DELETE RESTRICT,
    data_rota DATE NOT NULL,
    status VARCHAR DEFAULT 'programada' CHECK (
        status IN ('programada', 'em_rota', 'concluida')
    ),
    total_entregas INT DEFAULT 0,
    entregas_realizadas INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS entregas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rota_id UUID REFERENCES rotas(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE RESTRICT,
    lote_id UUID REFERENCES lotes(id) ON DELETE RESTRICT,
    serial_number VARCHAR UNIQUE NOT NULL,
    dispense_id VARCHAR UNIQUE NOT NULL,
    status VARCHAR DEFAULT 'separado' CHECK (
        status IN ('separado', 'conferido', 'em_rota', 'entregue', 'retorno')
    ),
    entregue_em TIMESTAMP,
    recebido_por VARCHAR,
    temperatura DECIMAL,
    criado_em TIMESTAMP DEFAULT now()
);

-- CRÍTICO: Índice em lote_id para módulo de Recall e rastreabilidade FEFO
CREATE INDEX IF NOT EXISTS idx_entregas_lote_id ON entregas(lote_id);

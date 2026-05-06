-- Migration: Criação das tabelas de Pacientes e Receitas

CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    cpf VARCHAR UNIQUE NOT NULL,
    endereco TEXT,
    telefone VARCHAR,
    medico_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    unidade_id UUID REFERENCES unidades(id) ON DELETE RESTRICT,
    criado_em TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES usuarios(id) ON DELETE RESTRICT,
    medicamento_id UUID REFERENCES medicamentos(id) ON DELETE RESTRICT,
    frequencia VARCHAR CHECK (frequencia IN ('diaria', 'semanal', 'quinzenal', 'mensal')),
    validade DATE NOT NULL,
    status VARCHAR DEFAULT 'ativa' CHECK (status IN ('ativa', 'vencida', 'cancelada')),
    criado_em TIMESTAMP DEFAULT now()
);

-- Índices solicitados
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_receitas_paciente_id ON receitas(paciente_id);

-- Migration: Criação das tabelas base (Unidades e Usuários)

CREATE TABLE IF NOT EXISTS unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    tipo VARCHAR NOT NULL,
    endereco TEXT,
    municipio VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    senha_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL CHECK (
        role IN ('secretario', 'gestor', 'postinho', 'fornecedor', 'entregador', 'medico', 'paciente')
    ),
    unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT now()
);

-- Criação dos índices solicitados para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_unidade_id ON usuarios(unidade_id);

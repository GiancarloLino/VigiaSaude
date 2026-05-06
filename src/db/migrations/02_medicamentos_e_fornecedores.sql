-- Migration: Criação das tabelas de Fornecedores e Medicamentos

CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razao_social VARCHAR NOT NULL,
    cnpj VARCHAR UNIQUE NOT NULL,
    contato VARCHAR,
    lead_time_medio DECIMAL DEFAULT 0,
    pontualidade_pct DECIMAL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS medicamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    principio_ativo VARCHAR NOT NULL,
    apresentacao VARCHAR NOT NULL,
    codigo_ggrem VARCHAR UNIQUE NOT NULL,
    preco_cmed DECIMAL NOT NULL,
    estoque_minimo INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT now()
);

-- Criação dos índices solicitados para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_medicamentos_codigo_ggrem ON medicamentos(codigo_ggrem);
CREATE INDEX IF NOT EXISTS idx_medicamentos_principio_ativo ON medicamentos(principio_ativo);
CREATE INDEX IF NOT EXISTS idx_fornecedores_cnpj ON fornecedores(cnpj);

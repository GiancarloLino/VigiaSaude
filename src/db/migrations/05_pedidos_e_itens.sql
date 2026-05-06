-- Migration: Criação das tabelas de Pedidos e Itens do Pedido

CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitante_id UUID REFERENCES usuarios(id) ON DELETE RESTRICT,
    unidade_id UUID REFERENCES unidades(id) ON DELETE RESTRICT,
    status VARCHAR DEFAULT 'solicitado' CHECK (
        status IN ('solicitado', 'aprovado', 'empenhado', 'em_transito', 'entregue', 'cancelado')
    ),
    solicitado_em TIMESTAMP DEFAULT now(),
    aprovado_em TIMESTAMP,
    empenhado_em TIMESTAMP,
    em_transito_em TIMESTAMP,
    entregue_em TIMESTAMP,
    valor_total DECIMAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS itens_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    medicamento_id UUID REFERENCES medicamentos(id) ON DELETE RESTRICT,
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE RESTRICT,
    quantidade INT NOT NULL,
    valor_unitario DECIMAL NOT NULL,
    preco_cmed_ref DECIMAL NOT NULL,
    acima_cmed BOOLEAN GENERATED ALWAYS AS (valor_unitario > preco_cmed_ref) STORED
);

-- Índices solicitados para otimização de consultas de pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_unidade_id ON pedidos(unidade_id);

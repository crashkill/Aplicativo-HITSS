-- Migration: Create DRE-HITSS table
-- Descrição: Cria tabela para armazenar dados da DRE (Demonstração do Resultado do Exercício) da HITSS

-- Criar tabela dre_hitss
CREATE TABLE IF NOT EXISTS dre_hitss (
    -- Campos de controle
    id BIGSERIAL PRIMARY KEY,
    upload_batch_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Campos financeiros principais
    tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    natureza TEXT NOT NULL CHECK (natureza IN ('RECEITA', 'CUSTO')),
    descricao TEXT NOT NULL,
    valor NUMERIC(15,2) NOT NULL,
    lancamento NUMERIC(15,2) NOT NULL,
    data TEXT, -- Período no formato "M/YYYY" (ex: 6/2019)
    
    -- Campos organizacionais
    categoria TEXT,
    periodo TEXT, -- Formato: "M/YYYY"
    projeto TEXT,
    
    -- Campos específicos HITSS
    denominacao_conta TEXT,
    conta_resumo TEXT,
    linha_negocio TEXT,
    relatorio TEXT,
    
    -- Metadados
    raw_data JSONB, -- Dados brutos do Excel para referência
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários na tabela e colunas
COMMENT ON TABLE dre_hitss IS 'Tabela para armazenar dados da DRE (Demonstração do Resultado do Exercício) da HITSS';
COMMENT ON COLUMN dre_hitss.upload_batch_id IS 'ID único do lote de upload para rastreabilidade';
COMMENT ON COLUMN dre_hitss.file_name IS 'Nome do arquivo Excel original';
COMMENT ON COLUMN dre_hitss.tipo IS 'Tipo da transação: receita ou despesa';
COMMENT ON COLUMN dre_hitss.natureza IS 'Natureza contábil: RECEITA ou CUSTO';
COMMENT ON COLUMN dre_hitss.valor IS 'Valor da transação';
COMMENT ON COLUMN dre_hitss.data IS 'Período no formato M/YYYY (ex: 6/2019)';
COMMENT ON COLUMN dre_hitss.periodo IS 'Período contábil no formato M/YYYY';
COMMENT ON COLUMN dre_hitss.raw_data IS 'Dados originais do Excel em formato JSON';

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_dre_hitss_batch ON dre_hitss(upload_batch_id);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_periodo ON dre_hitss(periodo);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_projeto ON dre_hitss(projeto);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_tipo ON dre_hitss(tipo);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_natureza ON dre_hitss(natureza);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_conta_resumo ON dre_hitss(conta_resumo);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_data ON dre_hitss(data);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_valor ON dre_hitss(valor);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_financeiro ON dre_hitss(tipo, natureza, valor);

-- Habilitar Row Level Security (RLS)
ALTER TABLE dre_hitss ENABLE ROW LEVEL SECURITY;

-- Política RLS básica (permitir tudo por enquanto - ajustar conforme necessário)
CREATE POLICY "Allow all access to dre_hitss" ON dre_hitss
    FOR ALL USING (true); 
-- Migration: Alter data column type
-- Descrição: Altera o tipo da coluna 'data' de DATE para TEXT para aceitar formato "M/YYYY"

-- Alterar o tipo da coluna data para TEXT usando USING para conversão
ALTER TABLE dre_hitss ALTER COLUMN data TYPE TEXT USING data::TEXT; 
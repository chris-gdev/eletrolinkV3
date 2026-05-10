-- ============================================================
-- ELETROLINK — Migração: Sistema de Orçamentos Formais
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Tabela principal de orçamentos formais
CREATE TABLE IF NOT EXISTS orcamentos_formais (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero              SERIAL UNIQUE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  -- Cliente
  cliente_nome        text NOT NULL,
  cliente_cpf_cnpj    text NOT NULL DEFAULT '',
  cliente_telefone    text NOT NULL,
  cliente_email       text NOT NULL DEFAULT '',
  cliente_endereco    text NOT NULL DEFAULT '',
  cliente_cidade      text NOT NULL DEFAULT '',
  cliente_estado      text NOT NULL DEFAULT 'SP',

  -- Serviço
  tipo_servico        text NOT NULL,
  descricao_servico   text NOT NULL DEFAULT '',
  local_servico       text NOT NULL DEFAULT '',
  prazo_execucao      text NOT NULL DEFAULT '',

  -- Datas
  data_emissao        date NOT NULL DEFAULT CURRENT_DATE,
  data_validade       date,

  -- Financeiro
  subtotal            numeric(12,2) NOT NULL DEFAULT 0,
  desconto            numeric(12,2) NOT NULL DEFAULT 0,
  total               numeric(12,2) NOT NULL DEFAULT 0,
  condicoes_pagamento text NOT NULL DEFAULT 'À vista',

  -- Status
  status              text NOT NULL DEFAULT 'rascunho'
                      CHECK (status IN ('rascunho','enviado','aprovado','recusado','executado','faturado')),

  -- Textos livres
  observacoes         text NOT NULL DEFAULT '',
  notas_internas      text NOT NULL DEFAULT ''
);

-- 2. Tabela de itens do orçamento
CREATE TABLE IF NOT EXISTS orcamento_itens (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id    uuid NOT NULL REFERENCES orcamentos_formais(id) ON DELETE CASCADE,
  descricao       text NOT NULL,
  quantidade      numeric(10,3) NOT NULL DEFAULT 1,
  unidade         text NOT NULL DEFAULT 'un',
  valor_unitario  numeric(12,2) NOT NULL DEFAULT 0,
  total           numeric(12,2) NOT NULL DEFAULT 0,
  ordem           integer NOT NULL DEFAULT 0
);

-- 3. RLS
ALTER TABLE orcamentos_formais ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_itens    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_orcamentos_formais" ON orcamentos_formais
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_orcamento_itens" ON orcamento_itens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orcamentos_formais_updated_at
  BEFORE UPDATE ON orcamentos_formais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

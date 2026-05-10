-- ═══════════════════════════════════════════════════════════════
--  Laudos — Manutenções e Projetos Elétricos
-- ═══════════════════════════════════════════════════════════════

-- Tabela principal de laudos
CREATE TABLE IF NOT EXISTS laudos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero                SERIAL UNIQUE NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  -- Tipo e status
  tipo                  TEXT NOT NULL DEFAULT 'manutencao'
                          CHECK (tipo IN ('manutencao','projeto','vistoria','conformidade','instalacoes')),
  status                TEXT NOT NULL DEFAULT 'rascunho'
                          CHECK (status IN ('rascunho','emitido','entregue','arquivado')),

  -- Cliente / Contratante
  cliente_nome          TEXT NOT NULL DEFAULT '',
  cliente_cpf_cnpj      TEXT NOT NULL DEFAULT '',
  cliente_telefone      TEXT NOT NULL DEFAULT '',
  cliente_email         TEXT NOT NULL DEFAULT '',
  cliente_endereco      TEXT NOT NULL DEFAULT '',
  cliente_cidade        TEXT NOT NULL DEFAULT '',
  cliente_estado        TEXT NOT NULL DEFAULT '',

  -- Local e datas
  local_inspecao        TEXT NOT NULL DEFAULT '',
  data_inspecao         DATE,
  data_emissao          DATE,
  data_validade         DATE,

  -- Responsável técnico
  responsavel_tecnico   TEXT NOT NULL DEFAULT '',
  crea_numero           TEXT NOT NULL DEFAULT '',
  art_numero            TEXT NOT NULL DEFAULT '',

  -- Conteúdo técnico do laudo
  objetivo              TEXT NOT NULL DEFAULT '',
  metodologia           TEXT NOT NULL DEFAULT '',
  descricao_instalacao  TEXT NOT NULL DEFAULT '',
  condicoes_encontradas TEXT NOT NULL DEFAULT '',
  nao_conformidades     TEXT NOT NULL DEFAULT '',
  recomendacoes         TEXT NOT NULL DEFAULT '',
  conclusao             TEXT NOT NULL DEFAULT '',

  -- Resultado geral
  conformidade          TEXT NOT NULL DEFAULT 'conforme'
                          CHECK (conformidade IN ('conforme','nao_conforme','com_ressalvas')),

  -- Extras
  normas_aplicadas      TEXT NOT NULL DEFAULT '',
  observacoes           TEXT NOT NULL DEFAULT '',
  notas_internas        TEXT NOT NULL DEFAULT ''
);

-- Itens de verificação do laudo (checklist)
CREATE TABLE IF NOT EXISTS laudo_itens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laudo_id    UUID NOT NULL REFERENCES laudos(id) ON DELETE CASCADE,
  descricao   TEXT NOT NULL DEFAULT '',
  resultado   TEXT NOT NULL DEFAULT 'conforme'
                CHECK (resultado IN ('conforme','nao_conforme','nao_aplicavel')),
  observacao  TEXT NOT NULL DEFAULT '',
  ordem       INTEGER NOT NULL DEFAULT 0
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_laudo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_laudo_updated_at
  BEFORE UPDATE ON laudos
  FOR EACH ROW EXECUTE FUNCTION update_laudo_updated_at();

-- RLS
ALTER TABLE laudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE laudo_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY auth_all_laudos ON laudos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY auth_all_laudo_itens ON laudo_itens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_laudos_status   ON laudos(status);
CREATE INDEX IF NOT EXISTS idx_laudos_tipo     ON laudos(tipo);
CREATE INDEX IF NOT EXISTS idx_laudo_itens_laudo ON laudo_itens(laudo_id);

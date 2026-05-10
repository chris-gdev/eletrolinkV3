-- ============================================================
-- ELETROLINK — Migração: Fotos dos Orçamentos
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Tabela de fotos
CREATE TABLE IF NOT EXISTS orcamento_fotos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid NOT NULL REFERENCES orcamentos_formais(id) ON DELETE CASCADE,
  url          text NOT NULL,
  nome         text NOT NULL DEFAULT '',
  legenda      text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orcamento_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_orcamento_fotos" ON orcamento_fotos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Bucket de storage público (fotos acessíveis via URL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('orcamento-fotos', 'orcamento-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas do Storage
CREATE POLICY "fotos_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'orcamento-fotos');

CREATE POLICY "fotos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'orcamento-fotos');

CREATE POLICY "fotos_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'orcamento-fotos');

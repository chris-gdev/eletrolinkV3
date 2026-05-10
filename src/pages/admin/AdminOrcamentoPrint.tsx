import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { OrcamentoFormal, ItemOrcamento } from '../../types'
import { Config } from '../../hooks/useConfig'

const defaultConfig: Config = {
  nome_empresa: 'Eletro Link Manutenções',
  telefone: '(11) 94764-1802',
  whatsapp: '5511947641802',
  email: 'eletrolink220@gmail.com',
  endereco: 'São Paulo - SP e Grande São Paulo',
  horario: 'Seg-Sex 8h-18h · Sáb 8h-12h',
  instagram: '',
  facebook: '',
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

function formatNumero(n: number) {
  return String(n).padStart(4, '0')
}

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho', enviado: 'Enviado', aprovado: 'Aprovado',
  recusado: 'Recusado', executado: 'Executado', faturado: 'Faturado',
}

export default function AdminOrcamentoPrint() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [orc, setOrc] = useState<OrcamentoFormal | null>(null)
  const [itens, setItens] = useState<ItemOrcamento[]>([])
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: orcData }, { data: configData }] = await Promise.all([
        supabase.from('orcamentos_formais').select('*').eq('id', id).single(),
        supabase.from('configuracoes').select('*').eq('id', 1).single(),
      ])

      if (!orcData) { navigate('/admin/orcamentos'); return }

      const { data: itensData } = await supabase
        .from('orcamento_itens')
        .select('*')
        .eq('orcamento_id', id)
        .order('ordem', { ascending: true })

      setOrc(orcData as OrcamentoFormal)
      setItens((itensData || []) as ItemOrcamento[])
      if (configData) setConfig(configData as Config)
      setLoading(false)
    }
    load()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 font-sans">Carregando orçamento...</p>
      </div>
    )
  }

  if (!orc) return null

  return (
    <>
      {/* Barra de ações — não aparece na impressão */}
      <div className="print:hidden bg-gray-100 border-b border-gray-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-sans transition-colors"
        >
          <ArrowLeft size={15} /> Voltar
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-sans px-4 py-1.5 rounded transition-colors"
        >
          <Printer size={15} /> Imprimir / Salvar como PDF
        </button>
        <span className="text-gray-500 text-xs font-sans">
          Use Ctrl+P ou o botão acima. No diálogo de impressão, escolha "Salvar como PDF".
        </span>
      </div>

      {/* ── DOCUMENTO ─────────────────────────────────────────────────────── */}
      <div
        id="doc"
        className="bg-white mx-auto font-sans text-gray-800"
        style={{ maxWidth: 820, padding: '40px 48px', minHeight: '100vh' }}
      >

        {/* CABEÇALHO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 20, borderBottom: '2px solid #1d4ed8' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1d4ed8', letterSpacing: 1, marginBottom: 4 }}>
              {config.nome_empresa.toUpperCase()}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.7 }}>
              {config.endereco && <div>{config.endereco}</div>}
              {config.telefone && <div>Tel: {config.telefone}</div>}
              {config.email && <div>{config.email}</div>}
              {config.horario && <div>{config.horario}</div>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: 1 }}>
              ORÇAMENTO
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1d4ed8' }}>
              #{formatNumero(orc.numero)}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6, lineHeight: 1.8 }}>
              <div>Emissão: {formatDate(orc.data_emissao)}</div>
              {orc.data_validade && <div>Validade: {formatDate(orc.data_validade)}</div>}
              <div style={{ marginTop: 4 }}>
                <span style={{
                  background: '#dbeafe', color: '#1e40af',
                  padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700
                }}>
                  {STATUS_LABEL[orc.status] || orc.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DADOS DO CLIENTE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Cliente / Tomador
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{orc.cliente_nome}</div>
            {orc.cliente_cpf_cnpj && <div style={{ fontSize: 12, color: '#374151' }}>CPF/CNPJ: {orc.cliente_cpf_cnpj}</div>}
            {orc.cliente_telefone && <div style={{ fontSize: 12, color: '#374151' }}>Tel: {orc.cliente_telefone}</div>}
            {orc.cliente_email && <div style={{ fontSize: 12, color: '#374151' }}>{orc.cliente_email}</div>}
          </div>

          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Endereço / Local do Serviço
            </div>
            {(orc.local_servico || orc.cliente_endereco) ? (
              <>
                <div style={{ fontSize: 12, color: '#374151', marginBottom: 2 }}>
                  {orc.local_servico || orc.cliente_endereco}
                </div>
                {orc.cliente_cidade && (
                  <div style={{ fontSize: 12, color: '#374151' }}>
                    {orc.cliente_cidade}{orc.cliente_estado ? ` - ${orc.cliente_estado}` : ''}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Não informado</div>
            )}
          </div>
        </div>

        {/* TIPO E DESCRIÇÃO DO SERVIÇO */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Tipo de Serviço
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{orc.tipo_servico}</div>
          {orc.descricao_servico && (
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 4, padding: '10px 14px' }}>
              {orc.descricao_servico}
            </div>
          )}
        </div>

        {/* ITENS */}
        {itens.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Itens / Serviços
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#1d4ed8', color: '#fff' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, borderRadius: '4px 0 0 0' }}>Descrição</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, width: 60 }}>Qtd</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, width: 50 }}>Un.</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, width: 110 }}>Valor Unit.</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, width: 110, borderRadius: '0 4px 0 0' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, idx) => (
                  <tr key={item.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', color: '#111827' }}>{item.descricao}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', color: '#374151' }}>
                      {Number(item.quantidade) % 1 === 0 ? Number(item.quantidade) : Number(item.quantidade).toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', color: '#374151' }}>{item.unidade}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#374151' }}>{formatBRL(item.valor_unitario)}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{formatBRL(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TOTAIS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
          <div style={{ width: 260 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb', fontSize: 13 }}>
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span style={{ color: '#111827' }}>{formatBRL(orc.subtotal)}</span>
            </div>
            {orc.desconto > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb', fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Desconto</span>
                <span style={{ color: '#dc2626' }}>- {formatBRL(orc.desconto)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 16, fontWeight: 800, color: '#1d4ed8' }}>
              <span>TOTAL</span>
              <span>{formatBRL(orc.total)}</span>
            </div>
          </div>
        </div>

        {/* CONDIÇÕES / PRAZO */}
        <div style={{ display: 'grid', gridTemplateColumns: orc.prazo_execucao ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Condições de Pagamento
            </div>
            <div style={{ fontSize: 13, color: '#111827' }}>{orc.condicoes_pagamento}</div>
          </div>
          {orc.prazo_execucao && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Prazo de Execução
              </div>
              <div style={{ fontSize: 13, color: '#111827' }}>{orc.prazo_execucao}</div>
            </div>
          )}
        </div>

        {/* OBSERVAÇÕES */}
        {orc.observacoes && (
          <div style={{ marginBottom: 28, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '12px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Observações
            </div>
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{orc.observacoes}</div>
          </div>
        )}

        {/* ASSINATURAS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 48, marginBottom: 48 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #9ca3af', paddingTop: 8, fontSize: 11, color: '#6b7280' }}>
              {config.nome_empresa}
              <div style={{ fontSize: 10 }}>Responsável Técnico</div>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #9ca3af', paddingTop: 8, fontSize: 11, color: '#6b7280' }}>
              {orc.cliente_nome}
              <div style={{ fontSize: 10 }}>Cliente / Contratante</div>
            </div>
          </div>
        </div>

        {/* ── DADOS PARA NOTA FISCAL (referência) ──────────────────────────── */}
        <div style={{ borderTop: '2px dashed #d1d5db', paddingTop: 24, marginTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14, textAlign: 'center' }}>
            ▪ Dados de Referência para Emissão de Nota Fiscal ▪
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, color: '#374151' }}>
            <Row label="Tomador" value={orc.cliente_nome} />
            <Row label="CPF / CNPJ do Tomador" value={orc.cliente_cpf_cnpj || 'Não informado'} />
            <Row label="Endereço do Tomador" value={[orc.cliente_endereco, orc.cliente_cidade, orc.cliente_estado].filter(Boolean).join(', ') || 'Não informado'} />
            <Row label="Data de Emissão" value={formatDate(orc.data_emissao)} />
            <Row label="Discriminação dos Serviços" value={orc.tipo_servico + (orc.descricao_servico ? ' — ' + orc.descricao_servico : '')} />
            <Row label="Valor Total dos Serviços" value={formatBRL(orc.total)} />
            <Row label="Condições de Pagamento" value={orc.condicoes_pagamento} />
            <Row label="Nº do Orçamento (referência)" value={`#${formatNumero(orc.numero)}`} />
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>
            Esta seção é apenas uma referência interna. A Nota Fiscal deve ser emitida no portal gov.br / prefeitura municipal.
          </div>
        </div>

        {/* Rodapé */}
        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 10, color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
          {config.nome_empresa} · {config.telefone} · {config.email}
          {config.horario && ` · ${config.horario}`}
        </div>

      </div>

      {/* CSS de impressão */}
      <style>{`
        @media print {
          body { margin: 0; }
          #doc { max-width: 100% !important; padding: 24px 32px !important; }
        }
      `}</style>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ fontWeight: 700, color: '#6b7280', marginRight: 4 }}>{label}:</span>
      <span>{value}</span>
    </div>
  )
}

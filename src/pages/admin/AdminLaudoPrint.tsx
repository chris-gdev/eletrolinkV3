import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Laudo, LaudoItem } from '../../types'
import { Config } from '../../hooks/useConfig'

// ─── cores da marca ────────────────────────────────────────────────────────
const BRAND = {
  navy:       '#0b0f2e',
  blue:       '#1a2fa0',
  yellow:     '#f5c400',
  yellowDark: '#c49a00',
  white:      '#ffffff',
  gray50:     '#f9fafb',
  gray100:    '#f3f4f6',
  gray200:    '#e5e7eb',
  gray300:    '#d1d5db',
  gray500:    '#6b7280',
  gray700:    '#374151',
  gray900:    '#111827',
  green:      '#15803d',
  greenBg:    '#f0fdf4',
  red:        '#dc2626',
  redBg:      '#fef2f2',
  yellow2:    '#92400e',
  yellowBg:   '#fffbeb',
}

const defaultConfig: Config = {
  nome_empresa: 'Eletro Link Manutenções',
  telefone:    '(11) 94764-1802',
  whatsapp:    '5511947641802',
  email:       'eletrolink220@gmail.com',
  endereco:    'São Paulo - SP e Grande São Paulo',
  horario:     'Seg-Sex 8h-18h · Sáb 8h-12h',
  instagram:   '',
  facebook:    '',
}

// ─── labels ────────────────────────────────────────────────────────────────
const TIPO_LABEL: Record<string, string> = {
  manutencao:   'Laudo de Manutenção Elétrica',
  projeto:      'Laudo de Projeto Elétrico',
  vistoria:     'Laudo de Vistoria Elétrica',
  conformidade: 'Laudo de Conformidade (NR-10 / NBR 5410)',
  instalacoes:  'Laudo de Instalações Elétricas',
}

const STATUS_LABEL: Record<string, string> = {
  rascunho:  'Rascunho',
  emitido:   'Emitido',
  entregue:  'Entregue',
  arquivado: 'Arquivado',
}
const STATUS_COLOR: Record<string, string> = {
  rascunho:  BRAND.gray500,
  emitido:   '#2563eb',
  entregue:  '#16a34a',
  arquivado: BRAND.gray500,
}

const CONFORMIDADE_LABEL: Record<string, string> = {
  conforme:      'CONFORME',
  nao_conforme:  'NÃO CONFORME',
  com_ressalvas: 'COM RESSALVAS',
}
const CONFORMIDADE_COLOR: Record<string, string> = {
  conforme:      BRAND.green,
  nao_conforme:  BRAND.red,
  com_ressalvas: '#d97706',
}
const CONFORMIDADE_BG: Record<string, string> = {
  conforme:      BRAND.greenBg,
  nao_conforme:  BRAND.redBg,
  com_ressalvas: BRAND.yellowBg,
}

const RESULTADO_LABEL: Record<string, string> = {
  conforme:      'Conforme',
  nao_conforme:  'Não Conforme',
  nao_aplicavel: 'N/A',
}
const RESULTADO_COLOR: Record<string, string> = {
  conforme:      BRAND.green,
  nao_conforme:  BRAND.red,
  nao_aplicavel: BRAND.gray500,
}

// ─── utils ─────────────────────────────────────────────────────────────────
function formatDate(s: string) {
  if (!s) return '—'
  return new Date(s + 'T00:00:00').toLocaleDateString('pt-BR')
}
function formatNumero(n: number) {
  return String(n).padStart(4, '0')
}

// ─── sub-componentes ───────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, color: BRAND.blue,
      textTransform: 'uppercase', letterSpacing: 1.2,
      marginBottom: 6, borderLeft: `3px solid ${BRAND.yellow}`, paddingLeft: 6,
    }}>
      {children}
    </div>
  )
}

function InfoBox({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: BRAND.gray50, border: `1px solid ${BRAND.gray100}`,
      borderRadius: 6, padding: '12px 16px', ...style,
    }}>
      {children}
    </div>
  )
}

function TextBlock({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <SectionLabel>{label}</SectionLabel>
      <div style={{
        fontSize: 12, color: BRAND.gray700, lineHeight: 1.7,
        whiteSpace: 'pre-line', background: BRAND.gray50,
        border: `1px solid ${BRAND.gray100}`, borderRadius: 4,
        padding: '10px 14px',
      }}>
        {value}
      </div>
    </div>
  )
}

// ─── componente principal ──────────────────────────────────────────────────
export default function AdminLaudoPrint() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [laudo, setLaudo] = useState<Laudo | null>(null)
  const [itens, setItens] = useState<LaudoItem[]>([])
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: laudoData }, { data: configData }] = await Promise.all([
        supabase.from('laudos').select('*').eq('id', id).single(),
        supabase.from('configuracoes').select('*').eq('id', 1).single(),
      ])
      if (!laudoData) { navigate('/admin/laudos'); return }

      const { data: itensData } = await supabase
        .from('laudo_itens').select('*').eq('laudo_id', id).order('ordem')

      setLaudo(laudoData as Laudo)
      setItens((itensData || []) as LaudoItem[])
      if (configData) setConfig(configData as Config)
      setLoading(false)
    }
    load()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.navy }}>
        <p style={{ color: BRAND.yellow, fontFamily: 'sans-serif' }}>Carregando laudo...</p>
      </div>
    )
  }
  if (!laudo) return null

  const conformidadeBg    = CONFORMIDADE_BG[laudo.conformidade]    || BRAND.gray50
  const conformidadeColor = CONFORMIDADE_COLOR[laudo.conformidade] || BRAND.gray700
  const statusColor       = STATUS_COLOR[laudo.status]             || BRAND.gray500

  const itensNaoConformes = itens.filter(i => i.resultado === 'nao_conforme')
  const itensConformes    = itens.filter(i => i.resultado === 'conforme')

  return (
    <>
      {/* ── Barra de ações (não imprime) ─────────────────────────────────── */}
      <div
        className="print:hidden sticky top-0 z-10 flex items-center gap-4 px-6 py-3"
        style={{ background: BRAND.navy, borderBottom: `2px solid ${BRAND.yellow}` }}
      >
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: BRAND.gray300, fontFamily: 'sans-serif' }}
        >
          <ArrowLeft size={15} /> Voltar
        </button>
        <span style={{ color: BRAND.gray500 }}>|</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-sm px-4 py-1.5 rounded transition-colors"
          style={{ background: BRAND.yellow, color: BRAND.navy, fontFamily: 'sans-serif', fontWeight: 700 }}
        >
          <Printer size={15} /> Imprimir / Salvar como PDF
        </button>
        <span style={{ color: BRAND.gray500, fontSize: 12, fontFamily: 'sans-serif' }}>
          No diálogo de impressão, escolha "Salvar como PDF".
        </span>
      </div>

      {/* ── DOCUMENTO ────────────────────────────────────────────────────── */}
      <div id="doc" style={{
        background: BRAND.white, maxWidth: 820, margin: '0 auto',
        fontFamily: "'Segoe UI', Arial, sans-serif", color: BRAND.gray900, minHeight: '100vh',
      }}>

        {/* ══ CABEÇALHO ════════════════════════════════════════════════════ */}
        <div style={{
          background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.blue} 100%)`,
          padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img src="/logo.png" alt="Eletro Link" style={{ height: 72, width: 'auto', objectFit: 'contain' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div>
              <div style={{ fontSize: 10, color: BRAND.yellow, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
                Eletrolink Manutenções
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                {config.endereco && <div>{config.endereco}</div>}
                {config.telefone && <div>Tel: {config.telefone}</div>}
                {config.email    && <div>{config.email}</div>}
                {config.horario  && <div>{config.horario}</div>}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: BRAND.yellow, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
              {TIPO_LABEL[laudo.tipo] || 'Laudo Técnico'}
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: BRAND.white, lineHeight: 1 }}>
              #{formatNumero(laudo.numero)}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 8, lineHeight: 1.9 }}>
              {laudo.data_inspecao && <div>Inspeção: <strong style={{ color: BRAND.white }}>{formatDate(laudo.data_inspecao)}</strong></div>}
              {laudo.data_emissao  && <div>Emissão: <strong style={{ color: BRAND.white }}>{formatDate(laudo.data_emissao)}</strong></div>}
              {laudo.data_validade && <div>Validade: <strong style={{ color: BRAND.white }}>{formatDate(laudo.data_validade)}</strong></div>}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <span style={{ background: statusColor, color: BRAND.white, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
                {STATUS_LABEL[laudo.status] || laudo.status}
              </span>
            </div>
          </div>
        </div>

        {/* Faixa amarela */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${BRAND.yellow}, ${BRAND.yellowDark})` }} />

        {/* ── Resultado de Conformidade (destaque) ─────────────────────── */}
        <div style={{ padding: '20px 40px 0' }}>
          <div style={{
            background: conformidadeBg, border: `2px solid ${conformidadeColor}`,
            borderRadius: 8, padding: '16px 24px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: BRAND.gray500, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                Resultado da Inspeção
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: conformidadeColor, letterSpacing: 1 }}>
                {CONFORMIDADE_LABEL[laudo.conformidade]}
              </div>
            </div>
            {itens.length > 0 && (
              <div style={{ textAlign: 'right', fontSize: 11, color: BRAND.gray700 }}>
                <div><strong>{itens.length}</strong> itens verificados</div>
                <div style={{ color: BRAND.green }}><strong>{itensConformes.length}</strong> conformes</div>
                {itensNaoConformes.length > 0 && (
                  <div style={{ color: BRAND.red }}><strong>{itensNaoConformes.length}</strong> não conformes</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Conteúdo ────────────────────────────────────────────────────── */}
        <div style={{ padding: '24px 40px' }}>

          {/* Cliente + Local */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <InfoBox>
              <SectionLabel>Cliente / Contratante</SectionLabel>
              <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.gray900, marginBottom: 4 }}>{laudo.cliente_nome}</div>
              {laudo.cliente_cpf_cnpj && <div style={{ fontSize: 12, color: BRAND.gray700 }}>CPF/CNPJ: {laudo.cliente_cpf_cnpj}</div>}
              {laudo.cliente_telefone && <div style={{ fontSize: 12, color: BRAND.gray700 }}>Tel: {laudo.cliente_telefone}</div>}
              {laudo.cliente_email    && <div style={{ fontSize: 12, color: BRAND.gray700 }}>{laudo.cliente_email}</div>}
            </InfoBox>
            <InfoBox>
              <SectionLabel>Local da Inspeção</SectionLabel>
              {laudo.local_inspecao || laudo.cliente_endereco ? (
                <>
                  <div style={{ fontSize: 12, color: BRAND.gray700, marginBottom: 2 }}>{laudo.local_inspecao || laudo.cliente_endereco}</div>
                  {laudo.cliente_cidade && (
                    <div style={{ fontSize: 12, color: BRAND.gray700 }}>
                      {laudo.cliente_cidade}{laudo.cliente_estado ? ` - ${laudo.cliente_estado}` : ''}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 12, color: BRAND.gray500 }}>Não informado</div>
              )}
            </InfoBox>
          </div>

          {/* Responsável técnico + Normas */}
          {(laudo.responsavel_tecnico || laudo.crea_numero || laudo.art_numero || laudo.normas_aplicadas) && (
            <div style={{ marginBottom: 24 }}>
              <SectionLabel>Responsável Técnico</SectionLabel>
              <InfoBox>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {laudo.responsavel_tecnico && (
                    <div>
                      <div style={{ fontSize: 9, color: BRAND.gray500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Responsável</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.gray900 }}>{laudo.responsavel_tecnico}</div>
                    </div>
                  )}
                  {laudo.crea_numero && (
                    <div>
                      <div style={{ fontSize: 9, color: BRAND.gray500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>CREA</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.gray900 }}>{laudo.crea_numero}</div>
                    </div>
                  )}
                  {laudo.art_numero && (
                    <div>
                      <div style={{ fontSize: 9, color: BRAND.gray500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>ART</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.gray900 }}>{laudo.art_numero}</div>
                    </div>
                  )}
                  {laudo.normas_aplicadas && (
                    <div style={{ gridColumn: laudo.responsavel_tecnico && laudo.crea_numero && laudo.art_numero ? '4' : 'span 2' }}>
                      <div style={{ fontSize: 9, color: BRAND.gray500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Normas</div>
                      <div style={{ fontSize: 11, color: BRAND.gray700 }}>{laudo.normas_aplicadas}</div>
                    </div>
                  )}
                </div>
              </InfoBox>
            </div>
          )}

          {/* Conteúdo técnico */}
          <TextBlock label="Objetivo" value={laudo.objetivo} />
          <TextBlock label="Metodologia Utilizada" value={laudo.metodologia} />
          <TextBlock label="Descrição da Instalação" value={laudo.descricao_instalacao} />
          <TextBlock label="Condições Encontradas" value={laudo.condicoes_encontradas} />

          {/* Checklist */}
          {itens.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionLabel>Checklist de Verificação</SectionLabel>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: BRAND.navy, color: BRAND.white }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, width: 30 }}>#</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Item Verificado</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, width: 130 }}>Resultado</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, width: 220 }}>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, idx) => (
                    <tr key={item.id} style={{ background: idx % 2 === 0 ? BRAND.white : BRAND.gray50 }}>
                      <td style={{ padding: '7px 12px', borderBottom: `1px solid ${BRAND.gray100}`, color: BRAND.gray500, textAlign: 'center' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '7px 12px', borderBottom: `1px solid ${BRAND.gray100}`, color: BRAND.gray900 }}>
                        {item.descricao}
                      </td>
                      <td style={{ padding: '7px 12px', borderBottom: `1px solid ${BRAND.gray100}`, textAlign: 'center' }}>
                        <span style={{
                          color: RESULTADO_COLOR[item.resultado] || BRAND.gray700,
                          fontWeight: 700, fontSize: 11,
                        }}>
                          {RESULTADO_LABEL[item.resultado] || item.resultado}
                        </span>
                      </td>
                      <td style={{ padding: '7px 12px', borderBottom: `1px solid ${BRAND.gray100}`, color: BRAND.gray500, fontSize: 11 }}>
                        {item.observacao || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Não conformidades e recomendações */}
          <TextBlock label="Não Conformidades Identificadas" value={laudo.nao_conformidades} />
          <TextBlock label="Recomendações" value={laudo.recomendacoes} />
          <TextBlock label="Conclusão" value={laudo.conclusao} />

          {/* Observações */}
          {laudo.observacoes && (
            <div style={{
              marginBottom: 28, padding: '12px 16px', borderRadius: 6,
              background: '#fefce8', border: `1px solid ${BRAND.yellow}`,
              borderLeft: `4px solid ${BRAND.yellow}`,
            }}>
              <SectionLabel>Observações</SectionLabel>
              <div style={{ fontSize: 12, color: BRAND.gray700, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {laudo.observacoes}
              </div>
            </div>
          )}

          {/* Assinaturas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 56, marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: `2px solid ${BRAND.navy}`, paddingTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.navy }}>
                  {laudo.responsavel_tecnico || config.nome_empresa}
                </div>
                {laudo.crea_numero && (
                  <div style={{ fontSize: 10, color: BRAND.gray500, marginTop: 2 }}>CREA: {laudo.crea_numero}</div>
                )}
                <div style={{ fontSize: 10, color: BRAND.gray500, marginTop: 2 }}>Responsável Técnico</div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: `2px solid ${BRAND.navy}`, paddingTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.navy }}>{laudo.cliente_nome}</div>
                <div style={{ fontSize: 10, color: BRAND.gray500, marginTop: 2 }}>Cliente / Contratante</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RODAPÉ ═══════════════════════════════════════════════════════ */}
        <div style={{
          background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.blue} 100%)`,
          padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
            {config.nome_empresa} · {config.telefone} · {config.email}
          </div>
          <div style={{ fontSize: 10, color: BRAND.yellow, fontWeight: 700 }}>
            Laudo #{formatNumero(laudo.numero)}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; }
          #doc { max-width: 100% !important; }
        }
      `}</style>
    </>
  )
}

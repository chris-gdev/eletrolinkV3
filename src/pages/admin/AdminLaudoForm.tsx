import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save, ArrowLeft, Printer, Plus, Trash2, GripVertical,
  ChevronDown, CheckCircle, XCircle, MinusCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import {
  Laudo, LaudoItem, TipoLaudo, StatusLaudo,
  ConformidadeLaudo, ResultadoItemLaudo,
} from '../../types'

// ─── opções de select ────────────────────────────────────────────────────────

const TIPOS: { value: TipoLaudo; label: string }[] = [
  { value: 'manutencao',   label: 'Laudo de Manutenção Elétrica' },
  { value: 'projeto',      label: 'Laudo de Projeto Elétrico' },
  { value: 'vistoria',     label: 'Laudo de Vistoria Elétrica' },
  { value: 'conformidade', label: 'Laudo de Conformidade (NR-10 / NBR 5410)' },
  { value: 'instalacoes',  label: 'Laudo de Instalações Elétricas' },
]

const STATUS_OPTS: { value: StatusLaudo; label: string }[] = [
  { value: 'rascunho',  label: 'Rascunho' },
  { value: 'emitido',   label: 'Emitido' },
  { value: 'entregue',  label: 'Entregue' },
  { value: 'arquivado', label: 'Arquivado' },
]

const CONFORMIDADE_OPTS: { value: ConformidadeLaudo; label: string; color: string }[] = [
  { value: 'conforme',      label: 'Conforme',      color: 'text-green-400' },
  { value: 'nao_conforme',  label: 'Não Conforme',  color: 'text-red-400' },
  { value: 'com_ressalvas', label: 'Com Ressalvas',  color: 'text-yellow-400' },
]

const RESULTADO_OPTS: { value: ResultadoItemLaudo; label: string; icon: React.ReactNode }[] = [
  { value: 'conforme',      label: 'Conforme',       icon: <CheckCircle size={14} className="text-green-400" /> },
  { value: 'nao_conforme',  label: 'Não Conforme',   icon: <XCircle size={14} className="text-red-400" /> },
  { value: 'nao_aplicavel', label: 'N/A',             icon: <MinusCircle size={14} className="text-gray-400" /> },
]

const NORMAS_COMUNS = [
  'ABNT NBR 5410 — Instalações Elétricas de Baixa Tensão',
  'ABNT NBR 14039 — Instalações Elétricas de Média Tensão',
  'NR-10 — Segurança em Instalações e Serviços em Eletricidade',
  'NR-12 — Segurança no Trabalho em Máquinas e Equipamentos',
  'ABNT NBR IEC 60079 — Atmosferas Explosivas',
]

// ─── estado inicial ──────────────────────────────────────────────────────────

const EMPTY: Omit<Laudo, 'id' | 'numero' | 'created_at' | 'updated_at' | 'itens'> = {
  tipo: 'manutencao',
  status: 'rascunho',
  cliente_nome: '',
  cliente_cpf_cnpj: '',
  cliente_telefone: '',
  cliente_email: '',
  cliente_endereco: '',
  cliente_cidade: '',
  cliente_estado: '',
  local_inspecao: '',
  data_inspecao: '',
  data_emissao: new Date().toISOString().slice(0, 10),
  data_validade: '',
  responsavel_tecnico: '',
  crea_numero: '',
  art_numero: '',
  objetivo: '',
  metodologia: '',
  descricao_instalacao: '',
  condicoes_encontradas: '',
  nao_conformidades: '',
  recomendacoes: '',
  conclusao: '',
  conformidade: 'conforme',
  normas_aplicadas: '',
  observacoes: '',
  notas_internas: '',
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-bold text-sm uppercase tracking-wider text-primary-400 border-b border-dark-500 pb-2 mb-4">
      {children}
    </h2>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── componente principal ────────────────────────────────────────────────────

export default function AdminLaudoForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [numero, setNumero] = useState<number | null>(null)
  const [itens, setItens] = useState<LaudoItem[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    async function load() {
      const [{ data: laudo }, { data: itensData }] = await Promise.all([
        supabase.from('laudos').select('*').eq('id', id).single(),
        supabase.from('laudo_itens').select('*').eq('laudo_id', id).order('ordem'),
      ])
      if (!laudo) { navigate('/admin/laudos'); return }
      const { id: _id, numero: n, created_at: _c, updated_at: _u, itens: _i, ...rest } = laudo as Laudo
      setForm(rest)
      setNumero(n)
      setItens((itensData || []) as LaudoItem[])
      setLoading(false)
    }
    load()
  }, [id, isEdit, navigate])

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  // ── itens de verificação ──────────────────────────────────────────────────

  function addItem() {
    const novo: LaudoItem = {
      id: crypto.randomUUID(),
      laudo_id: id || '',
      descricao: '',
      resultado: 'conforme',
      observacao: '',
      ordem: itens.length,
    }
    setItens(prev => [...prev, novo])
  }

  function updateItem(idx: number, key: keyof LaudoItem, value: string) {
    setItens(prev => prev.map((item, i) => i === idx ? { ...item, [key]: value } : item))
  }

  function removeItem(idx: number) {
    setItens(prev => prev.filter((_, i) => i !== idx))
  }

  // ── salvar ────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.tipo) { toast.error('Selecione o tipo do laudo.'); return }
    setSaving(true)

    try {
      let laudoId = id

      if (isEdit) {
        const { error } = await supabase.from('laudos').update(form).eq('id', id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('laudos').insert(form).select().single()
        if (error) throw error
        laudoId = (data as Laudo).id
        setNumero((data as Laudo).numero)
      }

      // Sincronizar itens: deletar todos e reinserir para manter ordem
      await supabase.from('laudo_itens').delete().eq('laudo_id', laudoId)
      if (itens.length > 0) {
        const rows = itens.map((item, idx) => ({
          laudo_id: laudoId,
          descricao: item.descricao,
          resultado: item.resultado,
          observacao: item.observacao,
          ordem: idx,
        }))
        const { error } = await supabase.from('laudo_itens').insert(rows)
        if (error) throw error
      }

      toast.success(isEdit ? 'Laudo atualizado.' : 'Laudo criado com sucesso.')
      if (!isEdit && laudoId) navigate(`/admin/laudos/${laudoId}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar laudo.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500 font-body text-sm">Carregando laudo...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/laudos')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm font-body mb-2"
          >
            <ArrowLeft size={14} /> Voltar aos laudos
          </button>
          <h1 className="font-display font-bold text-2xl text-white uppercase tracking-wider">
            {isEdit ? `Laudo #${String(numero).padStart(4, '0')}` : 'Novo Laudo'}
          </h1>
        </div>
        <div className="flex gap-2">
          {isEdit && (
            <button
              onClick={() => window.open(`/admin/laudos/${id}/imprimir`, '_blank')}
              className="flex items-center gap-2 text-sm py-2.5 px-4 border border-dark-400 text-gray-300 hover:text-white hover:border-dark-300 transition-colors rounded-sm font-display uppercase tracking-wider"
            >
              <Printer size={14} /> PDF
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Salvando...' : 'Salvar Laudo'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Identificação ──────────────────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Identificação</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo de Laudo" required>
              <div className="relative">
                <select
                  value={form.tipo}
                  onChange={e => set('tipo', e.target.value as TipoLaudo)}
                  className="input-dark appearance-none pr-8"
                >
                  {TIPOS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </Field>
            <Field label="Status">
              <div className="relative">
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value as StatusLaudo)}
                  className="input-dark appearance-none pr-8"
                >
                  {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </Field>
            <Field label="Data da Inspeção">
              <input type="date" value={form.data_inspecao} onChange={e => set('data_inspecao', e.target.value)} className="input-dark" />
            </Field>
            <Field label="Data de Emissão">
              <input type="date" value={form.data_emissao} onChange={e => set('data_emissao', e.target.value)} className="input-dark" />
            </Field>
            <Field label="Data de Validade">
              <input type="date" value={form.data_validade} onChange={e => set('data_validade', e.target.value)} className="input-dark" />
            </Field>
            <Field label="Resultado Geral" required>
              <div className="flex gap-3">
                {CONFORMIDADE_OPTS.map(o => (
                  <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="conformidade"
                      value={o.value}
                      checked={form.conformidade === o.value}
                      onChange={() => set('conformidade', o.value)}
                      className="accent-primary-500"
                    />
                    <span className={`font-body text-sm font-semibold ${o.color}`}>{o.label}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </div>

        {/* ── Responsável Técnico ────────────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Responsável Técnico</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <Field label="Nome do Responsável Técnico">
                <input
                  value={form.responsavel_tecnico}
                  onChange={e => set('responsavel_tecnico', e.target.value)}
                  placeholder="Ex.: João Silva"
                  className="input-dark"
                />
              </Field>
            </div>
            <Field label="Registro CREA">
              <input
                value={form.crea_numero}
                onChange={e => set('crea_numero', e.target.value)}
                placeholder="Ex.: 5070123456-SP"
                className="input-dark"
              />
            </Field>
            <Field label="Número ART">
              <input
                value={form.art_numero}
                onChange={e => set('art_numero', e.target.value)}
                placeholder="Ex.: 2024-SP-1234567"
                className="input-dark"
              />
            </Field>
            <Field label="Normas Aplicadas">
              <div className="relative">
                <input
                  list="normas-list"
                  value={form.normas_aplicadas}
                  onChange={e => set('normas_aplicadas', e.target.value)}
                  placeholder="Ex.: ABNT NBR 5410, NR-10"
                  className="input-dark"
                />
                <datalist id="normas-list">
                  {NORMAS_COMUNS.map(n => <option key={n} value={n} />)}
                </datalist>
              </div>
            </Field>
          </div>
        </div>

        {/* ── Cliente ───────────────────────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Cliente / Contratante</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Nome / Razão Social" required>
                <input
                  value={form.cliente_nome}
                  onChange={e => set('cliente_nome', e.target.value)}
                  placeholder="Nome completo ou razão social"
                  className="input-dark"
                />
              </Field>
            </div>
            <Field label="CPF / CNPJ">
              <input value={form.cliente_cpf_cnpj} onChange={e => set('cliente_cpf_cnpj', e.target.value)} placeholder="000.000.000-00" className="input-dark" />
            </Field>
            <Field label="Telefone">
              <input value={form.cliente_telefone} onChange={e => set('cliente_telefone', e.target.value)} placeholder="(11) 9 0000-0000" className="input-dark" />
            </Field>
            <Field label="E-mail">
              <input type="email" value={form.cliente_email} onChange={e => set('cliente_email', e.target.value)} placeholder="cliente@email.com" className="input-dark" />
            </Field>
            <Field label="Cidade">
              <input value={form.cliente_cidade} onChange={e => set('cliente_cidade', e.target.value)} placeholder="São Paulo" className="input-dark" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Endereço">
                <input value={form.cliente_endereco} onChange={e => set('cliente_endereco', e.target.value)} placeholder="Rua, número, complemento, bairro" className="input-dark" />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Local e Objeto da Inspeção ─────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Local e Objeto da Inspeção</SectionTitle>
          <div className="space-y-4">
            <Field label="Local da Inspeção / Endereço da Instalação">
              <input
                value={form.local_inspecao}
                onChange={e => set('local_inspecao', e.target.value)}
                placeholder="Endereço completo onde foi realizada a inspeção"
                className="input-dark"
              />
            </Field>
            <Field label="Objetivo do Laudo">
              <textarea
                value={form.objetivo}
                onChange={e => set('objetivo', e.target.value)}
                rows={3}
                placeholder="Descreva o objetivo deste laudo técnico..."
                className="input-dark resize-none"
              />
            </Field>
            <Field label="Metodologia Utilizada">
              <textarea
                value={form.metodologia}
                onChange={e => set('metodologia', e.target.value)}
                rows={3}
                placeholder="Descreva os métodos, instrumentos e procedimentos utilizados..."
                className="input-dark resize-none"
              />
            </Field>
            <Field label="Descrição da Instalação">
              <textarea
                value={form.descricao_instalacao}
                onChange={e => set('descricao_instalacao', e.target.value)}
                rows={4}
                placeholder="Descreva as características gerais da instalação elétrica inspecionada..."
                className="input-dark resize-none"
              />
            </Field>
          </div>
        </div>

        {/* ── Checklist de Verificação ───────────────────────────────────── */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Checklist de Verificação</SectionTitle>
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 text-primary-400 hover:text-primary-300 transition-colors text-sm font-body"
            >
              <Plus size={14} /> Adicionar item
            </button>
          </div>

          {itens.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-dark-400 rounded-sm">
              <p className="text-gray-500 font-body text-sm mb-3">Nenhum item de verificação adicionado.</p>
              <button onClick={addItem} className="text-primary-400 hover:text-primary-300 text-sm font-body flex items-center gap-1.5 mx-auto">
                <Plus size={14} /> Adicionar primeiro item
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[24px_1fr_160px_1fr_32px] gap-2 mb-1">
                {['', 'Item verificado', 'Resultado', 'Observação', ''].map((h, i) => (
                  <div key={i} className="text-gray-500 font-body text-xs uppercase tracking-wider px-1">{h}</div>
                ))}
              </div>
              {itens.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-[24px_1fr_160px_1fr_32px] gap-2 items-center">
                  <div className="text-dark-400 cursor-grab flex justify-center">
                    <GripVertical size={14} />
                  </div>
                  <input
                    value={item.descricao}
                    onChange={e => updateItem(idx, 'descricao', e.target.value)}
                    placeholder="Descreva o item verificado..."
                    className="input-dark text-sm py-2"
                  />
                  <div className="relative">
                    <select
                      value={item.resultado}
                      onChange={e => updateItem(idx, 'resultado', e.target.value)}
                      className="input-dark text-sm py-2 appearance-none pr-7"
                    >
                      {RESULTADO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  <input
                    value={item.observacao}
                    onChange={e => updateItem(idx, 'observacao', e.target.value)}
                    placeholder="Observação (opcional)"
                    className="input-dark text-sm py-2"
                  />
                  <button onClick={() => removeItem(idx)} className="text-dark-400 hover:text-red-400 transition-colors flex justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Análise Técnica ────────────────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Análise Técnica</SectionTitle>
          <div className="space-y-4">
            <Field label="Condições Encontradas">
              <textarea
                value={form.condicoes_encontradas}
                onChange={e => set('condicoes_encontradas', e.target.value)}
                rows={4}
                placeholder="Descreva as condições encontradas durante a inspeção..."
                className="input-dark resize-none"
              />
            </Field>
            <Field label="Não Conformidades Identificadas">
              <textarea
                value={form.nao_conformidades}
                onChange={e => set('nao_conformidades', e.target.value)}
                rows={4}
                placeholder="Liste as não conformidades encontradas (se houver)..."
                className="input-dark resize-none"
              />
            </Field>
            <Field label="Recomendações">
              <textarea
                value={form.recomendacoes}
                onChange={e => set('recomendacoes', e.target.value)}
                rows={4}
                placeholder="Descreva as ações corretivas e melhorias recomendadas..."
                className="input-dark resize-none"
              />
            </Field>
            <Field label="Conclusão">
              <textarea
                value={form.conclusao}
                onChange={e => set('conclusao', e.target.value)}
                rows={4}
                placeholder="Apresente a conclusão técnica do laudo..."
                className="input-dark resize-none"
              />
            </Field>
          </div>
        </div>

        {/* ── Observações ───────────────────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Observações e Notas</SectionTitle>
          <div className="space-y-4">
            <Field label="Observações (aparece no documento impresso)">
              <textarea
                value={form.observacoes}
                onChange={e => set('observacoes', e.target.value)}
                rows={3}
                placeholder="Observações adicionais que devem constar no laudo..."
                className="input-dark resize-none"
              />
            </Field>
            <Field label="Notas Internas (não aparecem no documento impresso)">
              <textarea
                value={form.notas_internas}
                onChange={e => set('notas_internas', e.target.value)}
                rows={3}
                placeholder="Anotações internas para controle..."
                className="input-dark resize-none"
              />
            </Field>
          </div>
        </div>

        {/* ── botão de salvar final ─────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={() => navigate('/admin/laudos')}
            className="text-gray-400 hover:text-white transition-colors text-sm font-body py-2.5 px-5 border border-dark-400 hover:border-dark-300 rounded-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Salvando...' : 'Salvar Laudo'}
          </button>
        </div>
      </div>
    </div>
  )
}

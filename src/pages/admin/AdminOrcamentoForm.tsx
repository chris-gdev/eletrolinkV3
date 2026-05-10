import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Plus, Trash2, Save, Printer, ArrowLeft, ChevronDown, Camera, X, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { OrcamentoFormal, ItemOrcamento, StatusOrcamentoFormal } from '../../types'

// ─── tipos locais ────────────────────────────────────────────────────────────

type ItemLocal = Omit<ItemOrcamento, 'id' | 'orcamento_id'> & { _key: string }
type FotoExistente = { id: string; url: string; legenda: string; nome: string }
type PendingFile = { file: File; preview: string; _key: string }

const TIPOS_SERVICO = [
  'Instalação Elétrica',
  'Manutenção Elétrica',
  'Revisão e Inspeção Elétrica',
  'Instalação de Quadro de Distribuição',
  'Substituição de Quadro Elétrico',
  'Instalação de Ar-Condicionado',
  'Instalação de Chuveiro / Aquecedor',
  'Instalação de Tomadas e Interruptores',
  'Instalação de Iluminação',
  'Instalação de CFTV / Câmeras',
  'Instalação de Alarme',
  'Instalação de Portão Elétrico',
  'Instalação de Gerador',
  'Aterramento Elétrico',
  'Laudo Elétrico (ART)',
  'Outros',
]

const UNIDADES = ['un', 'm', 'm²', 'm³', 'h', 'vb', 'kg', 'pç', 'cx', 'sc']

const CONDICOES = [
  'À vista',
  '50% entrada + 50% na conclusão',
  '30% entrada + 70% na conclusão',
  'Parcelado em 2x sem juros',
  'Parcelado em 3x sem juros',
  'Boleto a 30 dias',
  'Pix',
]

const STATUS_OPTIONS: { value: StatusOrcamentoFormal; label: string }[] = [
  { value: 'rascunho',  label: 'Rascunho' },
  { value: 'enviado',   label: 'Enviado' },
  { value: 'aprovado',  label: 'Aprovado' },
  { value: 'recusado',  label: 'Recusado' },
  { value: 'executado', label: 'Executado' },
  { value: 'faturado',  label: 'Faturado' },
]

// ─── helpers ─────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2) }
function formatBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function today() { return new Date().toISOString().split('T')[0] }
function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
function newItem(): ItemLocal {
  return { _key: uid(), descricao: '', quantidade: 1, unidade: 'un', valor_unitario: 0, total: 0, ordem: 0 }
}

function emptyForm(): Omit<OrcamentoFormal, 'id' | 'numero' | 'created_at' | 'updated_at' | 'itens'> {
  const emissao = today()
  return {
    cliente_nome: '', cliente_cpf_cnpj: '', cliente_telefone: '', cliente_email: '',
    cliente_endereco: '', cliente_cidade: '', cliente_estado: 'SP',
    tipo_servico: '', descricao_servico: '', local_servico: '', prazo_execucao: '',
    data_emissao: emissao, data_validade: addDays(emissao, 30),
    subtotal: 0, desconto: 0, total: 0, condicoes_pagamento: 'À vista',
    status: 'rascunho', observacoes: '', notas_internas: '',
  }
}

// ─── sub-componentes ──────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">{children}</label>
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm pb-3 border-b border-dark-500 mb-5">
      {children}
    </h2>
  )
}

// ─── componente principal ─────────────────────────────────────────────────────

export default function AdminOrcamentoForm() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = Boolean(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState(() => {
    const prefill = location.state as Partial<ReturnType<typeof emptyForm>> | null
    return prefill ? { ...emptyForm(), ...prefill } : emptyForm()
  })
  const [itens, setItens] = useState<ItemLocal[]>([newItem()])
  const [numero, setNumero] = useState<number | null>(null)
  const [fotosExistentes, setFotosExistentes] = useState<FotoExistente[]>([])
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Carrega dados ao editar
  useEffect(() => {
    if (!isEdit || !id) return
    async function load() {
      const [
        { data: orc, error },
        { data: fotos },
      ] = await Promise.all([
        supabase.from('orcamentos_formais').select('*, itens:orcamento_itens(*)').eq('id', id).single(),
        supabase.from('orcamento_fotos').select('*').eq('orcamento_id', id).order('created_at'),
      ])

      if (error || !orc) {
        toast.error('Orçamento não encontrado.')
        navigate('/admin/orcamentos')
        return
      }

      const { id: _id, numero: num, created_at: _ca, updated_at: _ua, itens: dbItens, ...rest } = orc as any
      setForm(rest)
      setNumero(num)
      setItens(
        (dbItens as ItemOrcamento[])
          .sort((a, b) => a.ordem - b.ordem)
          .map(i => ({ _key: uid(), descricao: i.descricao, quantidade: i.quantidade, unidade: i.unidade, valor_unitario: i.valor_unitario, total: i.total, ordem: i.ordem }))
      )
      setFotosExistentes((fotos || []) as FotoExistente[])
      setLoading(false)
    }
    load()
  }, [id, isEdit, navigate])

  // Recalcula totais
  useEffect(() => {
    const subtotal = itens.reduce((s, i) => s + i.total, 0)
    const total = Math.max(0, subtotal - form.desconto)
    setForm(f => ({ ...f, subtotal, total }))
  }, [itens, form.desconto])

  // ── fotos ─────────────────────────────────────────────────────────────────

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const allowed = files.filter(f => f.type.startsWith('image/'))
    if (allowed.length < files.length) toast.error('Apenas imagens são permitidas.')
    const newPending: PendingFile[] = allowed.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      _key: uid(),
    }))
    setPendingFiles(prev => [...prev, ...newPending])
    // Reset input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    const newPending: PendingFile[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      _key: uid(),
    }))
    setPendingFiles(prev => [...prev, ...newPending])
  }

  function removePending(key: string) {
    setPendingFiles(prev => {
      const item = prev.find(p => p._key === key)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter(p => p._key !== key)
    })
  }

  async function deleteFotoExistente(fotoId: string, fotoUrl: string) {
    if (!confirm('Remover esta foto?')) return
    // Extrai o path do storage da URL pública
    const path = fotoUrl.split('/orcamento-fotos/')[1]
    if (path) await supabase.storage.from('orcamento-fotos').remove([path])
    await supabase.from('orcamento_fotos').delete().eq('id', fotoId)
    setFotosExistentes(prev => prev.filter(f => f.id !== fotoId))
    toast.success('Foto removida.')
  }

  async function uploadPendingFotos(orcId: string) {
    if (pendingFiles.length === 0) return
    setUploading(true)
    for (const { file } of pendingFiles) {
      const ext = file.name.split('.').pop()
      const path = `${orcId}/${uid()}.${ext}`
      const { error: upErr } = await supabase.storage.from('orcamento-fotos').upload(path, file)
      if (upErr) { toast.error(`Erro ao enviar ${file.name}`); continue }
      const { data: { publicUrl } } = supabase.storage.from('orcamento-fotos').getPublicUrl(path)
      await supabase.from('orcamento_fotos').insert({
        orcamento_id: orcId, url: publicUrl, nome: file.name, legenda: '',
      })
    }
    setPendingFiles([])
    setUploading(false)
  }

  // ── itens ─────────────────────────────────────────────────────────────────

  function updateItem(key: string, field: keyof Omit<ItemLocal, '_key'>, raw: string | number) {
    setItens(prev => prev.map(i => {
      if (i._key !== key) return i
      const updated = { ...i, [field]: raw }
      if (field === 'quantidade' || field === 'valor_unitario') {
        updated.total = Number(updated.quantidade) * Number(updated.valor_unitario)
      }
      return updated
    }))
  }

  // ── salvar ────────────────────────────────────────────────────────────────

  async function handleSave(andPrint = false) {
    if (!form.cliente_nome.trim()) { toast.error('Informe o nome do cliente.'); return }
    if (!form.cliente_telefone.trim()) { toast.error('Informe o telefone do cliente.'); return }
    if (!form.tipo_servico.trim()) { toast.error('Informe o tipo de serviço.'); return }

    setSaving(true)
    try {
      let orcId = id
      const payload = { ...form }

      if (isEdit && orcId) {
        const { error } = await supabase.from('orcamentos_formais').update(payload).eq('id', orcId)
        if (error) throw error
        await supabase.from('orcamento_itens').delete().eq('orcamento_id', orcId)
      } else {
        const { data, error } = await supabase.from('orcamentos_formais').insert(payload).select('id').single()
        if (error) throw error
        orcId = data.id
      }

      const itensPayload = itens
        .filter(i => i.descricao.trim())
        .map((i, idx) => ({
          orcamento_id: orcId,
          descricao: i.descricao,
          quantidade: Number(i.quantidade),
          unidade: i.unidade,
          valor_unitario: Number(i.valor_unitario),
          total: Number(i.total),
          ordem: idx,
        }))

      if (itensPayload.length > 0) {
        const { error } = await supabase.from('orcamento_itens').insert(itensPayload)
        if (error) throw error
      }

      await uploadPendingFotos(orcId!)

      toast.success(isEdit ? 'Orçamento atualizado.' : 'Orçamento criado.')
      if (andPrint) window.open(`/admin/orcamentos/${orcId}/imprimir`, '_blank')
      if (!isEdit) navigate(`/admin/orcamentos/${orcId}`)
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + (err.message || 'tente novamente.'))
    } finally {
      setSaving(false)
    }
  }

  // ─── render ───────────────────────────────────────────────────────────────

  if (loading) return <div className="p-8 text-center text-gray-500 font-body">Carregando...</div>

  const f = (label: string, field: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={(form as any)[field]}
        onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
        placeholder={placeholder}
        className="input-dark"
      />
    </div>
  )

  const totalFotos = fotosExistentes.length + pendingFiles.length

  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button onClick={() => navigate('/admin/orcamentos')} className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors font-body text-sm mb-2">
            <ArrowLeft size={14} /> Voltar
          </button>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-white uppercase tracking-wider">
            {isEdit ? `Orçamento #${String(numero).padStart(4, '0')}` : 'Novo Orçamento'}
          </h1>
        </div>
        <div className="flex gap-3 flex-wrap">
          {isEdit && (
            <button
              onClick={() => window.open(`/admin/orcamentos/${id}/imprimir`, '_blank')}
              className="flex items-center gap-2 text-sm px-4 py-2.5 border border-dark-400 text-gray-300 hover:border-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <Printer size={15} /> Imprimir / PDF
            </button>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saving || uploading}
            className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 disabled:opacity-60"
          >
            <Save size={15} /> {saving ? 'Salvando...' : uploading ? 'Enviando fotos...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── Informações do Orçamento ──────────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Informações do Orçamento</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Status</Label>
              <div className="relative">
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as StatusOrcamentoFormal }))} className="input-dark appearance-none pr-8">
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <Label>Data de Emissão</Label>
              <input type="date" value={form.data_emissao} onChange={e => setForm(p => ({ ...p, data_emissao: e.target.value }))} className="input-dark" />
            </div>
            <div>
              <Label>Válido até</Label>
              <input type="date" value={form.data_validade} onChange={e => setForm(p => ({ ...p, data_validade: e.target.value }))} className="input-dark" />
            </div>
            <div>
              <Label>Prazo de Execução</Label>
              <input type="text" value={form.prazo_execucao} onChange={e => setForm(p => ({ ...p, prazo_execucao: e.target.value }))} placeholder="Ex: 3 dias úteis" className="input-dark" />
            </div>
          </div>
        </div>

        {/* ── Dados do Cliente ──────────────────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Dados do Cliente</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {f('Nome / Razão Social *', 'cliente_nome', 'text', 'Nome completo ou razão social')}
            {f('CPF / CNPJ', 'cliente_cpf_cnpj', 'text', '000.000.000-00 ou 00.000.000/0001-00')}
            {f('Telefone / WhatsApp *', 'cliente_telefone', 'tel', '(11) 99999-9999')}
            {f('E-mail', 'cliente_email', 'email', 'email@exemplo.com')}
            {f('Endereço', 'cliente_endereco', 'text', 'Rua, número, bairro')}
            <div className="grid grid-cols-2 gap-3">
              {f('Cidade', 'cliente_cidade', 'text', 'São Paulo')}
              {f('Estado', 'cliente_estado', 'text', 'SP')}
            </div>
          </div>
        </div>

        {/* ── Dados do Serviço ─────────────────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Dados do Serviço</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Serviço *</Label>
              <div className="relative">
                <select value={form.tipo_servico} onChange={e => setForm(p => ({ ...p, tipo_servico: e.target.value }))} className="input-dark appearance-none pr-8">
                  <option value="">Selecione o tipo...</option>
                  {TIPOS_SERVICO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
            {f('Local do Serviço (se diferente do endereço do cliente)', 'local_servico', 'text', 'Endereço da obra / local de instalação')}
            <div className="sm:col-span-2">
              <Label>Descrição do Serviço</Label>
              <textarea value={form.descricao_servico} onChange={e => setForm(p => ({ ...p, descricao_servico: e.target.value }))} placeholder="Descreva o serviço a ser realizado..." rows={3} className="input-dark resize-none" />
            </div>
          </div>
        </div>

        {/* ── Itens do Orçamento ───────────────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Itens do Orçamento</SectionTitle>
          <div className="hidden lg:grid grid-cols-[1fr_80px_80px_120px_120px_36px] gap-2 mb-2">
            {['Descrição do Item / Serviço', 'Qtd', 'Unid.', 'Valor Unit. (R$)', 'Total', ''].map(h => (
              <div key={h} className="text-gray-500 font-body text-xs uppercase tracking-wider">{h}</div>
            ))}
          </div>
          <div className="space-y-2">
            {itens.map((item, idx) => (
              <div key={item._key} className="grid grid-cols-1 lg:grid-cols-[1fr_80px_80px_120px_120px_36px] gap-2 items-center">
                <input type="text" value={item.descricao} onChange={e => updateItem(item._key, 'descricao', e.target.value)} placeholder={`Item ${idx + 1} — Ex: Troca de disjuntor 20A`} className="input-dark" />
                <input type="number" min="0" step="0.01" value={item.quantidade} onChange={e => updateItem(item._key, 'quantidade', e.target.value)} className="input-dark text-right" />
                <div className="relative">
                  <select value={item.unidade} onChange={e => updateItem(item._key, 'unidade', e.target.value)} className="input-dark appearance-none pr-6 text-sm">
                    {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
                <input type="number" min="0" step="0.01" value={item.valor_unitario} onChange={e => updateItem(item._key, 'valor_unitario', e.target.value)} className="input-dark text-right" />
                <div className="input-dark bg-dark-800 text-right text-gray-300 select-none">{formatBRL(item.total)}</div>
                <button onClick={() => setItens(prev => prev.length > 1 ? prev.filter(i => i._key !== item._key) : prev)} disabled={itens.length === 1} className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-30 flex items-center justify-center">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setItens(prev => [...prev, newItem()])} className="mt-4 flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm font-body">
            <Plus size={15} /> Adicionar item
          </button>
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm font-body">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatBRL(form.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm font-body">
                <span className="text-gray-400">Desconto (R$)</span>
                <input type="number" min="0" step="0.01" value={form.desconto} onChange={e => setForm(p => ({ ...p, desconto: Number(e.target.value) }))} className="input-dark w-32 text-right py-1.5" />
              </div>
              <div className="flex justify-between text-base font-body border-t border-dark-500 pt-2 mt-2">
                <span className="text-white font-semibold">Total</span>
                <span className="text-primary-400 font-bold text-lg">{formatBRL(form.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Fotos / Registro ─────────────────────────────────────────────── */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-dark-500">
            <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm flex items-center gap-2">
              <Camera size={15} className="text-primary-400" />
              Fotos / Registro
              {totalFotos > 0 && (
                <span className="text-primary-400 bg-primary-500/10 border border-primary-500/20 text-xs px-2 py-0.5 rounded-sm">
                  {totalFotos}
                </span>
              )}
            </h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors font-body"
            >
              <Plus size={14} /> Adicionar fotos
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Drop zone — aparece quando não há fotos */}
          {totalFotos === 0 && (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-dark-400 hover:border-primary-500/50 rounded-lg p-10 text-center cursor-pointer transition-colors group"
            >
              <Image size={32} className="mx-auto text-dark-400 group-hover:text-primary-500/50 mb-3 transition-colors" />
              <p className="text-gray-500 font-body text-sm">Clique ou arraste imagens aqui</p>
              <p className="text-gray-600 font-body text-xs mt-1">JPG, PNG, WEBP — múltiplas fotos permitidas</p>
            </div>
          )}

          {/* Grade de fotos */}
          {totalFotos > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

              {/* Fotos já salvas no banco */}
              {fotosExistentes.map(foto => (
                <div key={foto.id} className="relative group aspect-square rounded-lg overflow-hidden border border-dark-500">
                  <img src={foto.url} alt={foto.nome} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => deleteFotoExistente(foto.id, foto.url)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Fotos pendentes (ainda não salvas) */}
              {pendingFiles.map(pf => (
                <div key={pf._key} className="relative group aspect-square rounded-lg overflow-hidden border border-primary-500/30">
                  <img src={pf.preview} alt={pf.file.name} className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded font-body">Novo</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button onClick={() => removePending(pf._key)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Botão adicionar mais */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                className="aspect-square rounded-lg border-2 border-dashed border-dark-400 hover:border-primary-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors group"
              >
                <Plus size={20} className="text-dark-400 group-hover:text-primary-500/50 transition-colors mb-1" />
                <span className="text-gray-600 font-body text-xs">Adicionar</span>
              </div>
            </div>
          )}

          {pendingFiles.length > 0 && (
            <p className="mt-3 text-xs font-body text-gray-500">
              {pendingFiles.length} foto{pendingFiles.length > 1 ? 's' : ''} aguardando — serão enviadas ao salvar o orçamento.
            </p>
          )}
        </div>

        {/* ── Condições e Observações ──────────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Condições e Observações</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Condições de Pagamento</Label>
              <div className="relative">
                <select value={form.condicoes_pagamento} onChange={e => setForm(p => ({ ...p, condicoes_pagamento: e.target.value }))} className="input-dark appearance-none pr-8">
                  {CONDICOES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <Label>Observações (aparece no PDF)</Label>
              <textarea value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} placeholder="Ex: Materiais inclusos. Garantia de 90 dias nos serviços." rows={3} className="input-dark resize-none" />
            </div>
          </div>
        </div>

        {/* ── Notas Internas ───────────────────────────────────────────────── */}
        <div className="card-dark p-6">
          <SectionTitle>Notas Internas</SectionTitle>
          <p className="text-gray-500 font-body text-xs mb-3">Estas notas não aparecem no PDF impresso.</p>
          <textarea value={form.notas_internas} onChange={e => setForm(p => ({ ...p, notas_internas: e.target.value }))} placeholder="Anotações internas sobre este orçamento..." rows={4} className="input-dark resize-none" />
        </div>

        {/* ── Ações finais ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pb-4">
          <button onClick={() => navigate('/admin/orcamentos')} className="px-5 py-2.5 border border-dark-400 text-gray-400 hover:text-white hover:border-gray-400 rounded-lg transition-colors text-sm font-body">
            Cancelar
          </button>
          <button onClick={() => handleSave(true)} disabled={saving || uploading} className="flex items-center gap-2 px-5 py-2.5 border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors text-sm font-body disabled:opacity-60">
            <Printer size={15} /> Salvar e Imprimir
          </button>
          <button onClick={() => handleSave(false)} disabled={saving || uploading} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6 disabled:opacity-60">
            <Save size={15} /> {saving ? 'Salvando...' : uploading ? 'Enviando fotos...' : 'Salvar'}
          </button>
        </div>

      </div>
    </div>
  )
}

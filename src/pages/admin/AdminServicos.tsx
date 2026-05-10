import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, GripVertical, Check, X } from 'lucide-react'
import * as Icons from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Servico } from '../../types'

const ICON_OPTIONS = [
  { name: 'Zap', label: 'Elétrica' },
  { name: 'Home', label: 'Residencial' },
  { name: 'Building2', label: 'Comercial' },
  { name: 'Sun', label: 'Solar' },
  { name: 'Wrench', label: 'Manutenção' },
  { name: 'AirVent', label: 'Ar Condicionado' },
  { name: 'ShieldCheck', label: 'Segurança' },
  { name: 'Lightbulb', label: 'Iluminação' },
  { name: 'Cable', label: 'Cabeamento' },
  { name: 'Gauge', label: 'Medição' },
  { name: 'Flame', label: 'Emergência' },
  { name: 'Settings', label: 'Configuração' },
  { name: 'CircuitBoard', label: 'Quadro Elétrico' },
  { name: 'Wifi', label: 'Rede' },
  { name: 'Battery', label: 'Energia' },
  { name: 'Thermometer', label: 'Temperatura' },
  { name: 'Camera', label: 'CFTV' },
  { name: 'Bell', label: 'Alarme' },
]

function DynamicIcon({ name, size, className }: { name: string; size: number; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (Icons as any)[name] as Icons.LucideIcon | undefined
  if (!Icon) return <Icons.Zap size={size} className={className} />
  return <Icon size={size} className={className} />
}

const emptyServico: Omit<Servico, 'id'> = { titulo: '', descricao: '', icone: 'Zap', ativo: true, ordem: 0 }

export default function AdminServicos() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Servico | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyServico)

  useEffect(() => { fetchServicos() }, [])

  async function fetchServicos() {
    const { data } = await supabase.from('servicos').select('*').order('ordem')
    setServicos(data || [])
    setLoading(false)
  }

  async function saveServico() {
    if (editing) {
      await supabase.from('servicos').update(form).eq('id', editing.id)
    } else {
      await supabase.from('servicos').insert([form])
    }
    setEditing(null)
    setCreating(false)
    fetchServicos()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await supabase.from('servicos').update({ ativo: !ativo }).eq('id', id)
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ativo: !s.ativo } : s))
  }

  async function deleteServico(id: string) {
    if (!confirm('Excluir este serviço?')) return
    await supabase.from('servicos').delete().eq('id', id)
    setServicos(prev => prev.filter(s => s.id !== id))
  }

  function startEdit(s: Servico) {
    setEditing(s)
    setCreating(false)
    setForm({ titulo: s.titulo, descricao: s.descricao, icone: s.icone, ativo: s.ativo, ordem: s.ordem })
  }

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm({ ...emptyServico, ordem: servicos.length })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white uppercase tracking-wider">Serviços</h1>
          <p className="text-gray-500 font-body text-sm mt-1">{servicos.length} serviços cadastrados</p>
        </div>
        <button onClick={startCreate} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
          <Plus size={16} />
          Novo Serviço
        </button>
      </div>

      {(creating || editing) && (
        <div className="card-dark p-6 mb-6">
          <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-5">
            {editing ? 'Editar Serviço' : 'Novo Serviço'}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">Título *</label>
                <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} className="input-dark" placeholder="Nome do serviço" />
              </div>
              <div>
                <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">Ícone</label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 border border-primary-500/40 flex items-center justify-center shrink-0">
                    <DynamicIcon name={form.icone} size={20} className="text-primary-400" />
                  </div>
                  <span className="text-gray-300 text-sm font-body">{ICON_OPTIONS.find(i => i.name === form.icone)?.label ?? form.icone}</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {ICON_OPTIONS.map(opt => (
                    <button
                      key={opt.name}
                      type="button"
                      title={opt.label}
                      onClick={() => setForm(p => ({ ...p, icone: opt.name }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                        form.icone === opt.name
                          ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                          : 'border-dark-500 bg-dark-600 text-gray-400 hover:border-dark-400 hover:text-gray-200'
                      }`}
                    >
                      <DynamicIcon name={opt.name} size={18} />
                      <span className="text-[9px] leading-tight text-center truncate w-full">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">Descrição *</label>
              <textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} rows={3} className="input-dark resize-none" placeholder="Descrição do serviço..." />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.ativo} onChange={e => setForm(p => ({ ...p, ativo: e.target.checked }))} className="sr-only" />
                <div className={`w-10 h-5 rounded-full transition-colors ${form.ativo ? 'bg-primary-500' : 'bg-dark-400'} relative`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${form.ativo ? 'left-5.5 translate-x-1' : 'left-0.5'}`} />
                </div>
                <span className="text-gray-300 font-body text-sm">Ativo no site</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={saveServico} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
                <Check size={14} />
                Salvar
              </button>
              <button onClick={() => { setEditing(null); setCreating(false) }} className="btn-outline text-sm py-2 px-5">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card-dark">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-body">Carregando...</div>
        ) : servicos.length === 0 ? (
          <div className="p-10 text-center text-gray-500 font-body text-sm">Nenhum serviço cadastrado.</div>
        ) : (
          <div className="divide-y divide-dark-600">
            {servicos.map(s => (
              <div key={s.id} className="p-4 flex items-start gap-4">
                <GripVertical size={16} className="text-dark-400 mt-1 cursor-grab shrink-0" />
                <div className="w-9 h-9 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                  <DynamicIcon name={s.icone} size={16} className="text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-display font-semibold text-white text-sm uppercase tracking-wide">{s.titulo}</span>
                    <span className={`text-xs font-body px-2 py-0.5 border rounded-sm ${s.ativo ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-gray-500 bg-dark-500 border-dark-400'}`}>
                      {s.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-gray-400 font-body text-sm">{s.descricao}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => toggleAtivo(s.id, s.ativo)} className={`p-1.5 transition-colors ${s.ativo ? 'text-green-400 hover:text-gray-400' : 'text-gray-500 hover:text-green-400'}`} title={s.ativo ? 'Desativar' : 'Ativar'}>
                    <Check size={15} />
                  </button>
                  <button onClick={() => startEdit(s)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => deleteServico(s.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

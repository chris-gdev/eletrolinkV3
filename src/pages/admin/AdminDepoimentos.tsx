import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Depoimento } from '../../types'

const emptyDep = { nome: '', texto: '', avaliacao: 5, servico: '', ativo: true }

export default function AdminDepoimentos() {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Depoimento | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyDep)

  useEffect(() => { fetchDepoimentos() }, [])

  async function fetchDepoimentos() {
    const { data } = await supabase.from('depoimentos').select('*').order('created_at', { ascending: false })
    setDepoimentos(data || [])
    setLoading(false)
  }

  async function save() {
    if (editing) {
      await supabase.from('depoimentos').update(form).eq('id', editing.id)
    } else {
      await supabase.from('depoimentos').insert([form])
    }
    setEditing(null)
    setCreating(false)
    fetchDepoimentos()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await supabase.from('depoimentos').update({ ativo: !ativo }).eq('id', id)
    setDepoimentos(prev => prev.map(d => d.id === id ? { ...d, ativo: !d.ativo } : d))
  }

  async function del(id: string) {
    if (!confirm('Excluir este depoimento?')) return
    await supabase.from('depoimentos').delete().eq('id', id)
    setDepoimentos(prev => prev.filter(d => d.id !== id))
  }

  function startEdit(d: Depoimento) {
    setEditing(d)
    setCreating(false)
    setForm({ nome: d.nome, texto: d.texto, avaliacao: d.avaliacao, servico: d.servico, ativo: d.ativo })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white uppercase tracking-wider">Depoimentos</h1>
          <p className="text-gray-500 font-body text-sm mt-1">{depoimentos.length} depoimentos</p>
        </div>
        <button onClick={() => { setCreating(true); setEditing(null); setForm(emptyDep) }} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
          <Plus size={16} />
          Novo Depoimento
        </button>
      </div>

      {(creating || editing) && (
        <div className="card-dark p-6 mb-6">
          <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-5">
            {editing ? 'Editar' : 'Novo'} Depoimento
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">Nome do Cliente *</label>
                <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} className="input-dark" placeholder="João da Silva" />
              </div>
              <div>
                <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">Serviço Contratado</label>
                <input value={form.servico} onChange={e => setForm(p => ({ ...p, servico: e.target.value }))} className="input-dark" placeholder="Instalação Residencial" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">Texto do Depoimento *</label>
              <textarea value={form.texto} onChange={e => setForm(p => ({ ...p, texto: e.target.value }))} rows={3} className="input-dark resize-none" />
            </div>
            <div>
              <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-2">Avaliação</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setForm(p => ({ ...p, avaliacao: n }))}>
                    <Star size={22} className={n <= form.avaliacao ? 'text-primary-500 fill-primary-500' : 'text-dark-400'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={save} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
                <Check size={14} /> Salvar
              </button>
              <button onClick={() => { setEditing(null); setCreating(false) }} className="btn-outline text-sm py-2 px-5">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-gray-500 font-body">Carregando...</div>
        ) : depoimentos.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-gray-500 font-body">Nenhum depoimento cadastrado.</div>
        ) : (
          depoimentos.map(d => (
            <div key={d.id} className="card-dark p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-display font-semibold text-white text-sm uppercase tracking-wide">{d.nome}</div>
                  {d.servico && <div className="text-primary-500 text-xs font-body mt-0.5">{d.servico}</div>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => toggleAtivo(d.id, d.ativo)} className={`p-1 transition-colors ${d.ativo ? 'text-green-400' : 'text-dark-400 hover:text-green-400'}`}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => startEdit(d)} className="p-1 text-gray-400 hover:text-white transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => del(d.id)} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={12} className={n <= d.avaliacao ? 'text-primary-500 fill-primary-500' : 'text-dark-400'} />
                ))}
              </div>
              <p className="text-gray-400 font-body text-sm italic">"{d.texto}"</p>
              <div className="mt-2">
                <span className={`text-xs font-body px-2 py-0.5 border rounded-sm ${d.ativo ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-gray-500 bg-dark-500 border-dark-400'}`}>
                  {d.ativo ? 'Visível no site' : 'Oculto'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

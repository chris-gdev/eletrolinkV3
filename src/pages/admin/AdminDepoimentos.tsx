import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, Star, ChevronUp, ChevronDown, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Depoimento } from '../../types'

const emptyDep = { nome: '', texto: '', avaliacao: 5, servico: '', ativo: true, ordem: 0 }

export default function AdminDepoimentos() {
  const [publicados, setPublicados] = useState<Depoimento[]>([])
  const [pendentes, setPendentes] = useState<Depoimento[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Depoimento | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyDep)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { fetchDepoimentos() }, [])

  async function fetchDepoimentos() {
    const { data, error } = await supabase
      .from('depoimentos')
      .select('*')
      .order('ativo', { ascending: false })
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) toast.error('Erro ao carregar depoimentos.')
    const all = data || []
    setPublicados(all.filter(d => d.ativo))
    setPendentes(all.filter(d => !d.ativo))
    setLoading(false)
  }

  async function save() {
    if (!form.nome.trim() || !form.texto.trim()) {
      toast.error('Preencha o nome e o texto.')
      return
    }
    setSalvando(true)
    const payload = editing
      ? form
      : { ...form, ordem: publicados.length }

    const { error } = editing
      ? await supabase.from('depoimentos').update(payload).eq('id', editing.id)
      : await supabase.from('depoimentos').insert([payload])

    if (error) { toast.error('Erro ao salvar depoimento.'); setSalvando(false); return }
    toast.success(editing ? 'Depoimento atualizado.' : 'Depoimento criado.')
    setEditing(null)
    setCreating(false)
    setSalvando(false)
    fetchDepoimentos()
  }

  async function aprovar(id: string) {
    const { error } = await supabase
      .from('depoimentos')
      .update({ ativo: true, ordem: publicados.length })
      .eq('id', id)
    if (error) { toast.error('Erro ao aprovar.'); return }
    toast.success('Depoimento publicado no site.')
    fetchDepoimentos()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    const { error } = await supabase.from('depoimentos').update({ ativo: !ativo }).eq('id', id)
    if (error) { toast.error('Erro ao atualizar visibilidade.'); return }
    toast.success(!ativo ? 'Depoimento publicado.' : 'Depoimento ocultado.')
    fetchDepoimentos()
  }

  async function moverOrdem(index: number, dir: 'up' | 'down') {
    const lista = [...publicados]
    const targetIndex = dir === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= lista.length) return

    const a = lista[index]
    const b = lista[targetIndex]

    // Troca as ordens
    await Promise.all([
      supabase.from('depoimentos').update({ ordem: b.ordem }).eq('id', a.id),
      supabase.from('depoimentos').update({ ordem: a.ordem }).eq('id', b.id),
    ])

    // Atualiza local
    lista[index] = { ...a, ordem: b.ordem }
    lista[targetIndex] = { ...b, ordem: a.ordem }
    lista.sort((x, y) => x.ordem - y.ordem)
    setPublicados(lista)
  }

  async function del(id: string) {
    if (!confirm('Excluir este depoimento?')) return
    const { error } = await supabase.from('depoimentos').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir.'); return }
    toast.success('Depoimento excluído.')
    fetchDepoimentos()
  }

  function startEdit(d: Depoimento) {
    setEditing(d)
    setCreating(false)
    setForm({ nome: d.nome, texto: d.texto, avaliacao: d.avaliacao, servico: d.servico, ativo: d.ativo, ordem: d.ordem })
  }

  const total = publicados.length + pendentes.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-white uppercase tracking-wider">Depoimentos</h1>
          <p className="text-gray-500 font-body text-sm mt-1">
            {total} total · <span className="text-green-400">{publicados.length} publicados</span>
            {pendentes.length > 0 && <> · <span className="text-yellow-400">{pendentes.length} aguardando</span></>}
          </p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); setForm(emptyDep) }}
          className="btn-primary flex items-center gap-2 text-sm py-2 px-4 shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Novo Depoimento</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Formulário criar/editar */}
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
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setForm(p => ({ ...p, avaliacao: n }))}>
                    <Star size={22} className={n <= form.avaliacao ? 'text-primary-500 fill-primary-500' : 'text-dark-400'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={save} disabled={salvando} className="btn-primary flex items-center gap-2 text-sm py-2 px-5 disabled:opacity-60">
                <Check size={14} />
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button onClick={() => { setEditing(null); setCreating(false) }} className="btn-outline text-sm py-2 px-5">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card-dark p-8 text-center text-gray-500 font-body">Carregando...</div>
      ) : (
        <div className="space-y-6">

          {/* Pendentes de aprovação */}
          {pendentes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-yellow-400" />
                <h2 className="font-display font-semibold text-yellow-400 uppercase tracking-wider text-xs">
                  Aguardando aprovação ({pendentes.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendentes.map(d => (
                  <div key={d.id} className="card-dark p-5 border-yellow-500/20">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="font-display font-semibold text-white text-sm uppercase tracking-wide truncate">{d.nome}</div>
                        {d.servico && <div className="text-primary-500 text-xs font-body mt-0.5 truncate">{d.servico}</div>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => aprovar(d.id)}
                          className="flex items-center gap-1 text-xs font-body px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors rounded-sm"
                          title="Publicar"
                        >
                          <Check size={12} /> Publicar
                        </button>
                        <button onClick={() => startEdit(d)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => del(d.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} size={12} className={n <= d.avaliacao ? 'text-primary-500 fill-primary-500' : 'text-dark-400'} />
                      ))}
                    </div>
                    <p className="text-gray-400 font-body text-sm italic line-clamp-3">"{d.texto}"</p>
                    <div className="mt-2 text-xs text-gray-600 font-body">
                      {new Date(d.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publicados */}
          <div>
            {publicados.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Check size={14} className="text-green-400" />
                <h2 className="font-display font-semibold text-green-400 uppercase tracking-wider text-xs">
                  Publicados ({publicados.length})
                </h2>
              </div>
            )}

            {publicados.length === 0 && pendentes.length === 0 ? (
              <div className="card-dark p-10 text-center text-gray-500 font-body">Nenhum depoimento cadastrado.</div>
            ) : publicados.length === 0 ? null : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {publicados.map((d, index) => (
                  <div key={d.id} className="card-dark p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="font-display font-semibold text-white text-sm uppercase tracking-wide truncate">{d.nome}</div>
                        {d.servico && <div className="text-primary-500 text-xs font-body mt-0.5 truncate">{d.servico}</div>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Reordenar */}
                        <div className="flex flex-col">
                          <button
                            onClick={() => moverOrdem(index, 'up')}
                            disabled={index === 0}
                            className="p-0.5 text-dark-400 hover:text-gray-300 disabled:opacity-20 transition-colors"
                            title="Mover para cima"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => moverOrdem(index, 'down')}
                            disabled={index === publicados.length - 1}
                            className="p-0.5 text-dark-400 hover:text-gray-300 disabled:opacity-20 transition-colors"
                            title="Mover para baixo"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => toggleAtivo(d.id, d.ativo)}
                          className="p-1.5 text-green-400 hover:text-gray-400 transition-colors"
                          title="Ocultar"
                        >
                          <Check size={14} />
                        </button>
                        <button onClick={() => startEdit(d)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => del(d.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} size={12} className={n <= d.avaliacao ? 'text-primary-500 fill-primary-500' : 'text-dark-400'} />
                      ))}
                    </div>
                    <p className="text-gray-400 font-body text-sm italic line-clamp-3">"{d.texto}"</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-body px-2 py-0.5 border rounded-sm text-green-400 bg-green-500/10 border-green-500/20">
                        Visível no site
                      </span>
                      <span className="text-xs text-gray-600 font-body">#{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

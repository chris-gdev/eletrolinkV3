import { useEffect, useState } from 'react'
import { Search, Filter, Eye, Trash2, AlertTriangle, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { OrcamentoRequest, StatusOrcamento } from '../../types'

const statusConfig: Record<StatusOrcamento, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  em_andamento: { label: 'Em andamento', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  concluido: { label: 'Concluído', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  cancelado: { label: 'Cancelado', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
}

export default function AdminOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoRequest[]>([])
  const [filtered, setFiltered] = useState<OrcamentoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selected, setSelected] = useState<OrcamentoRequest | null>(null)

  useEffect(() => {
    fetchOrcamentos()
  }, [])

  useEffect(() => {
    let result = orcamentos
    if (search) result = result.filter(o =>
      o.nome.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.telefone.includes(search)
    )
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter)
    setFiltered(result)
  }, [search, statusFilter, orcamentos])

  async function fetchOrcamentos() {
    const { data } = await supabase.from('orcamentos').select('*').order('created_at', { ascending: false })
    setOrcamentos(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: StatusOrcamento) {
    await supabase.from('orcamentos').update({ status }).eq('id', id)
    setOrcamentos(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev)
  }

  async function deleteOrcamento(id: string) {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return
    await supabase.from('orcamentos').delete().eq('id', id)
    setOrcamentos(prev => prev.filter(o => o.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white uppercase tracking-wider">Orçamentos</h1>
        <p className="text-gray-500 font-body text-sm mt-1">{orcamentos.length} solicitações recebidas</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="input-dark pl-9"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-dark pl-9 pr-8 w-full sm:w-48 appearance-none">
            <option value="all">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em andamento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className={`${selected ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
        {/* Table */}
        <div className="card-dark overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-body">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <AlertTriangle size={32} className="text-dark-400 mx-auto mb-3" />
              <p className="text-gray-500 font-body text-sm">Nenhum resultado encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-500">
                    {['Nome', 'Serviço', 'Urgência', 'Status', 'Data', ''].map(h => (
                      <th key={h} className="text-left p-4 text-gray-500 font-body text-xs uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => {
                    const cfg = statusConfig[o.status]
                    return (
                      <tr
                        key={o.id}
                        className={`border-b border-dark-600 hover:bg-dark-700/50 transition-colors cursor-pointer ${selected?.id === o.id ? 'bg-dark-700' : ''}`}
                        onClick={() => setSelected(o)}
                      >
                        <td className="p-4 text-white font-body text-sm">{o.nome}</td>
                        <td className="p-4 text-gray-400 font-body text-sm max-w-[140px] truncate">{o.tipo_servico}</td>
                        <td className="p-4">
                          <span className={`text-xs font-body px-2 py-0.5 border rounded-sm capitalize
                            ${o.urgencia === 'emergencia' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                              o.urgencia === 'urgente' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                              'text-gray-400 bg-dark-500 border-dark-400'}`}>
                            {o.urgencia}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-body px-2 py-0.5 border rounded-sm ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 font-body text-xs whitespace-nowrap">
                          {new Date(o.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setSelected(o) }} className="text-gray-400 hover:text-white transition-colors">
                              <Eye size={15} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteOrcamento(o.id) }} className="text-gray-400 hover:text-red-400 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm">
                Detalhes
              </h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white transition-colors text-xs font-body">
                Fechar ×
              </button>
            </div>

            <div className="space-y-4">
              {[
                ['Nome', selected.nome],
                ['Telefone', selected.telefone],
                ['E-mail', selected.email],
                ['Tipo de Serviço', selected.tipo_servico],
                ['Urgência', selected.urgencia],
                ['Endereço', selected.endereco || '—'],
                ['Data', new Date(selected.created_at).toLocaleString('pt-BR')],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-gray-500 font-body text-xs uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-white font-body text-sm capitalize">{value}</div>
                </div>
              ))}

              <div>
                <div className="text-gray-500 font-body text-xs uppercase tracking-wider mb-1">Descrição</div>
                <div className="text-gray-300 font-body text-sm bg-dark-700 p-3 rounded-sm border border-dark-500 leading-relaxed">
                  {selected.descricao}
                </div>
              </div>

              <div>
                <div className="text-gray-500 font-body text-xs uppercase tracking-wider mb-2">Atualizar Status</div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(statusConfig) as StatusOrcamento[]).map(s => {
                    const cfg = statusConfig[s]
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className={`text-xs font-body px-3 py-2 border rounded-sm transition-colors ${
                          selected.status === s
                            ? cfg.color
                            : 'text-gray-500 border-dark-500 hover:border-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

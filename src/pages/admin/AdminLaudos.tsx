import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, Eye, Trash2, Printer, AlertTriangle, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Laudo, StatusLaudo, TipoLaudo } from '../../types'

const statusConfig: Record<StatusLaudo, { label: string; color: string }> = {
  rascunho:  { label: 'Rascunho',  color: 'text-gray-400 bg-dark-500 border-dark-400' },
  emitido:   { label: 'Emitido',   color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  entregue:  { label: 'Entregue',  color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  arquivado: { label: 'Arquivado', color: 'text-gray-500 bg-dark-600 border-dark-500' },
}

const tipoConfig: Record<TipoLaudo, { label: string; color: string }> = {
  manutencao:   { label: 'Manutenção',       color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  projeto:      { label: 'Projeto Elétrico', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  vistoria:     { label: 'Vistoria',         color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  conformidade: { label: 'Conformidade',     color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  instalacoes:  { label: 'Instalações',      color: 'text-primary-400 bg-primary-500/10 border-primary-500/20' },
}

const conformidadeConfig = {
  conforme:      { label: 'Conforme',         color: 'text-green-400' },
  nao_conforme:  { label: 'Não Conforme',     color: 'text-red-400' },
  com_ressalvas: { label: 'Com Ressalvas',    color: 'text-yellow-400' },
}

function formatNumero(n: number) {
  return String(n).padStart(4, '0')
}

export default function AdminLaudos() {
  const navigate = useNavigate()
  const [laudos, setLaudos] = useState<Laudo[]>([])
  const [filtered, setFiltered] = useState<Laudo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tipoFilter, setTipoFilter] = useState<string>('all')

  useEffect(() => { fetchLaudos() }, [])

  useEffect(() => {
    let result = laudos
    if (search) result = result.filter(l =>
      l.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      l.cliente_telefone.includes(search) ||
      l.cliente_cpf_cnpj.includes(search) ||
      String(l.numero).includes(search) ||
      l.local_inspecao.toLowerCase().includes(search.toLowerCase())
    )
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter)
    if (tipoFilter !== 'all') result = result.filter(l => l.tipo === tipoFilter)
    setFiltered(result)
  }, [search, statusFilter, tipoFilter, laudos])

  async function fetchLaudos() {
    const { data, error } = await supabase
      .from('laudos')
      .select('*')
      .order('numero', { ascending: false })
    if (error) toast.error('Erro ao carregar laudos.')
    setLaudos(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  async function deleteLaudo(id: string) {
    if (!confirm('Tem certeza que deseja excluir este laudo? Esta ação não pode ser desfeita.')) return
    const { error } = await supabase.from('laudos').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir laudo.'); return }
    setLaudos(prev => prev.filter(l => l.id !== id))
    toast.success('Laudo excluído.')
  }

  const totalEmitidos = laudos.filter(l => l.status === 'emitido' || l.status === 'entregue').length

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-white uppercase tracking-wider">Laudos</h1>
          <p className="text-gray-500 font-body text-sm mt-1">
            {laudos.length} laudos · Emitidos/Entregues: {totalEmitidos}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/laudos/novo')}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 self-start sm:self-auto"
        >
          <Plus size={16} />
          Novo Laudo
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, local, CPF/CNPJ ou número..."
            className="input-dark pl-9"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)} className="input-dark pl-9 pr-8 w-full sm:w-48 appearance-none">
            <option value="all">Todos os tipos</option>
            {(Object.entries(tipoConfig) as [TipoLaudo, { label: string }][]).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-dark pl-9 pr-8 w-full sm:w-48 appearance-none">
            <option value="all">Todos os status</option>
            {(Object.entries(statusConfig) as [StatusLaudo, { label: string }][]).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="card-dark overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-body">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle size={32} className="text-dark-400 mx-auto mb-3" />
            <p className="text-gray-500 font-body text-sm">
              {laudos.length === 0 ? 'Nenhum laudo criado ainda.' : 'Nenhum resultado para a busca.'}
            </p>
            {laudos.length === 0 && (
              <button
                onClick={() => navigate('/admin/laudos/novo')}
                className="mt-4 btn-primary text-sm py-2 px-5 inline-flex items-center gap-2"
              >
                <Plus size={14} />
                Criar primeiro laudo
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-500">
                  {['Nº', 'Cliente', 'Tipo', 'Local', 'Conformidade', 'Status', 'Emissão', ''].map(h => (
                    <th key={h} className="text-left p-4 text-gray-500 font-body text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const scfg = statusConfig[l.status]
                  const tcfg = tipoConfig[l.tipo]
                  const ccfg = conformidadeConfig[l.conformidade]
                  return (
                    <tr
                      key={l.id}
                      className="border-b border-dark-600 hover:bg-dark-700/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/laudos/${l.id}`)}
                    >
                      <td className="p-4 text-primary-400 font-display font-semibold text-sm">
                        #{formatNumero(l.numero)}
                      </td>
                      <td className="p-4">
                        <div className="text-white font-body text-sm">{l.cliente_nome || '—'}</div>
                        <div className="text-gray-500 font-body text-xs">{l.cliente_telefone}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-body px-2 py-0.5 border rounded-sm ${tcfg.color}`}>{tcfg.label}</span>
                      </td>
                      <td className="p-4 text-gray-400 font-body text-sm max-w-[140px] truncate">{l.local_inspecao || '—'}</td>
                      <td className="p-4">
                        <span className={`text-xs font-body font-semibold ${ccfg.color}`}>{ccfg.label}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-body px-2 py-0.5 border rounded-sm ${scfg.color}`}>{scfg.label}</span>
                      </td>
                      <td className="p-4 text-gray-500 font-body text-xs whitespace-nowrap">
                        {l.data_emissao ? new Date(l.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/admin/laudos/${l.id}`)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Editar"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => window.open(`/admin/laudos/${l.id}/imprimir`, '_blank')}
                            className="text-gray-400 hover:text-primary-400 transition-colors"
                            title="Imprimir / PDF"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => deleteLaudo(l.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Excluir"
                          >
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
    </div>
  )
}

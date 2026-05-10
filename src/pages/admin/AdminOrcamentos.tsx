import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, Eye, Trash2, Printer, AlertTriangle, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { OrcamentoFormal, StatusOrcamentoFormal } from '../../types'

const statusConfig: Record<StatusOrcamentoFormal, { label: string; color: string }> = {
  rascunho:  { label: 'Rascunho',    color: 'text-gray-400 bg-dark-500 border-dark-400' },
  enviado:   { label: 'Enviado',     color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  aprovado:  { label: 'Aprovado',    color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  recusado:  { label: 'Recusado',    color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  executado: { label: 'Executado',   color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  faturado:  { label: 'Faturado',    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatNumero(n: number) {
  return String(n).padStart(4, '0')
}

export default function AdminOrcamentos() {
  const navigate = useNavigate()
  const [orcamentos, setOrcamentos] = useState<OrcamentoFormal[]>([])
  const [filtered, setFiltered] = useState<OrcamentoFormal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => { fetchOrcamentos() }, [])

  useEffect(() => {
    let result = orcamentos
    if (search) result = result.filter(o =>
      o.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      o.cliente_telefone.includes(search) ||
      o.cliente_cpf_cnpj.includes(search) ||
      String(o.numero).includes(search)
    )
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter)
    setFiltered(result)
  }, [search, statusFilter, orcamentos])

  async function fetchOrcamentos() {
    const { data, error } = await supabase
      .from('orcamentos_formais')
      .select('*')
      .order('numero', { ascending: false })
    if (error) toast.error('Erro ao carregar orçamentos.')
    setOrcamentos(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  async function deleteOrcamento(id: string) {
    if (!confirm('Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.')) return
    const { error } = await supabase.from('orcamentos_formais').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir orçamento.'); return }
    setOrcamentos(prev => prev.filter(o => o.id !== id))
    toast.success('Orçamento excluído.')
  }

  const totalFaturado = orcamentos
    .filter(o => o.status === 'faturado' || o.status === 'executado' || o.status === 'aprovado')
    .reduce((sum, o) => sum + o.total, 0)

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-white uppercase tracking-wider">Orçamentos</h1>
          <p className="text-gray-500 font-body text-sm mt-1">
            {orcamentos.length} orçamentos · Em aberto: {formatBRL(totalFaturado)}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/orcamentos/novo')}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 self-start sm:self-auto"
        >
          <Plus size={16} />
          Novo Orçamento
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone, CPF/CNPJ ou número..."
            className="input-dark pl-9"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-dark pl-9 pr-8 w-full sm:w-52 appearance-none">
            <option value="all">Todos os status</option>
            {(Object.entries(statusConfig) as [StatusOrcamentoFormal, { label: string }][]).map(([key, cfg]) => (
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
              {orcamentos.length === 0 ? 'Nenhum orçamento criado ainda.' : 'Nenhum resultado para a busca.'}
            </p>
            {orcamentos.length === 0 && (
              <button
                onClick={() => navigate('/admin/orcamentos/novo')}
                className="mt-4 btn-primary text-sm py-2 px-5 inline-flex items-center gap-2"
              >
                <Plus size={14} />
                Criar primeiro orçamento
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-500">
                  {['Nº', 'Cliente', 'Tipo de Serviço', 'Total', 'Status', 'Emissão', ''].map(h => (
                    <th key={h} className="text-left p-4 text-gray-500 font-body text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const cfg = statusConfig[o.status]
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-dark-600 hover:bg-dark-700/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/orcamentos/${o.id}`)}
                    >
                      <td className="p-4 text-primary-400 font-display font-semibold text-sm">
                        #{formatNumero(o.numero)}
                      </td>
                      <td className="p-4">
                        <div className="text-white font-body text-sm">{o.cliente_nome}</div>
                        <div className="text-gray-500 font-body text-xs">{o.cliente_telefone}</div>
                      </td>
                      <td className="p-4 text-gray-400 font-body text-sm max-w-[160px] truncate">{o.tipo_servico}</td>
                      <td className="p-4 text-white font-body text-sm font-semibold whitespace-nowrap">{formatBRL(o.total)}</td>
                      <td className="p-4">
                        <span className={`text-xs font-body px-2 py-0.5 border rounded-sm ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="p-4 text-gray-500 font-body text-xs whitespace-nowrap">
                        {o.data_emissao ? new Date(o.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/admin/orcamentos/${o.id}`)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Editar"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => window.open(`/admin/orcamentos/${o.id}/imprimir`, '_blank')}
                            className="text-gray-400 hover:text-primary-400 transition-colors"
                            title="Imprimir / PDF"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => deleteOrcamento(o.id)}
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

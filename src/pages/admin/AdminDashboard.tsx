import { useEffect, useState } from 'react'
import { FileText, MessageSquare, Clock, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { OrcamentoRequest, ContatoMessage } from '../../types'

interface Stats {
  orcamentosTotal: number
  orcamentosPendentes: number
  orcamentosHoje: number
  mensagensNaoLidas: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    orcamentosTotal: 0,
    orcamentosPendentes: 0,
    orcamentosHoje: 0,
    mensagensNaoLidas: 0,
  })
  const [recentOrcamentos, setRecentOrcamentos] = useState<OrcamentoRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const today = new Date().toISOString().split('T')[0]

      const [
        { count: total },
        { count: pendentes },
        { count: hoje },
        { count: naoLidas },
        { data: recentes },
      ] = await Promise.all([
        supabase.from('orcamentos').select('*', { count: 'exact', head: true }),
        supabase.from('orcamentos').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
        supabase.from('orcamentos').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('contatos').select('*', { count: 'exact', head: true }).eq('lida', false),
        supabase.from('orcamentos').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        orcamentosTotal: total || 0,
        orcamentosPendentes: pendentes || 0,
        orcamentosHoje: hoje || 0,
        mensagensNaoLidas: naoLidas || 0,
      })
      setRecentOrcamentos(recentes || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total de Orçamentos', value: stats.orcamentosTotal, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Pendentes', value: stats.orcamentosPendentes, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Recebidos Hoje', value: stats.orcamentosHoje, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Mensagens Não Lidas', value: stats.mensagensNaoLidas, icon: MessageSquare, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
  ]

  const statusConfig = {
    pendente: { label: 'Pendente', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    em_andamento: { label: 'Em andamento', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    concluido: { label: 'Concluído', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    cancelado: { label: 'Cancelado', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white uppercase tracking-wider">Dashboard</h1>
        <p className="text-gray-500 font-body text-sm mt-1">Visão geral do sistema</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-dark p-6 animate-pulse">
              <div className="h-4 bg-dark-500 rounded mb-4 w-3/4" />
              <div className="h-8 bg-dark-500 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(card => (
              <div key={card.label} className="card-dark p-6">
                <div className={`inline-flex p-2.5 border rounded-sm mb-3 ${card.bg}`}>
                  <card.icon size={18} className={card.color} />
                </div>
                <div className="font-display font-bold text-3xl text-white mb-1">
                  {card.value}
                </div>
                <div className="text-gray-500 font-body text-xs uppercase tracking-wider">{card.label}</div>
              </div>
            ))}
          </div>

          {/* Recent orcamentos */}
          <div className="card-dark">
            <div className="p-5 border-b border-dark-500 flex items-center justify-between">
              <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm">
                Últimos Orçamentos
              </h2>
              <a href="/admin/orcamentos" className="text-primary-400 hover:text-primary-300 text-xs font-body transition-colors">
                Ver todos →
              </a>
            </div>

            {recentOrcamentos.length === 0 ? (
              <div className="p-10 text-center">
                <AlertTriangle size={32} className="text-dark-400 mx-auto mb-3" />
                <p className="text-gray-500 font-body text-sm">Nenhum orçamento recebido ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-500">
                      {['Nome', 'Serviço', 'Urgência', 'Status', 'Data'].map(h => (
                        <th key={h} className="text-left p-4 text-gray-500 font-body text-xs uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrcamentos.map(o => {
                      const cfg = statusConfig[o.status]
                      return (
                        <tr key={o.id} className="border-b border-dark-600 hover:bg-dark-700/50 transition-colors">
                          <td className="p-4 text-white font-body text-sm">{o.nome}</td>
                          <td className="p-4 text-gray-400 font-body text-sm">{o.tipo_servico}</td>
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
                          <td className="p-4 text-gray-500 font-body text-xs">
                            {new Date(o.created_at).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

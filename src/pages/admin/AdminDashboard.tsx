import { useEffect, useState } from 'react'
import { FileText, MessageSquare, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { OrcamentoRequest } from '../../types'

interface Stats {
  orcamentosTotal: number
  orcamentosPendentes: number
  orcamentosHoje: number
  mensagensNaoLidas: number
}

const STATUS_COLORS: Record<string, string> = {
  pendente: '#facc15',
  em_andamento: '#60a5fa',
  concluido: '#4ade80',
  cancelado: '#f87171',
}

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  em_andamento: { label: 'Em andamento', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  concluido: { label: 'Concluído', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  cancelado: { label: 'Cancelado', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
}

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function formatDay(dateStr: string) {
  const [, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    orcamentosTotal: 0,
    orcamentosPendentes: 0,
    orcamentosHoje: 0,
    mensagensNaoLidas: 0,
  })
  const [recentOrcamentos, setRecentOrcamentos] = useState<OrcamentoRequest[]>([])
  const [allOrcamentos, setAllOrcamentos] = useState<OrcamentoRequest[]>([])
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
        { data: todos },
      ] = await Promise.all([
        supabase.from('orcamentos').select('*', { count: 'exact', head: true }),
        supabase.from('orcamentos').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
        supabase.from('orcamentos').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('contatos').select('*', { count: 'exact', head: true }).eq('lida', false),
        supabase.from('orcamentos').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('orcamentos').select('*').order('created_at', { ascending: false }),
      ])

      setStats({
        orcamentosTotal: total || 0,
        orcamentosPendentes: pendentes || 0,
        orcamentosHoje: hoje || 0,
        mensagensNaoLidas: naoLidas || 0,
      })
      setRecentOrcamentos(recentes || [])
      setAllOrcamentos(todos || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // Chart: orçamentos por status (donut)
  const statusData = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    name: label,
    value: allOrcamentos.filter(o => o.status === key).length,
    color: STATUS_COLORS[key],
  })).filter(d => d.value > 0)

  // Chart: orçamentos por dia (últimos 7 dias)
  const days = getLast7Days()
  const dailyData = days.map(day => ({
    dia: formatDay(day),
    total: allOrcamentos.filter(o => o.created_at.startsWith(day)).length,
  }))

  const statCards = [
    { label: 'Total de Orçamentos', value: stats.orcamentosTotal, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Pendentes', value: stats.orcamentosPendentes, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Recebidos Hoje', value: stats.orcamentosHoje, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Mensagens Não Lidas', value: stats.mensagensNaoLidas, icon: MessageSquare, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-white uppercase tracking-wider">Dashboard</h1>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map(card => (
              <div key={card.label} className="card-dark p-5">
                <div className={`inline-flex p-2.5 border rounded-sm mb-3 ${card.bg}`}>
                  <card.icon size={18} className={card.color} />
                </div>
                <div className="font-display font-bold text-2xl lg:text-3xl text-white mb-1">
                  {card.value}
                </div>
                <div className="text-gray-500 font-body text-xs uppercase tracking-wider leading-snug">{card.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Bar chart: últimos 7 dias */}
            <div className="card-dark p-5">
              <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-4">
                Orçamentos — Últimos 7 dias
              </h2>
              {allOrcamentos.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-500 font-body text-sm">Sem dados ainda.</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <XAxis dataKey="dia" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1c1c24', border: '1px solid #2a2a35', borderRadius: 6, color: '#fff', fontSize: 12 }}
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      formatter={(val) => [val, 'Orçamentos']}
                    />
                    <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie chart: por status */}
            <div className="card-dark p-5">
              <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-4">
                Orçamentos por Status
              </h2>
              {statusData.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-500 font-body text-sm">Sem dados ainda.</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1c1c24', border: '1px solid #2a2a35', borderRadius: 6, color: '#fff', fontSize: 12 }}
                      formatter={(val, name) => [val, name]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
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
                        <th key={h} className="text-left p-4 text-gray-500 font-body text-xs uppercase tracking-wider whitespace-nowrap">
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
                          <td className="p-4 text-white font-body text-sm whitespace-nowrap">{o.nome}</td>
                          <td className="p-4 text-gray-400 font-body text-sm max-w-[120px] truncate">{o.tipo_servico}</td>
                          <td className="p-4">
                            <span className={`text-xs font-body px-2 py-0.5 border rounded-sm capitalize whitespace-nowrap
                              ${o.urgencia === 'emergencia' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                                o.urgencia === 'urgente' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                                'text-gray-400 bg-dark-500 border-dark-400'}`}>
                              {o.urgencia}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-body px-2 py-0.5 border rounded-sm whitespace-nowrap ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 font-body text-xs whitespace-nowrap">
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

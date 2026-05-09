import { useEffect, useState } from 'react'
import { Search, Trash2, MailOpen, Mail, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { ContatoMessage } from '../../types'

export default function AdminMensagens() {
  const [mensagens, setMensagens] = useState<ContatoMessage[]>([])
  const [filtered, setFiltered] = useState<ContatoMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ContatoMessage | null>(null)

  useEffect(() => { fetchMensagens() }, [])

  useEffect(() => {
    setFiltered(
      search
        ? mensagens.filter(m =>
            m.nome.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase())
          )
        : mensagens
    )
  }, [search, mensagens])

  async function fetchMensagens() {
    const { data } = await supabase.from('contatos').select('*').order('created_at', { ascending: false })
    setMensagens(data || [])
    setLoading(false)
  }

  async function marcarLida(id: string) {
    await supabase.from('contatos').update({ lida: true }).eq('id', id)
    setMensagens(prev => prev.map(m => m.id === id ? { ...m, lida: true } : m))
    setSelected(prev => prev?.id === id ? { ...prev, lida: true } : prev)
  }

  async function deleteMensagem(id: string) {
    if (!confirm('Excluir esta mensagem?')) return
    await supabase.from('contatos').delete().eq('id', id)
    setMensagens(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  async function handleSelect(m: ContatoMessage) {
    setSelected(m)
    if (!m.lida) await marcarLida(m.id)
  }

  const naoLidas = mensagens.filter(m => !m.lida).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white uppercase tracking-wider">Mensagens</h1>
        <p className="text-gray-500 font-body text-sm mt-1">
          {mensagens.length} mensagens · <span className="text-primary-400">{naoLidas} não lidas</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar mensagens..." className="input-dark pl-9" />
        </div>
      </div>

      <div className={`${selected ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
        <div className="card-dark overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-body">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <AlertTriangle size={32} className="text-dark-400 mx-auto mb-3" />
              <p className="text-gray-500 font-body text-sm">Nenhuma mensagem encontrada.</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-600">
              {filtered.map(m => (
                <div
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={`p-4 cursor-pointer hover:bg-dark-700/50 transition-colors flex items-start gap-3 ${selected?.id === m.id ? 'bg-dark-700' : ''}`}
                >
                  <div className={`mt-0.5 shrink-0 ${!m.lida ? 'text-primary-400' : 'text-dark-400'}`}>
                    {m.lida ? <MailOpen size={16} /> : <Mail size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-body text-sm ${!m.lida ? 'text-white font-semibold' : 'text-gray-300'}`}>
                        {m.nome}
                      </span>
                      <span className="text-gray-500 font-body text-xs whitespace-nowrap">
                        {new Date(m.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-gray-500 font-body text-xs mt-0.5">{m.email}</div>
                    <p className="text-gray-400 font-body text-xs mt-1 truncate">{m.mensagem}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteMensagem(m.id) }}
                    className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm">Mensagem</h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white transition-colors text-xs font-body">Fechar ×</button>
            </div>
            <div className="space-y-4">
              {[['De', selected.nome], ['E-mail', selected.email], ['Telefone', selected.telefone || '—'], ['Data', new Date(selected.created_at).toLocaleString('pt-BR')]].map(([label, value]) => (
                <div key={label}>
                  <div className="text-gray-500 font-body text-xs uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-white font-body text-sm">{value}</div>
                </div>
              ))}
              <div>
                <div className="text-gray-500 font-body text-xs uppercase tracking-wider mb-2">Mensagem</div>
                <div className="text-gray-300 font-body text-sm bg-dark-700 p-4 border border-dark-500 rounded-sm leading-relaxed">
                  {selected.mensagem}
                </div>
              </div>
              <a
                href={`mailto:${selected.email}`}
                className="btn-primary text-sm flex items-center justify-center gap-2 w-full"
              >
                <Mail size={14} />
                Responder por E-mail
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

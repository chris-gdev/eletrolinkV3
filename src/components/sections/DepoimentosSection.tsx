import { useEffect, useState } from 'react'
import { Star, Quote, MessageSquare, Check, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

type Depoimento = {
  id: string
  nome: string
  servico: string
  texto: string
  avaliacao: number
}

const emptyForm = { nome: '', servico: '', texto: '', avaliacao: 5 }

export default function DepoimentosSection() {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    supabase
      .from('depoimentos')
      .select('id, nome, servico, texto, avaliacao')
      .eq('ativo', true)
      .order('ordem', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setDepoimentos(data)
      })
  }, [])

  async function enviarDepoimento() {
    if (!form.nome.trim() || !form.texto.trim()) {
      toast.error('Preencha seu nome e o depoimento.')
      return
    }
    setEnviando(true)
    const { error } = await supabase.from('depoimentos').insert([{
      nome: form.nome.trim(),
      servico: form.servico.trim(),
      texto: form.texto.trim(),
      avaliacao: form.avaliacao,
      ativo: false,
      ordem: 999,
    }])
    setEnviando(false)
    if (error) { toast.error('Erro ao enviar. Tente novamente.'); return }
    setEnviado(true)
    setForm(emptyForm)
  }

  return (
    <section id="depoimentos" className="py-24 bg-dark-800 relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block bg-primary-500/10 border border-primary-500/30 px-4 py-1 mb-4">
            <span className="text-primary-400 font-display text-xs uppercase tracking-widest">
              O que dizem nossos clientes
            </span>
          </div>
          <h2 className="section-title text-white mb-4">DEPOIMENTOS</h2>
          <p className="text-gray-400 font-body max-w-xl mx-auto">
            A satisfação dos nossos clientes é nossa maior conquista.
          </p>
        </div>

        {depoimentos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {depoimentos.map((dep) => (
              <div
                key={dep.id}
                className="card-dark p-6 hover:border-primary-500/30 transition-all duration-200 relative group"
              >
                <Quote size={28} className="text-primary-500/20 absolute top-5 right-5 group-hover:text-primary-500/30 transition-colors" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className={j < dep.avaliacao ? 'text-primary-500 fill-primary-500' : 'text-dark-400'} />
                  ))}
                </div>
                <p className="text-gray-300 font-body text-sm leading-relaxed mb-5 italic">"{dep.texto}"</p>
                <div className="border-t border-dark-500 pt-4">
                  <div className="font-display font-semibold text-white text-sm uppercase tracking-wide">{dep.nome}</div>
                  {dep.servico && <div className="text-primary-500 text-xs font-body mt-0.5">{dep.servico}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA + Formulário */}
        <div className="max-w-xl mx-auto">
          {!enviado ? (
            <>
              <button
                onClick={() => setShowForm(v => !v)}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 border border-primary-500/40 text-primary-400 hover:bg-primary-500/10 transition-colors font-display text-sm uppercase tracking-wider rounded-sm"
              >
                <MessageSquare size={16} />
                Deixe seu depoimento
                {showForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showForm && (
                <div className="mt-5 card-dark p-6 space-y-4">
                  <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
                    Compartilhe sua experiência
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">Seu nome *</label>
                      <input
                        value={form.nome}
                        onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                        className="input-dark"
                        placeholder="João da Silva"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">Serviço contratado</label>
                      <input
                        value={form.servico}
                        onChange={e => setForm(p => ({ ...p, servico: e.target.value }))}
                        className="input-dark"
                        placeholder="Instalação residencial"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-2">Avaliação</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} type="button" onClick={() => setForm(p => ({ ...p, avaliacao: n }))}>
                          <Star size={24} className={n <= form.avaliacao ? 'text-primary-500 fill-primary-500' : 'text-dark-400 hover:text-primary-500/50 transition-colors'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">Seu depoimento *</label>
                    <textarea
                      value={form.texto}
                      onChange={e => setForm(p => ({ ...p, texto: e.target.value }))}
                      rows={4}
                      className="input-dark resize-none"
                      placeholder="Conte como foi sua experiência com nossos serviços..."
                    />
                  </div>

                  <button
                    onClick={enviarDepoimento}
                    disabled={enviando}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Check size={16} />
                    {enviando ? 'Enviando...' : 'Enviar depoimento'}
                  </button>

                  <p className="text-gray-600 font-body text-xs text-center">
                    Seu depoimento será publicado após revisão da equipe.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="card-dark p-8 text-center">
              <div className="inline-flex p-4 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
                <Check size={28} className="text-green-400" />
              </div>
              <h3 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-2">
                Depoimento enviado!
              </h3>
              <p className="text-gray-400 font-body text-sm">
                Obrigado pelo seu feedback. Ele será publicado após revisão da nossa equipe.
              </p>
              <button
                onClick={() => { setEnviado(false); setShowForm(false) }}
                className="mt-4 text-primary-400 font-body text-xs hover:text-primary-300 transition-colors"
              >
                Enviar outro →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

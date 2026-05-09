import { useEffect, useState } from 'react'
import { Star, Quote } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Depoimento = {
  id: string
  nome: string
  servico: string
  texto: string
  avaliacao: number
}

export default function DepoimentosSection() {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([])

  useEffect(() => {
    supabase
      .from('depoimentos')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setDepoimentos(data)
      })
  }, [])

  if (depoimentos.length === 0) return null

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {depoimentos.map((dep, i) => (
            <div
              key={dep.id}
              className="card-dark p-6 hover:border-primary-500/30 transition-all duration-200 relative group"
            >
              <Quote size={28} className="text-primary-500/20 absolute top-5 right-5 group-hover:text-primary-500/30 transition-colors" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className={j < dep.avaliacao ? 'text-primary-500 fill-primary-500' : 'text-dark-400'}
                  />
                ))}
              </div>

              <p className="text-gray-300 font-body text-sm leading-relaxed mb-5 italic">
                "{dep.texto}"
              </p>

              <div className="border-t border-dark-500 pt-4">
                <div className="font-display font-semibold text-white text-sm uppercase tracking-wide">
                  {dep.nome}
                </div>
                <div className="text-primary-500 text-xs font-body mt-0.5">{dep.servico}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import * as Icons from 'lucide-react'

type Servico = {
  id: string
  titulo: string
  descricao: string
  itens: string[]
  icone: string
  ordem: number
}

function DynamicIcon({ name, size, className }: { name: string; size: number; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (Icons as any)[name] as Icons.LucideIcon | undefined
  if (!Icon) return <Icons.Zap size={size} className={className} />
  return <Icon size={size} className={className} />
}

export default function ServicosSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [servicos, setServicos] = useState<Servico[]>([])

  useEffect(() => {
    supabase
      .from('servicos')
      .select('*')
      .eq('ativo', true)
      .order('ordem', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setServicos(data)
      })
  }, [])

  useEffect(() => {
    if (servicos.length === 0) return
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [servicos])

  return (
    <section id="servicos" ref={sectionRef} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="section-title mb-3">Nossos Serviços</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Expertise completa para todas as suas necessidades elétricas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicos.map((servico, i) => (
            <div
              key={servico.id}
              className="animate-on-scroll card-light p-7 flex flex-col"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{ background: i % 2 === 0 ? 'linear-gradient(135deg, #1a56db, #1e3a8a)' : 'linear-gradient(135deg, #d4a017, #92680a)' }}
              >
                <DynamicIcon name={servico.icone} size={24} className="text-white" />
              </div>

              <h3 className="font-bold text-xl text-gray-900 mb-2">{servico.titulo}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{servico.descricao}</p>

              <ul className="space-y-1.5 mb-6 flex-1">
                {(servico.itens || []).map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="#orcamento"
                className="mt-auto block text-center py-3 px-5 rounded-lg font-semibold text-sm transition-all duration-200"
                style={{ background: i % 2 === 0 ? 'linear-gradient(90deg, #1a56db, #d4a017)' : 'linear-gradient(90deg, #d4a017, #1a56db)', color: 'white' }}
              >
                Solicitar Orçamento
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

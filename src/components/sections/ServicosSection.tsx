import { useEffect, useRef } from 'react'
import { Home, Building2, Sun, Wrench, AirVent, Zap } from 'lucide-react'

const servicos = [
  {
    icon: Home,
    titulo: 'Instalações Residenciais',
    descricao: 'Projetos completos de instalações elétricas para residências, garantindo segurança e eficiência energética.',
    itens: ['Quadros de distribuição', 'Tomadas e interruptores', 'Iluminação LED', 'Circuitos dedicados'],
  },
  {
    icon: Building2,
    titulo: 'Instalações Comerciais',
    descricao: 'Soluções elétricas para estabelecimentos comerciais e industriais com foco em produtividade.',
    itens: ['Sistemas trifásicos', 'Quadros de comando', 'Iluminação industrial', 'Cabeamento estruturado'],
  },
  {
    icon: Sun,
    titulo: 'Energia Solar',
    descricao: 'Instalação de sistemas fotovoltaicos para reduzir sua conta de energia em até 95%.',
    itens: ['Projeto personalizado', 'Instalação completa', 'Conexão à rede', 'Monitoramento'],
  },
  {
    icon: Wrench,
    titulo: 'Manutenção',
    descricao: 'Serviços de manutenção preventiva e corretiva para manter seu sistema sempre funcionando.',
    itens: ['Inspeção termográfica', 'Teste de isolamento', 'Limpeza de quadros', 'Substituição preventiva'],
  },
  {
    icon: AirVent,
    titulo: 'Ar Condicionado',
    descricao: 'Instalação e manutenção de sistemas de ar condicionado residenciais e comerciais.',
    itens: ['Instalação completa', 'Manutenção preventiva', 'Limpeza e higienização', 'Sistemas Split e Central'],
  },
]

export default function ServicosSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

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
              key={servico.titulo}
              className="animate-on-scroll card-light p-7 flex flex-col"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{ background: i % 2 === 0 ? 'linear-gradient(135deg, #1a56db, #1e3a8a)' : 'linear-gradient(135deg, #d4a017, #92680a)' }}>
                <servico.icon size={24} className="text-white" />
              </div>

              <h3 className="font-bold text-xl text-gray-900 mb-2">{servico.titulo}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{servico.descricao}</p>

              <ul className="space-y-1.5 mb-6 flex-1">
                {servico.itens.map(item => (
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

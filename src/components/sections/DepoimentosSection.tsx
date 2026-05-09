import { Star, Quote } from 'lucide-react'

const depoimentos = [
  {
    nome: 'Carlos Eduardo S.',
    servico: 'Instalação Residencial',
    texto: 'Excelente trabalho! A equipe foi muito profissional, pontual e deixou tudo limpo após o serviço. Já indicaria a todos os amigos.',
    avaliacao: 5,
  },
  {
    nome: 'Maria Fernanda L.',
    servico: 'Manutenção Preventiva',
    texto: 'Contratei para fazer a revisão geral da casa e fiquei muito satisfeita. Encontraram problemas que eu nem sabia que existiam e resolveram tudo.',
    avaliacao: 5,
  },
  {
    nome: 'Roberto A.',
    servico: 'Emergência 24h',
    texto: 'Tive um curto-circuito às 23h e em menos de 1 hora o técnico estava aqui. Resolveram o problema rápido. Atendimento nota 10!',
    avaliacao: 5,
  },
  {
    nome: 'Ana Paula M.',
    servico: 'Laudo Técnico',
    texto: 'Precisei do laudo para o seguro do meu apartamento. Foram ágeis, o preço foi justo e o documento veio com tudo que o seguro pediu.',
    avaliacao: 5,
  },
  {
    nome: 'Fábio R.',
    servico: 'Quadro Elétrico',
    texto: 'Troquei o quadro antigo por um moderno e a diferença foi enorme. Acabou com os desligamentos constantes. Ótimo custo-benefício.',
    avaliacao: 4,
  },
  {
    nome: 'Luciana T.',
    servico: 'Projeto Comercial',
    texto: 'Contratamos para fazer toda a parte elétrica do nosso escritório. Cumpriram o prazo e o serviço ficou impecável. Super recomendo.',
    avaliacao: 5,
  },
]

export default function DepoimentosSection() {
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
          <h2 className="section-title text-white mb-4">
            DEPOIMENTOS
          </h2>
          <p className="text-gray-400 font-body max-w-xl mx-auto">
            A satisfação dos nossos clientes é nossa maior conquista.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {depoimentos.map((dep, i) => (
            <div
              key={i}
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

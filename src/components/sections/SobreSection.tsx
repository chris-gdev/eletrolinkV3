import { useEffect, useRef } from "react";
import { CheckCircle2, Shield, Zap, Award } from "lucide-react";

const valores = [
  {
    titulo: "Segurança",
    desc: "Priorizamos a segurança em todos os projetos, seguindo rigorosamente as normas técnicas.",
  },
  {
    titulo: "Qualidade",
    desc: "Utilizamos apenas materiais certificados e seguimos os mais altos padrões de qualidade.",
  },
  {
    titulo: "Pontualidade",
    desc: "Respeitamos prazos e horários, entregando nossos projetos sempre no tempo acordado.",
  },
  {
    titulo: "Compromisso",
    desc: "Estamos comprometidos com a satisfação total de nossos clientes em cada projeto.",
  },
];

const certificacoes = [
  "NR-10 - Segurança em Instalações e Serviços em Eletricidade",
  "CREA - Conselho Regional de Engenharia e Agronomia",
  "ABNT NBR 5410 - Instalações Elétricas de Baixa Tensão",
];

export default function SobreSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.1 },
    );
    sectionRef.current
      ?.querySelectorAll(".animate-on-scroll")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="sobre" ref={sectionRef}>
      {/* Hero sobre */}
      <div
        className="py-16 text-center text-white"
        style={{
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #1a56db 40%, #92680a 75%, #d4a017 100%)",
        }}
      >
        <h2 className="font-bold text-4xl md:text-5xl mb-4">
          Sobre a Eletro Link Manutenções
        </h2>
        <p className="text-blue-100 max-w-xl mx-auto">
          Há mais de 5 anos transformando ideias em realidade através de
          soluções elétricas inovadoras, seguras e eficientes.
        </p>
      </div>

      {/* Nossa História */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-20">
            <div className="animate-on-scroll">
              <h3 className="font-bold text-3xl text-gray-900 mb-4">
                Nossa História
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A Eletro Link Manutenções nasceu em 2019 com o sonho de oferecer
                serviços elétricos de excelência. Começamos como uma pequena
                empresa familiar e hoje somos referência no setor, atendendo
                desde residências até grandes complexos comerciais.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Nossa trajetória é marcada pela constante busca por inovação e
                qualidade. Investimos continuamente em capacitação da nossa
                equipe e nas mais modernas tecnologias do mercado elétrico.
              </p>
            </div>
            <div
              className="animate-on-scroll"
              style={{ transitionDelay: "150ms" }}
            >
              <img
                src="https://thumbs.dreamstime.com/b/empres%C3%A1rios-conversando-na-reuni%C3%A3o-funcion%C3%A1rios-da-empresa-falando-no-escrit%C3%B3rio-conceito-de-trabalho-em-equipe-grupo-275596750.jpg"
                alt="Equipe Eletro Link"
                className="rounded-2xl w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>

          {/* Por que escolher */}
          <div className="animate-on-scroll text-center mb-10">
            <h3 className="font-bold text-3xl text-gray-900 mb-2">
              Por que escolher a Eletro Link?
            </h3>
            <p className="text-gray-500">
              Compromisso com a excelência em cada projeto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: Shield,
                titulo: "Segurança Garantida",
                desc: "Todos os projetos seguem rigorosamente as normas de segurança.",
              },
              {
                icon: Zap,
                titulo: "Atendimento 24h",
                desc: "Emergências elétricas atendidas a qualquer hora do dia.",
              },
              {
                icon: Award,
                titulo: "Profissionais Certificados",
                desc: "Equipe qualificada e certificada para todos os tipos de serviço.",
              },
            ].map((item, i) => (
              <div
                key={item.titulo}
                className="animate-on-scroll text-center"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: "linear-gradient(135deg, #1a56db, #d4a017)",
                  }}
                >
                  <item.icon size={28} className="text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{item.titulo}</h4>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Nossos Valores */}
          <div className="animate-on-scroll text-center mb-10">
            <h3 className="font-bold text-3xl text-gray-900 mb-2">
              Nossos Valores
            </h3>
            <p className="text-gray-500">
              Os princípios que guiam nossa empresa
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
            {valores.map((v, i) => (
              <div
                key={v.titulo}
                className="animate-on-scroll card-light p-6 text-center"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background:
                      i % 2 === 0
                        ? "linear-gradient(135deg, #1a56db, #1e3a8a)"
                        : "linear-gradient(135deg, #d4a017, #92680a)",
                  }}
                >
                  <Award size={22} className="text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{v.titulo}</h4>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Certificações */}
          <div className="animate-on-scroll text-center mb-8">
            <h3 className="font-bold text-3xl text-gray-900 mb-2">
              Certificações e Qualificações
            </h3>
            <p className="text-gray-500">
              Reconhecimentos que garantem nossa qualidade
            </p>
          </div>
          <div className="animate-on-scroll card-light p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificacoes.map((cert) => (
                <div key={cert} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  <span className="text-gray-700 text-sm">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

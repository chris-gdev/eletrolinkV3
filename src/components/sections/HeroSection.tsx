import { ArrowRight, Phone, Shield, Clock, Star } from "lucide-react";
import { useConfig } from "../../hooks/useConfig";

export default function HeroSection() {
  const config = useConfig()

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1e3a8a 0%, #1a56db 35%, #92680a 70%, #d4a017 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-bold text-5xl md:text-6xl text-white leading-tight mb-4">
              Soluções Elétricas
              <br />
              <span className="text-yellow-300">Completas</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-lg">
              Transformamos sua casa ou empresa com instalações elétricas
              seguras, modernas e eficientes. Mais de 5 anos de experiência no
              mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a
                href="#orcamento"
                className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                Solicitar Orçamento
                <ArrowRight size={18} />
              </a>
              <a
                href={`tel:${config.telefone.replace(/\D/g, '')}`}
                className="flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-blue-800 font-semibold px-8 py-4 rounded-lg transition-all duration-200"
              >
                <Phone size={18} />
                {config.telefone}
              </a>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              {[
                { icon: Clock, value: "24h", label: "Atendimento" },
                { icon: Star, value: "500+", label: "Clientes" },
                { icon: Shield, value: "5+", label: "Anos de exp." },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <Icon size={20} className="text-yellow-300 mx-auto mb-2" />
                  <div className="font-bold text-2xl text-white">{value}</div>
                  <div className="text-blue-200 text-xs uppercase tracking-wider">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src="https://www.toplinearcondicionado.com.br/wp-content/uploads/2023/08/blog-aprenda-o-passo-a-passo-para-a-instalacao-de-quadro-de-distribuicao-em-sua-casa-bf515c2877.png"
                  alt="Serviços elétricos profissionais"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl px-5 py-3 flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-yellow-500 p-2 rounded-lg">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">
                    NR-10 Certificado
                  </div>
                  <div className="text-gray-500 text-xs">CREA Registrado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

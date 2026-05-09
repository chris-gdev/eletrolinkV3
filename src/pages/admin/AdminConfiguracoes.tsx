import { useState } from "react";
import { Save, ExternalLink, Database, Lock } from "lucide-react";

export default function AdminConfiguracoes() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white uppercase tracking-wider">
          Configurações
        </h1>
        <p className="text-gray-500 font-body text-sm mt-1">
          Gerenciar configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-dark p-6">
          <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-5 pb-3 border-b border-dark-500">
            Informações da Empresa
          </h2>
          <div className="space-y-4">
            {[
              {
                label: "Nome da Empresa",
                placeholder: "Eletro Link Manutenções",
                type: "text",
              },
              {
                label: "Telefone Principal",
                placeholder: "(11) 94764-1802",
                type: "tel",
              },
              { label: "WhatsApp", placeholder: "5511947641802", type: "tel" },
              {
                label: "E-mail",
                placeholder: "eletrolink220@gmail.com",
                type: "email",
              },
              {
                label: "Endereço",
                placeholder: "São Paulo - SP",
                type: "text",
              },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  className="input-dark"
                />
              </div>
            ))}
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-5"
            >
              <Save size={14} />
              {saved ? "Salvo!" : "Salvar Informações"}
            </button>
          </div>
        </div>

        <div className="card-dark p-6">
          <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-5 pb-3 border-b border-dark-500">
            SEO & Redes Sociais
          </h2>
          <div className="space-y-4">
            {[
              {
                label: "Título do Site",
                placeholder: "Eletro Link - Serviços Elétricos",
              },
              {
                label: "Descrição Meta",
                placeholder: "Especialistas em serviços elétricos...",
              },
              { label: "Instagram", placeholder: "@eletrolink" },
              { label: "Facebook", placeholder: "fb.com/eletrolink" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">
                  {f.label}
                </label>
                <input
                  type="text"
                  placeholder={f.placeholder}
                  className="input-dark"
                />
              </div>
            ))}
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-5"
            >
              <Save size={14} />
              Salvar SEO
            </button>
          </div>
        </div>

        <div className="card-dark p-6">
          <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-5 pb-3 border-b border-dark-500">
            Links Rápidos
          </h2>
          <div className="space-y-3">
            <a
              href="/"
              className="flex items-center gap-3 text-gray-300 hover:text-primary-400 transition-colors font-body text-sm"
            >
              <ExternalLink size={15} className="text-primary-500" />
              Ver Site
            </a>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-300 hover:text-primary-400 transition-colors font-body text-sm"
            >
              <Database size={15} className="text-primary-500" />
              Supabase Dashboard
            </a>
          </div>
        </div>

        <div className="card-dark p-6">
          <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-5 pb-3 border-b border-dark-500 flex items-center gap-2">
            <Lock size={14} className="text-primary-500" />
            Segurança
          </h2>
          <p className="text-gray-500 font-body text-sm">
            Para alterar a senha, acesse o painel do Supabase em{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:underline"
            >
              Authentication → Users
            </a>{" "}
            e edite o usuário diretamente.
          </p>
        </div>
      </div>
    </div>
  );
}

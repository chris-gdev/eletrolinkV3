import { Zap, Phone, Mail, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useConfig } from '../../hooks/useConfig'

export default function Footer() {
  const config = useConfig()

  return (
    <footer className="bg-dark-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-gradient-to-br from-primary-500 to-gold-500 p-2 rounded-lg">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <div>
                <div className="font-bold text-base text-white">{config.nome_empresa.split(' ').slice(0, 2).join(' ')}</div>
                <div className="text-gray-400 text-xs">{config.nome_empresa.split(' ').slice(2).join(' ') || 'Manutenções'}</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Soluções elétricas completas para residências e empresas. Mais de
              5 anos de experiência no mercado com qualidade e segurança
              garantidas.
            </p>
            <div className="flex gap-3">
              {config.instagram && (
                <a href={config.instagram} target="_blank" rel="noopener noreferrer" className="bg-dark-600 hover:bg-primary-500 p-2 rounded-lg transition-colors">
                  <Instagram size={16} />
                </a>
              )}
              {config.facebook && (
                <a href={config.facebook} target="_blank" rel="noopener noreferrer" className="bg-dark-600 hover:bg-primary-500 p-2 rounded-lg transition-colors">
                  <Facebook size={16} />
                </a>
              )}
              {config.whatsapp && (
                <a href={`https://wa.me/${config.whatsapp}`} className="bg-dark-600 hover:bg-green-600 p-2 rounded-lg transition-colors">
                  <MessageCircle size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Links Rápidos</h4>
            <ul className="space-y-2">
              {[['Início', '#inicio'], ['Serviços', '#servicos'], ['Sobre', '#sobre'], ['Contato', '#contato'], ['Orçamento', '#orcamento']].map(([l, h]) => (
                <li key={l}>
                  <a href={h} className="text-gray-400 hover:text-white text-sm transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Nossos Serviços */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Nossos Serviços</h4>
            <ul className="space-y-2">
              {['Instalações Residenciais', 'Instalações Comerciais', 'Energia Solar', 'Manutenção', 'Ar Condicionado', 'Emergências 24h'].map(s => (
                <li key={s}>
                  <a href="#servicos" className="text-gray-400 hover:text-white text-sm transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone size={14} className="text-blue-400 shrink-0" />
                <a href={`tel:${config.telefone.replace(/\D/g, '')}`} className="hover:text-white transition-colors">
                  {config.telefone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail size={14} className="text-blue-400 shrink-0" />
                <a href={`mailto:${config.email}`} className="hover:text-white transition-colors">
                  {config.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <Clock size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <span>{config.horario}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-dark-600 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} {config.nome_empresa}. Todos os direitos reservados.
          </p>
          <p className="text-gray-600 text-xs flex gap-4">
            <span>NR-10 Certificada</span>
            <span>·</span>
            <span>CREA Registrada</span>
            <span>·</span>
            <span>Garantia Total</span>
            <span>·</span>
            <Link to="/admin/login" className="hover:text-gray-400 transition-colors">
              Área Restrita
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

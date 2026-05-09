import { useState, useEffect } from 'react'
import { Zap, Menu, X, Phone } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Início', href: '#inicio' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Contato', href: '#contato' },
    { label: 'Orçamento', href: '#orcamento' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-dark-800/95 backdrop-blur-sm shadow-lg py-3'
        : 'bg-dark-800 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-primary-500 to-gold-500 p-2 rounded-lg">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-lg text-white">
              Eletro Link Manutenções
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="font-medium text-sm text-gray-300 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+5511947641802"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-sm"
            >
              <Phone size={13} />
              <span>(11) 94764-1802</span>
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-1"
            aria-label="Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-dark-700 border-t border-dark-500 py-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-col gap-3">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-medium text-gray-300 hover:text-white transition-colors py-2 border-b border-dark-500"
              >
                {link.label}
              </a>
            ))}
            <a href="#orcamento" onClick={() => setIsOpen(false)} className="btn-primary text-center mt-2">
              Solicitar Orçamento
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

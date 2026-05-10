import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/sections/HeroSection'
import ServicosSection from '../components/sections/ServicosSection'
import SobreSection from '../components/sections/SobreSection'
import OrcamentoSection from '../components/sections/OrcamentoSection'
import ContatoSection from '../components/sections/ContatoSection'
import DepoimentosSection from '../components/sections/DepoimentosSection'
import { MessageCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <ServicosSection />
      <SobreSection />
      <DepoimentosSection />
      <ContatoSection />
      <OrcamentoSection />
      <Footer />

      {/* WhatsApp float */}
      <a
        href="https://wa.me/5511947641802"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 sm:left-auto sm:right-6 bg-green-500 hover:bg-green-400 text-white p-4 shadow-2xl shadow-green-500/30 transition-all duration-200 hover:scale-110 z-40 rounded-full"
        title="WhatsApp"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  )
}

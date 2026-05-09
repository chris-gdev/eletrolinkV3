import { useState } from 'react'
import { Phone, Mail, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ContatoSection() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const { error } = await supabase.from('contatos').insert([{ ...form, lida: false }])
      if (error) throw error
      setStatus('success')
      setForm({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' })
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 5000)
  }

  return (
    <section id="contato" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-title mb-3">Contato</h2>
          <p className="text-gray-500">Estamos prontos para atender você</p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {[
            { icon: Phone, titulo: 'Telefone', valor: '(11) 94764-1802', sub: 'Atendimento 24 horas', href: 'tel:+5511947641802', color: true },
            { icon: Mail, titulo: 'Email', valor: 'eletrolink220@gmail.com', sub: 'Resposta em até 24 horas', href: 'mailto:eletrolink220@gmail.com', color: true },
            { icon: Clock, titulo: 'Horário', valor: 'Seg a Sex: 8h às 18h', sub: 'Emergências: 24h', href: undefined, color: false },
          ].map(item => (
            <div key={item.titulo} className="card-light p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #1a56db, #d4a017)' }}>
                <item.icon size={22} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{item.titulo}</h4>
              {item.href ? (
                <a href={item.href} className="text-blue-600 hover:text-blue-700 font-medium block">{item.valor}</a>
              ) : (
                <p className="text-blue-600 font-medium">{item.valor}</p>
              )}
              <p className="text-gray-400 text-sm mt-1">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 card-light p-8">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <MessageCircle size={20} className="text-blue-600" />
              Envie uma Mensagem
            </h3>

            {status === 'success' ? (
              <div className="text-center py-10">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h4 className="font-bold text-xl text-gray-900 mb-2">Mensagem Enviada!</h4>
                <p className="text-gray-500">Retornaremos em breve. Obrigado!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Nome Completo *</label>
                    <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} required placeholder="Seu nome completo" className="input-light" />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="seu@email.com" className="input-light" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Telefone *</label>
                    <input value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))} required placeholder="(11) 99999-9999" className="input-light" />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Assunto *</label>
                    <select value={form.assunto} onChange={e => setForm(p => ({ ...p, assunto: e.target.value }))} required className="input-light">
                      <option value="">Selecione...</option>
                      <option>Instalação Residencial</option>
                      <option>Instalação Comercial</option>
                      <option>Energia Solar</option>
                      <option>Manutenção</option>
                      <option>Ar Condicionado</option>
                      <option>Emergência</option>
                      <option>Outro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Mensagem *</label>
                  <textarea value={form.mensagem} onChange={e => setForm(p => ({ ...p, mensagem: e.target.value }))} required rows={5} placeholder="Descreva sua necessidade ou dúvida..." className="input-light resize-none" />
                </div>
                <button type="submit" disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-lg text-white font-semibold transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(90deg, #1a56db, #d4a017)' }}>
                  {status === 'loading' ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
                  ) : (
                    <><Send size={16} /> Enviar Mensagem</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="card-light p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                Horário de Atendimento
              </h4>
              <div className="space-y-2 text-sm">
                {[
                  ['Segunda a Sexta', '8:00 - 18:00'],
                  ['Sábado', '8:00 - 12:00'],
                  ['Domingo', 'Fechado'],
                ].map(([dia, hora]) => (
                  <div key={dia} className="flex justify-between text-gray-600">
                    <span>{dia}</span>
                    <span className="font-medium">{hora}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-red-500 font-medium">Emergências</span>
                  <span className="text-red-500 font-bold">24 Horas</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #1a56db, #d4a017)' }}>
              <h4 className="font-bold mb-4">Contato Rápido</h4>
              <div className="space-y-3">
                <a href="tel:+5511947641802" className="flex items-center gap-2 text-white/90 hover:text-white text-sm">
                  <Phone size={14} /> (11) 94764-1802
                </a>
                <a href="mailto:eletrolink220@gmail.com" className="flex items-center gap-2 text-white/90 hover:text-white text-sm">
                  <Mail size={14} /> eletrolink220@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

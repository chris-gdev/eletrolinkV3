import { useState } from 'react'
import { Send, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const tiposServico = [
  'Instalação Residencial',
  'Instalação Comercial',
  'Energia Solar',
  'Manutenção',
  'Ar Condicionado',
  'Emergência',
  'Outro',
]

export default function OrcamentoSection() {
  const [form, setForm] = useState({
    nome: '', telefone: '', email: '',
    tipo_servico: '', urgencia: 'normal' as 'normal' | 'urgente' | 'emergencia',
    descricao: '', endereco: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const { error } = await supabase.from('orcamentos').insert([{ ...form, status: 'pendente' }])
      if (error) throw error
      setStatus('success')
      setForm({ nome: '', telefone: '', email: '', tipo_servico: '', urgencia: 'normal', descricao: '', endereco: '' })
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 5000)
  }

  return (
    <section id="orcamento">
      {/* CTA banner */}
      <div className="py-16 text-center" style={{ background: 'linear-gradient(135deg, #1a56db 0%, #1e3a8a 50%, #92680a 80%, #d4a017 100%)' }}>
        <h2 className="font-bold text-3xl md:text-4xl text-white mb-3">
          Pronto para transformar seu projeto elétrico?
        </h2>
        <p className="text-blue-100 max-w-xl mx-auto mb-8">
          Entre em contato conosco e receba um orçamento personalizado para suas necessidades
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#orcamento-form" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-gray-50 font-semibold px-8 py-3 rounded-lg transition-all">
            Solicitar Orçamento Gratuito
            <ArrowRight size={16} />
          </a>
          <a href="#contato" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-lg transition-all">
            Falar Conosco
          </a>
        </div>
      </div>

      {/* Form */}
      <div id="orcamento-form" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title mb-3">Solicite seu Orçamento</h2>
            <p className="text-gray-500">100% gratuito · Sem compromisso · Resposta em até 2 horas</p>
          </div>

          <div className="card-light p-8">
            {status === 'success' ? (
              <div className="text-center py-12">
                <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
                <h3 className="font-bold text-2xl text-gray-900 mb-2">Solicitação Enviada!</h3>
                <p className="text-gray-500">Entraremos em contato em breve. Obrigado!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Nome *</label>
                    <input name="nome" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} required placeholder="Seu nome completo" className="input-light" />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Telefone *</label>
                    <input name="telefone" value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))} required placeholder="(11) 99999-9999" className="input-light" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="seu@email.com" className="input-light" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Tipo de Serviço *</label>
                    <select name="tipo_servico" value={form.tipo_servico} onChange={e => setForm(p => ({ ...p, tipo_servico: e.target.value }))} required className="input-light">
                      <option value="">Selecione...</option>
                      {tiposServico.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Urgência</label>
                    <select value={form.urgencia} onChange={e => setForm(p => ({ ...p, urgencia: e.target.value as any }))} className="input-light">
                      <option value="normal">Normal</option>
                      <option value="urgente">Urgente</option>
                      <option value="emergencia">Emergência</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Endereço</label>
                  <input value={form.endereco} onChange={e => setForm(p => ({ ...p, endereco: e.target.value }))} placeholder="Rua, número - Bairro - Cidade" className="input-light" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Descrição *</label>
                  <textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} required rows={4} placeholder="Descreva o que precisa ser feito..." className="input-light resize-none" />
                </div>
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                    <AlertCircle size={14} />
                    Erro ao enviar. Tente novamente ou nos ligue diretamente.
                  </div>
                )}
                <button type="submit" disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-lg text-white font-semibold transition-all disabled:opacity-60 hover:shadow-lg hover:scale-[1.01]"
                  style={{ background: 'linear-gradient(90deg, #1a56db, #d4a017)' }}>
                  {status === 'loading' ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
                  ) : (
                    <><Send size={16} /> Solicitar Orçamento Gratuito</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { Phone, Mail, Clock, Send, CheckCircle, MessageCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useConfig } from '../../hooks/useConfig'

type FormData = { nome: string; email: string; telefone: string; assunto: string; mensagem: string }
type Errors = Partial<Record<keyof FormData, string>>

const empty: FormData = { nome: '', email: '', telefone: '', assunto: '', mensagem: '' }

function validate(form: FormData): Errors {
  const e: Errors = {}
  if (!form.nome.trim()) e.nome = 'Informe seu nome completo.'
  if (!form.email.trim()) e.email = 'Informe seu e-mail.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido.'
  if (!form.telefone.trim()) e.telefone = 'Informe um telefone para contato.'
  else if (form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido.'
  if (!form.assunto) e.assunto = 'Selecione um assunto.'
  if (!form.mensagem.trim()) e.mensagem = 'Escreva sua mensagem.'
  else if (form.mensagem.trim().length < 10) e.mensagem = 'Mensagem muito curta.'
  return e
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{msg}</p>
}

export default function ContatoSection() {
  const config = useConfig()
  const [form, setForm] = useState<FormData>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function set<K extends keyof FormData>(key: K, value: string) {
    setForm(p => ({ ...p, [key]: value }))
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setStatus('loading')
    try {
      const { error } = await supabase.from('contatos').insert([{ ...form, lida: false }])
      if (error) throw error

      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      setStatus('success')
      setForm(empty)
      setErrors({})
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
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
            { icon: Phone, titulo: 'Telefone', valor: config.telefone, sub: 'Atendimento 24 horas', href: `tel:${config.telefone.replace(/\D/g, '')}` },
            { icon: Mail, titulo: 'Email', valor: config.email, sub: 'Resposta em até 24 horas', href: `mailto:${config.email}?subject=Contato via site&body=Olá, gostaria de entrar em contato.` },
            { icon: Clock, titulo: 'Horário', valor: config.horario, sub: 'Emergências: 24h', href: undefined },
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
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Nome Completo *</label>
                    <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Seu nome completo"
                      className={`input-light ${errors.nome ? 'border-red-400' : ''}`} />
                    <FieldError msg={errors.nome} />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com"
                      className={`input-light ${errors.email ? 'border-red-400' : ''}`} />
                    <FieldError msg={errors.email} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Telefone *</label>
                    <input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 99999-9999"
                      className={`input-light ${errors.telefone ? 'border-red-400' : ''}`} />
                    <FieldError msg={errors.telefone} />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Assunto *</label>
                    <select value={form.assunto} onChange={e => set('assunto', e.target.value)}
                      className={`input-light ${errors.assunto ? 'border-red-400' : ''}`}>
                      <option value="">Selecione...</option>
                      <option>Instalação Residencial</option>
                      <option>Instalação Comercial</option>
                      <option>Energia Solar</option>
                      <option>Manutenção</option>
                      <option>Ar Condicionado</option>
                      <option>Emergência</option>
                      <option>Outro</option>
                    </select>
                    <FieldError msg={errors.assunto} />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Mensagem *</label>
                  <textarea value={form.mensagem} onChange={e => set('mensagem', e.target.value)} rows={5}
                    placeholder="Descreva sua necessidade ou dúvida..."
                    className={`input-light resize-none ${errors.mensagem ? 'border-red-400' : ''}`} />
                  <FieldError msg={errors.mensagem} />
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                    <AlertCircle size={14} />
                    Erro ao enviar. Tente novamente ou nos ligue diretamente.
                  </div>
                )}

                <button type="submit" disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-lg text-white font-semibold transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(90deg, #1a56db, #d4a017)' }}>
                  {status === 'loading'
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
                    : <><Send size={16} /> Enviar Mensagem</>
                  }
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
                {[['Segunda a Sexta', '8:00 - 18:00'], ['Sábado', '8:00 - 12:00'], ['Domingo', 'Fechado']].map(([dia, hora]) => (
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
                <a href={`tel:${config.telefone.replace(/\D/g, '')}`} className="flex items-center gap-2 text-white/90 hover:text-white text-sm">
                  <Phone size={14} /> {config.telefone}
                </a>
                <a href={`mailto:${config.email}`} className="flex items-center gap-2 text-white/90 hover:text-white text-sm">
                  <Mail size={14} /> {config.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

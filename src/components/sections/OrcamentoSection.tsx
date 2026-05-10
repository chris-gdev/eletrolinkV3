import { useState } from 'react'
import { Send, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const tiposServico = [
  'Instalação Residencial', 'Instalação Comercial', 'Energia Solar',
  'Manutenção', 'Ar Condicionado', 'Emergência', 'Outro',
]

type FormData = {
  nome: string
  telefone: string
  email: string
  tipo_servico: string
  urgencia: 'normal' | 'urgente' | 'emergencia'
  descricao: string
  endereco: string
}

type Errors = Partial<Record<keyof FormData, string>>

const empty: FormData = { nome: '', telefone: '', email: '', tipo_servico: '', urgencia: 'normal', descricao: '', endereco: '' }

function validate(form: FormData): Errors {
  const e: Errors = {}
  if (!form.nome.trim()) e.nome = 'Informe seu nome completo.'
  if (!form.telefone.trim()) e.telefone = 'Informe um telefone para contato.'
  else if (form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido.'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido.'
  if (!form.tipo_servico) e.tipo_servico = 'Selecione o tipo de serviço.'
  if (!form.descricao.trim()) e.descricao = 'Descreva o que precisa ser feito.'
  else if (form.descricao.trim().length < 10) e.descricao = 'Descrição muito curta. Dê mais detalhes.'
  return e
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{msg}</p>
}

export default function OrcamentoSection() {
  const [form, setForm] = useState<FormData>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(p => ({ ...p, [key]: value }))
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setStatus('loading')
    try {
      const { error } = await supabase.from('orcamentos').insert([{ ...form, status: 'pendente' }])
      if (error) throw error
      setStatus('success')
      setForm(empty)
      setErrors({})
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
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
            Solicitar Orçamento Gratuito <ArrowRight size={16} />
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
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Nome *</label>
                    <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Seu nome completo"
                      className={`input-light ${errors.nome ? 'border-red-400 focus:border-red-400' : ''}`} />
                    <FieldError msg={errors.nome} />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Telefone *</label>
                    <input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 99999-9999"
                      className={`input-light ${errors.telefone ? 'border-red-400 focus:border-red-400' : ''}`} />
                    <FieldError msg={errors.telefone} />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">E-mail</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com"
                    className={`input-light ${errors.email ? 'border-red-400 focus:border-red-400' : ''}`} />
                  <FieldError msg={errors.email} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Tipo de Serviço *</label>
                    <select value={form.tipo_servico} onChange={e => set('tipo_servico', e.target.value)}
                      className={`input-light ${errors.tipo_servico ? 'border-red-400 focus:border-red-400' : ''}`}>
                      <option value="">Selecione...</option>
                      {tiposServico.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <FieldError msg={errors.tipo_servico} />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Urgência</label>
                    <select value={form.urgencia} onChange={e => set('urgencia', e.target.value as FormData['urgencia'])} className="input-light">
                      <option value="normal">Normal</option>
                      <option value="urgente">Urgente</option>
                      <option value="emergencia">Emergência</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Endereço</label>
                  <input value={form.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Rua, número - Bairro - Cidade" className="input-light" />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Descrição *</label>
                  <textarea value={form.descricao} onChange={e => set('descricao', e.target.value)} rows={4}
                    placeholder="Descreva o que precisa ser feito..."
                    className={`input-light resize-none ${errors.descricao ? 'border-red-400 focus:border-red-400' : ''}`} />
                  <FieldError msg={errors.descricao} />
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
                  {status === 'loading'
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
                    : <><Send size={16} /> Solicitar Orçamento Gratuito</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'
import { Save, ExternalLink, Database, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Config } from '../../hooks/useConfig'

const defaultForm: Config = {
  nome_empresa: '',
  telefone: '',
  whatsapp: '',
  email: '',
  endereco: '',
  horario: '',
  instagram: '',
  facebook: '',
}

export default function AdminConfiguracoes() {
  const [form, setForm] = useState<Config>(defaultForm)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    supabase.from('configuracoes').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setForm(data)
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    setSalvando(true)
    const { error } = await supabase.from('configuracoes').update(form).eq('id', 1)
    if (error) {
      toast.error('Erro ao salvar configurações.')
    } else {
      toast.success('Configurações salvas com sucesso.')
    }
    setSalvando(false)
  }

  function field(label: string, key: keyof Config, type = 'text', placeholder = '') {
    return (
      <div key={key}>
        <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">{label}</label>
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="input-dark"
        />
      </div>
    )
  }

  if (loading) return <div className="p-8 text-center text-gray-500 font-body">Carregando...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white uppercase tracking-wider">Configurações</h1>
        <p className="text-gray-500 font-body text-sm mt-1">Gerenciar informações da empresa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações da empresa */}
        <div className="card-dark p-6">
          <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-5 pb-3 border-b border-dark-500">
            Informações da Empresa
          </h2>
          <div className="space-y-4">
            {field('Nome da Empresa', 'nome_empresa', 'text', 'Eletro Link Manutenções')}
            {field('Telefone Principal', 'telefone', 'tel', '(11) 94764-1802')}
            {field('WhatsApp (só números com DDI)', 'whatsapp', 'tel', '5511947641802')}
            {field('E-mail', 'email', 'email', 'eletrolink220@gmail.com')}
            {field('Endereço / Área de atuação', 'endereco', 'text', 'São Paulo - SP e Grande São Paulo')}
            {field('Horário de Funcionamento', 'horario', 'text', 'Seg-Sex 8h-18h · Sáb 8h-12h')}
          </div>
        </div>

        {/* Redes sociais */}
        <div className="card-dark p-6">
          <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-5 pb-3 border-b border-dark-500">
            Redes Sociais
          </h2>
          <div className="space-y-4">
            {field('Instagram (URL completa)', 'instagram', 'url', 'https://instagram.com/eletrolink')}
            {field('Facebook (URL completa)', 'facebook', 'url', 'https://facebook.com/eletrolink')}
          </div>

          <div className="mt-8">
            <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-5 pb-3 border-b border-dark-500">
              Links Rápidos
            </h2>
            <div className="space-y-3">
              <a href="/" target="_blank" className="flex items-center gap-3 text-gray-300 hover:text-primary-400 transition-colors font-body text-sm">
                <ExternalLink size={15} className="text-primary-500" />
                Ver Site
              </a>
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-primary-400 transition-colors font-body text-sm">
                <Database size={15} className="text-primary-500" />
                Supabase Dashboard
              </a>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-4 pb-3 border-b border-dark-500 flex items-center gap-2">
              <Lock size={14} className="text-primary-500" />
              Segurança
            </h2>
            <p className="text-gray-500 font-body text-sm">
              Para alterar a senha, acesse o{' '}
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                Supabase → Authentication → Users
              </a>{' '}
              e edite o usuário diretamente.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={salvando} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-7 disabled:opacity-60">
          <Save size={14} />
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  )
}

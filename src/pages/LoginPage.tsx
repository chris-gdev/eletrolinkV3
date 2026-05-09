import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { user, signIn, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!loading && user) return <Navigate to="/admin" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError('Credenciais inválidas. Verifique e-mail e senha.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(249,115,22,0.3) 40px,rgba(249,115,22,0.3) 41px),
          repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(249,115,22,0.3) 40px,rgba(249,115,22,0.3) 41px)`,
      }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.06)_0%,transparent_60%)]" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="bg-primary-500 p-2">
              <Zap size={24} className="text-white" fill="white" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-2xl text-white tracking-wider">ELETRO LINK</div>
              <div className="text-primary-500 text-xs font-body tracking-widest uppercase -mt-1">Manutenções</div>
            </div>
          </div>
          <p className="text-gray-500 font-body text-sm mt-2">Painel Administrativo</p>
        </div>

        <div className="card-dark p-8">
          <h1 className="font-display font-bold text-xl text-white uppercase tracking-wider mb-6 text-center">
            Fazer Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@eletrolink.com.br"
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-body text-xs uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-dark pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm font-body bg-red-500/10 border border-red-500/20 p-3">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Entrando...</>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs font-body mt-5">
          <a href="/" className="hover:text-primary-400 transition-colors">← Voltar ao site</a>
        </p>
      </div>
    </div>
  )
}

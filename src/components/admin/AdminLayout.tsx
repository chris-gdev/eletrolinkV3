import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Zap, LayoutDashboard, FileText, MessageSquare, Settings,
  Star, LogOut, Menu, X, ChevronRight, ClipboardList, Wrench
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orcamentos', label: 'Orçamentos', icon: FileText, end: false },
  { to: '/admin/solicitacoes', label: 'Solicitações', icon: ClipboardList, end: false },
  { to: '/admin/mensagens', label: 'Mensagens', icon: MessageSquare, end: false },
  { to: '/admin/servicos', label: 'Serviços', icon: Wrench, end: false },
  { to: '/admin/depoimentos', label: 'Depoimentos', icon: Star, end: false },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings, end: false },
]

export default function AdminLayout() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    document.body.classList.add('admin-body')
    return () => document.body.classList.remove('admin-body')
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const SidebarContent = () => (
    <div className="w-64 bg-dark-800 border-r border-dark-600 flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-dark-600">
        <div className="flex items-center gap-2">
          <div className="bg-primary-500 p-1.5">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <div>
            <div className="font-display font-bold text-base text-white tracking-wider">ELETRO LINK</div>
            <div className="text-primary-500 text-xs font-body tracking-widest uppercase -mt-0.5">Admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-display font-medium text-sm uppercase tracking-wider transition-all duration-150 rounded-lg ${
                isActive
                  ? 'bg-primary-500/15 text-primary-400 border-l-2 border-primary-500'
                  : 'text-gray-400 hover:bg-dark-700 hover:text-white border-l-2 border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={16} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-primary-500 shrink-0" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-dark-600">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary-500/20 border border-primary-500/30 flex items-center justify-center rounded-full shrink-0">
            <span className="text-primary-400 font-display font-bold text-xs">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-body text-xs font-semibold truncate">{user?.email}</div>
            <div className="text-gray-500 text-xs">Administrador</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm font-body w-full px-2 py-1.5 rounded-lg hover:bg-dark-700"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-900 flex overflow-x-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 flex flex-col">
            <SidebarContent />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 z-20 text-white bg-dark-600 p-1.5 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-dark-800 border-b border-dark-600 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white p-1"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-primary-500 p-1">
                <Zap size={14} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-sm text-white tracking-wider">ELETRO LINK</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

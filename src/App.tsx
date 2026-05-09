import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrcamentos from './pages/admin/AdminOrcamentos'
import AdminMensagens from './pages/admin/AdminMensagens'
import AdminServicos from './pages/admin/AdminServicos'
import AdminDepoimentos from './pages/admin/AdminDepoimentos'
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-primary-500 font-display text-xl tracking-wider animate-pulse">
          CARREGANDO...
        </div>
      </div>
    )
  }
  
  if (!user) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orcamentos" element={<AdminOrcamentos />} />
          <Route path="mensagens" element={<AdminMensagens />} />
          <Route path="servicos" element={<AdminServicos />} />
          <Route path="depoimentos" element={<AdminDepoimentos />} />
          <Route path="configuracoes" element={<AdminConfiguracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

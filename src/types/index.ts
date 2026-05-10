export interface OrcamentoRequest {
  id: string
  created_at: string
  nome: string
  telefone: string
  email: string
  tipo_servico: string
  descricao: string
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
  endereco?: string
  urgencia: 'normal' | 'urgente' | 'emergencia'
}

export interface Servico {
  id: string
  titulo: string
  descricao: string
  icone: string
  ativo: boolean
  ordem: number
}

export interface Depoimento {
  id: string
  nome: string
  texto: string
  avaliacao: number
  servico: string
  ativo: boolean
  ordem: number
  created_at: string
}

export interface ContatoMessage {
  id: string
  created_at: string
  nome: string
  email: string
  telefone: string
  mensagem: string
  lida: boolean
}

export type StatusOrcamento = OrcamentoRequest['status']

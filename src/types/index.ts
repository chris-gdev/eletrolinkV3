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

export type StatusOrcamentoFormal =
  | 'rascunho'
  | 'enviado'
  | 'aprovado'
  | 'recusado'
  | 'executado'
  | 'faturado'

export interface ItemOrcamento {
  id: string
  orcamento_id: string
  descricao: string
  quantidade: number
  unidade: string
  valor_unitario: number
  total: number
  ordem: number
}

export interface OrcamentoFormal {
  id: string
  numero: number
  created_at: string
  updated_at: string
  // Cliente
  cliente_nome: string
  cliente_cpf_cnpj: string
  cliente_telefone: string
  cliente_email: string
  cliente_endereco: string
  cliente_cidade: string
  cliente_estado: string
  // Serviço
  tipo_servico: string
  descricao_servico: string
  local_servico: string
  prazo_execucao: string
  // Datas
  data_emissao: string
  data_validade: string
  // Financeiro
  subtotal: number
  desconto: number
  total: number
  condicoes_pagamento: string
  // Status
  status: StatusOrcamentoFormal
  // Textos
  observacoes: string
  notas_internas: string
  // Join
  itens?: ItemOrcamento[]
}

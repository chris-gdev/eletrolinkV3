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

export type TipoLaudo =
  | 'manutencao'
  | 'projeto'
  | 'vistoria'
  | 'conformidade'
  | 'instalacoes'

export type StatusLaudo = 'rascunho' | 'emitido' | 'entregue' | 'arquivado'

export type ConformidadeLaudo = 'conforme' | 'nao_conforme' | 'com_ressalvas'

export type ResultadoItemLaudo = 'conforme' | 'nao_conforme' | 'nao_aplicavel'

export interface LaudoItem {
  id: string
  laudo_id: string
  descricao: string
  resultado: ResultadoItemLaudo
  observacao: string
  ordem: number
}

export interface Laudo {
  id: string
  numero: number
  created_at: string
  updated_at: string
  // Tipo e status
  tipo: TipoLaudo
  status: StatusLaudo
  // Cliente
  cliente_nome: string
  cliente_cpf_cnpj: string
  cliente_telefone: string
  cliente_email: string
  cliente_endereco: string
  cliente_cidade: string
  cliente_estado: string
  // Local e datas
  local_inspecao: string
  data_inspecao: string
  data_emissao: string
  data_validade: string
  // Responsável técnico
  responsavel_tecnico: string
  crea_numero: string
  art_numero: string
  // Conteúdo técnico
  objetivo: string
  metodologia: string
  descricao_instalacao: string
  condicoes_encontradas: string
  nao_conformidades: string
  recomendacoes: string
  conclusao: string
  // Resultado
  conformidade: ConformidadeLaudo
  // Extras
  normas_aplicadas: string
  observacoes: string
  notas_internas: string
  // Join
  itens?: LaudoItem[]
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

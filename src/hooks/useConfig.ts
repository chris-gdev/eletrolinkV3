import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type Config = {
  nome_empresa: string
  telefone: string
  whatsapp: string
  email: string
  endereco: string
  horario: string
  instagram: string
  facebook: string
}

const defaultConfig: Config = {
  nome_empresa: 'Eletro Link Manutenções',
  telefone: '(11) 94764-1802',
  whatsapp: '5511947641802',
  email: 'eletrolink220@gmail.com',
  endereco: 'São Paulo - SP e Grande São Paulo',
  horario: 'Seg-Sex 8h-18h · Sáb 8h-12h',
  instagram: '',
  facebook: '',
}

export function useConfig() {
  const [config, setConfig] = useState<Config>(defaultConfig)

  useEffect(() => {
    supabase.from('configuracoes').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setConfig(data)
    })
  }, [])

  return config
}

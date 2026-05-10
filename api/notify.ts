import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const phone = process.env.CALLMEBOT_PHONE
  const apikey = process.env.CALLMEBOT_APIKEY

  if (!phone || !apikey) return res.status(500).json({ error: 'WhatsApp not configured' })

  const { tipo, ...data } = req.body

  let text = ''

  if (tipo === 'orcamento') {
    const isEmergencia = data.urgencia === 'emergencia'

    if (isEmergencia) {
      const alerta = `🚨🚨🚨 *EMERGÊNCIA ELÉTRICA* 🚨🚨🚨\n\nATENDIMENTO IMEDIATO NECESSÁRIO!\n\n👤 *${data.nome}*\n📱 *${data.telefone}*`
      const callUrl = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(alerta)}&apikey=${apikey}`
      await fetch(callUrl)
      await new Promise(r => setTimeout(r, 2000))
    }

    text = [
      isEmergencia
        ? `🚨 *EMERGÊNCIA — ORÇAMENTO URGENTE*`
        : `📋 *Novo orçamento solicitado!*`,
      ``,
      `👤 *Nome:* ${data.nome}`,
      `📱 *Telefone:* ${data.telefone}`,
      data.email ? `📧 *Email:* ${data.email}` : null,
      `🔧 *Serviço:* ${data.tipo_servico}`,
      `⚡ *Urgência:* ${isEmergencia ? '🔴 EMERGÊNCIA' : data.urgencia}`,
      data.endereco ? `📍 *Endereço:* ${data.endereco}` : null,
      ``,
      `💬 *Descrição:*`,
      data.descricao,
    ].filter(Boolean).join('\n')
  } else {
    text = [
      `🔔 *Nova mensagem pelo site!*`,
      ``,
      `👤 *Nome:* ${data.nome}`,
      `📧 *Email:* ${data.email}`,
      `📱 *Telefone:* ${data.telefone}`,
      `📋 *Assunto:* ${data.assunto}`,
      ``,
      `💬 *Mensagem:*`,
      data.mensagem,
    ].join('\n')
  }

  try {
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${apikey}`)
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Failed to send WhatsApp notification' })
  }
}

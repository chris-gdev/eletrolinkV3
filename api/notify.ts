import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { nome, email, telefone, assunto, mensagem } = req.body

  const phone = process.env.CALLMEBOT_PHONE
  const apikey = process.env.CALLMEBOT_APIKEY

  if (!phone || !apikey) return res.status(500).json({ error: 'WhatsApp not configured' })

  const text = [
    `🔔 *Nova mensagem pelo site!*`,
    ``,
    `👤 *Nome:* ${nome}`,
    `📧 *Email:* ${email}`,
    `📱 *Telefone:* ${telefone}`,
    `📋 *Assunto:* ${assunto}`,
    ``,
    `💬 *Mensagem:*`,
    mensagem,
  ].join('\n')

  try {
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${apikey}`)
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Failed to send WhatsApp notification' })
  }
}

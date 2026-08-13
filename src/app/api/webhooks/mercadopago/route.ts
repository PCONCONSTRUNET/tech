import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Mercado Pago envia notificações de payment e merchant_order
    const { type, data } = body
    
    console.log('[Webhook Mercado Pago]', type, data)

    // Aqui você pode adicionar lógica para:
    // - Marcar uma venda como paga
    // - Atualizar o status de uma OS
    // - Registrar uma transação financeira automaticamente

    // Exemplo: se for um pagamento aprovado
    if (type === 'payment' && data?.id) {
      // Futura integração: buscar detalhes do pagamento e atualizar o status
      console.log('[MP Webhook] Payment ID:', data.id)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[MP Webhook Error]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Mercado Pago também envia GET para validar a URL
export async function GET() {
  return NextResponse.json({ status: 'Webhook ativo', gateway: 'mercadopago' }, { status: 200 })
}

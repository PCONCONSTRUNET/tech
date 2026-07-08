'use server'

import prisma from '@/lib/prisma'

export async function processCheckout(data: {
  customerName: string
  customerPhone: string
  items: { id: string; name: string; quantity: number; price: number }[]
  totalAmount: number
}) {
  try {
    const { customerName, customerPhone, items, totalAmount } = data

    if (!customerName || !customerPhone || items.length === 0) {
      return { error: 'Dados incompletos para finalizar o pedido.' }
    }

    // Buscar configurações da loja para pegar o WhatsApp de destino
    const settings = await prisma.settings.findFirst()
    const storeWhatsapp = settings?.whatsapp || ''

    // Procurar ou criar cliente pelo telefone
    let customer = await prisma.customer.findFirst({
      where: { whatsapp: customerPhone }
    })

    if (!customer) {
      // Tentar por phone (fallback)
      customer = await prisma.customer.findFirst({
        where: { phone: customerPhone }
      })
    }

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          whatsapp: customerPhone,
          phone: customerPhone
        }
      })
    } else if (customer.name !== customerName) {
      // Atualizar nome se for diferente
      await prisma.customer.update({
        where: { id: customer.id },
        data: { name: customerName }
      })
    }

    // Criar Orçamento (Quote) pendente
    const quote = await prisma.quote.create({
      data: {
        customerId: customer.id,
        totalAmount: totalAmount,
        discount: 0,
        status: 'PENDENTE',
        notes: 'Pedido gerado via Vitrine Online',
        items: {
          create: items.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })

    return { 
      success: true, 
      quoteId: quote.id,
      storeWhatsapp
    }
  } catch (error) {
    console.error('Checkout error:', error)
    return { error: 'Erro ao processar pedido. Tente novamente.' }
  }
}

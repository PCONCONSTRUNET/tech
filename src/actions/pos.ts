'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSale(cartItems: any[], paymentMethod: string, total: number) {
  if (cartItems.length === 0) return { error: 'Carrinho vazio' }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create the sale
      const sale = await tx.sale.create({
        data: {
          total,
          paymentMethod,
          items: {
            create: cartItems.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              unitPrice: item.salePrice,
              totalPrice: item.quantity * item.salePrice
            }))
          }
        }
      })

      // 2. Decrement stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } }
        })
      }

      // 3. Create a financial transaction
      await tx.transaction.create({
        data: {
          type: 'INCOME',
          amount: total,
          description: `Venda #${sale.id.slice(-6).toUpperCase()}`,
          status: 'PAID'
        }
      })
    })

    revalidatePath('/pos')
    revalidatePath('/products')
    revalidatePath('/finance')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao finalizar venda' }
  }
}

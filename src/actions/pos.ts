'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSale(cartItems: any[], paymentMethod: string, total: number) {
  if (cartItems.length === 0) return { error: 'Carrinho vazio' }

  try {
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Create the sale
      const createdSale = await tx.sale.create({
        data: {
          totalAmount: total,
          paymentMethod,
          items: {
            create: cartItems.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.salePrice
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
          type: 'RECEITA',
          amount: total,
          description: `Venda #${createdSale.id.slice(-6).toUpperCase()}`,
          status: 'PAGO'
        }
      })
      
      return createdSale;
    })

    revalidatePath('/pos')
    revalidatePath('/products')
    revalidatePath('/finance')
    return { success: true, saleId: sale.id }
  } catch (error) {
    return { error: 'Erro ao finalizar venda' }
  }
}

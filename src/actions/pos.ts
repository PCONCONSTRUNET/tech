'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth, getDbUser } from '@/lib/auth-check'

export async function createSale(cartItems: any[], paymentMethod: string, total: number) {
  let userId = undefined;
  try {
    const dbUser = await getDbUser()
    if (dbUser) userId = dbUser.id
  } catch (e) {}

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

      // 2. Decrement stock and register movement
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } }
        })

        await tx.stockMovement.create({
          data: {
            productId: item.id,
            quantity: item.quantity,
            type: 'SAIDA',
            origin: 'VENDA',
            userId: userId,
            notes: `Venda #${createdSale.id.slice(-6).toUpperCase()}`
          }
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

    revalidatePath('/painel', 'layout')
    revalidatePath('/painel', 'layout')
    revalidatePath('/painel', 'layout')
    return { success: true, saleId: sale.id }
  } catch (error) {
    return { error: 'Erro ao finalizar venda' }
  }
}

'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth, getDbUser } from '@/lib/auth-check'

export async function getSales() {
  return prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      items: {
        include: { product: true }
      }
    }
  })
}

export async function updateSaleStatus(id: string, status: string) {
  try {
    await prisma.sale.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/painel', 'layout')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erro ao atualizar status do pedido' }
  }
}

export async function deleteSale(id: string) {
  let userId: string | undefined
  try {
    await requireAuth()
    const dbUser = await getDbUser()
    if (dbUser) userId = dbUser.id
  } catch (e: any) {
    return { success: false, error: e?.message || 'Não autorizado' }
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!sale) {
      return { success: false, error: 'Venda não encontrada' }
    }

    const saleCode = sale.id.slice(-6).toUpperCase()

    await prisma.$transaction(async (tx) => {
      if (sale.origin === 'PDV' && sale.status !== 'CANCELADO') {
        for (const item of sale.items) {
          if (!item.productId) continue
          const productExists = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true }
          })
          if (productExists) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } }
            })
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                quantity: item.quantity,
                type: 'ENTRADA',
                origin: 'AJUSTE_MANUAL',
                userId,
                notes: `Estorno - Exclusão Venda #${saleCode}`
              }
            })
          }
        }

        await tx.transaction.deleteMany({
          where: {
            type: 'RECEITA',
            description: `Venda #${saleCode}`,
            amount: sale.totalAmount
          }
        })
      }

      await tx.commission.deleteMany({ where: { saleId: id } })
      await tx.sale.delete({ where: { id } })
    })

    revalidatePath('/painel', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir venda:', error)
    return { success: false, error: 'Erro ao excluir venda' }
  }
}

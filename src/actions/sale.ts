'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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
    revalidatePath('/sales')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erro ao atualizar status do pedido' }
  }
}

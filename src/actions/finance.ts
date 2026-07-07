'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTransactions() {
  return prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createTransaction(formData: FormData) {
  const type = formData.get('type') as 'INCOME' | 'EXPENSE'
  const amount = parseFloat(formData.get('amount') as string || '0')
  const description = formData.get('description') as string

  if (!description || amount <= 0) return { error: 'Dados inválidos' }

  try {
    await prisma.transaction.create({
      data: {
        type,
        amount,
        description,
        status: 'PAID'
      }
    })
    revalidatePath('/finance')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao registrar transação' }
  }
}

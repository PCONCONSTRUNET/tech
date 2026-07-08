'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTransactions() {
  return prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    include: { category: true, customer: true }
  })
}

export async function getTransactionCategories() {
  return prisma.transactionCategory.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function createTransaction(formData: FormData) {
  const type = formData.get('type') as 'RECEITA' | 'DESPESA'
  const amount = parseFloat(formData.get('amount') as string || '0')
  const description = formData.get('description') as string
  const categoryId = formData.get('categoryId') as string | null
  const paymentMethod = formData.get('paymentMethod') as string | null
  const notes = formData.get('notes') as string | null
  const customerId = formData.get('customerId') as string | null
  const finalCustomerId = customerId === '' ? null : customerId;

  const categoryName = formData.get('category') as string | null

  if (!description || amount <= 0) {
    return { error: 'Preencha os dados corretamente.' }
  }

  try {
    let finalCategoryId = null;
    if (categoryName) {
      let category = await prisma.transactionCategory.findFirst({
        where: { name: categoryName, type }
      })
      if (!category) {
        category = await prisma.transactionCategory.create({
          data: { name: categoryName, type }
        })
      }
      finalCategoryId = category.id;
    }

    await prisma.transaction.create({
      data: {
        type,
        amount,
        description,
        status: 'PAGO',
        categoryId: finalCategoryId,
        paymentMethod,
        notes,
        customerId: finalCustomerId
      }
    })
    revalidatePath('/finance')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao registrar transação' }
  }
}

export async function deleteTransaction(id: string) {
  try {
    await prisma.transaction.delete({ where: { id } })
    revalidatePath('/finance')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao excluir transação' }
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  const type = formData.get('type') as 'RECEITA' | 'DESPESA'
  const amount = parseFloat(formData.get('amount') as string || '0')
  const description = formData.get('description') as string
  const categoryId = formData.get('categoryId') as string | null
  const paymentMethod = formData.get('paymentMethod') as string | null
  const notes = formData.get('notes') as string | null
  const customerId = formData.get('customerId') as string | null
  const finalCustomerId = customerId === '' ? null : customerId;

  const categoryName = formData.get('category') as string | null

  if (!description || amount <= 0) {
    return { error: 'Preencha os dados corretamente.' }
  }

  try {
    let finalCategoryId = null;
    if (categoryName) {
      let category = await prisma.transactionCategory.findFirst({
        where: { name: categoryName, type }
      })
      if (!category) {
        category = await prisma.transactionCategory.create({
          data: { name: categoryName, type }
        })
      }
      finalCategoryId = category.id;
    }

    await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount,
        description,
        categoryId: finalCategoryId,
        paymentMethod,
        notes,
        customerId: finalCustomerId
      }
    })
    revalidatePath('/finance')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao atualizar transação' }
  }
}

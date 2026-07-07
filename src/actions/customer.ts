'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createCustomer(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const document = formData.get('document') as string
  const address = formData.get('address') as string

  if (!name) return { error: 'Nome é obrigatório' }

  try {
    await prisma.customer.create({
      data: { name, phone, document, address }
    })
    revalidatePath('/customers')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao criar cliente' }
  }
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } })
    revalidatePath('/customers')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao excluir cliente' }
  }
}

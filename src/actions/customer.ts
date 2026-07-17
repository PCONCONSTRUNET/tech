'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createCustomer(data: {
  name: string
  document?: string
  phone?: string
  whatsapp?: string
  email?: string
  birthDate?: string
  cep?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  devices?: string
  notes?: string
}) {
  if (!data.name) return { error: 'Nome é obrigatório' }
  try {
    const customer = await prisma.customer.create({ data })
    revalidatePath('/painel/customers')
    return { success: true, customer }
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao criar cliente' }
  }
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } })
    revalidatePath('/painel/customers')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao excluir cliente' }
  }
}

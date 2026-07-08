'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSuppliers() {
  return await prisma.supplier.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function createSupplier(formData: FormData) {
  const name = formData.get('name') as string
  const document = formData.get('document') as string
  const phone = formData.get('phone') as string
  const cep = formData.get('cep') as string
  const street = formData.get('street') as string
  const number = formData.get('number') as string
  const neighborhood = formData.get('neighborhood') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string

  if (!name) return { error: 'Nome é obrigatório' }

  try {
    await prisma.supplier.create({
      data: {
        name,
        document,
        phone,
        cep,
        street,
        number,
        neighborhood,
        city,
        state
      }
    })
    revalidatePath('/suppliers')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao criar fornecedor' }
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({
      where: { id }
    })
    revalidatePath('/suppliers')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao excluir fornecedor (pode estar vinculado a produtos)' }
  }
}

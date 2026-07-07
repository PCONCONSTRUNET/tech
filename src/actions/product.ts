'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const sku = formData.get('sku') as string
  const salePrice = parseFloat(formData.get('salePrice') as string || '0')
  const costPrice = parseFloat(formData.get('costPrice') as string || '0')
  const stock = parseInt(formData.get('stock') as string || '0', 10)

  if (!name) return { error: 'O nome do produto é obrigatório' }

  try {
    await prisma.product.create({
      data: { 
        name, 
        sku, 
        salePrice, 
        costPrice, 
        stock 
      }
    })
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao cadastrar produto' }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao excluir produto' }
  }
}

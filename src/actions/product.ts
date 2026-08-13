'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth, requireRole, getDbUser } from '@/lib/auth-check'

export async function getProducts(type?: string) {
  const whereClause = type ? { type } : {}
  return prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  })
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function createProduct(formData: FormData) {
  let userId = undefined;
  try {
    const dbUser = await getDbUser()
    if (dbUser) userId = dbUser.id
    await requireRole(['ADMIN', 'VENDEDOR'])
  } catch (e: any) {
    return { error: e.message }
  }

  const name = formData.get('name') as string
  const sku = formData.get('sku') as string
  const salePrice = parseFloat(formData.get('salePrice') as string || '0')
  const costPrice = parseFloat(formData.get('costPrice') as string || '0')
  const stock = parseInt(formData.get('stock') as string || '0', 10)
  const ncm = formData.get('ncm') as string || null
  const categoryName = formData.get('category') as string
  const showOnVitrine = formData.get('showOnVitrine') === 'true'
  const type = formData.get('type') as string || 'PRODUCT'
  const photos = formData.get('photos') as string || null
  const description = formData.get('description') as string || null

  if (!name) return { error: 'O nome do produto é obrigatório' }

  try {
    let categoryId = null;
    if (categoryName) {
      let category = await prisma.category.findFirst({
        where: { name: categoryName }
      })
      if (!category) {
        category = await prisma.category.create({
          data: { name: categoryName }
        })
      }
      categoryId = category.id;
    }

    const created = await prisma.product.create({
      data: { 
        name, 
        description,
        sku, 
        salePrice, 
        costPrice, 
        stock,
        ncm,
        categoryId,
        showOnVitrine,
        type,
        photos
      }
    })

    if (stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: created.id,
          quantity: stock,
          type: 'ENTRADA',
          origin: 'COMPRA',
          userId: userId,
          notes: 'Estoque inicial no cadastro'
        }
      })
    }

    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao cadastrar produto' }
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireRole(['ADMIN'])
  } catch (e: any) {
    return { error: e.message }
  }

  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao excluir produto' }
  }
}

export async function toggleVitrineVisibility(id: string, showOnVitrine: boolean) {
  try {
    await prisma.product.update({
      where: { id },
      data: { showOnVitrine }
    })
    revalidatePath('/products')
    revalidatePath('/loja')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao atualizar visibilidade na vitrine' }
  }
}

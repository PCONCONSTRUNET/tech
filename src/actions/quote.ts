'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getQuotes() {
  return prisma.quote.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      items: true
    }
  })
}

export async function getQuote(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })
}

export async function createQuote(data: {
  customerId?: string | null,
  totalAmount: number,
  discount?: number,
  validity?: number,
  notes?: string,
  items: Array<{ productId?: string | null, name: string, quantity: number, price: number }>,
  
  // OS Fields (serialized to notes due to db push constraints)
  device?: string,
  brand?: string,
  model?: string,
  imei?: string,
  defect?: string,
  diagnostic?: string,
  password?: string,
  accessories?: string,
  physicalCondition?: string
}) {
  try {
    const quote = await prisma.quote.create({
      data: {
        customerId: data.customerId || null,
        totalAmount: data.totalAmount,
        discount: data.discount || 0,
        validity: data.validity || 7,
        notes: JSON.stringify({
          originalNotes: data.notes,
          device: data.device,
          brand: data.brand,
          model: data.model,
          imei: data.imei,
          defect: data.defect,
          diagnostic: data.diagnostic,
          password: data.password,
          accessories: data.accessories,
          physicalCondition: data.physicalCondition
        }),
        items: {
          create: data.items.map(item => ({
            productId: item.productId || null,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })
    revalidatePath('/quotes')
    return { success: true, quote }
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    return { error: 'Erro ao criar orçamento' }
  }
}

export async function updateQuoteStatus(id: string, status: string) {
  try {
    await prisma.quote.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/quotes')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao atualizar status' }
  }
}

export async function deleteQuote(id: string) {
  try {
    await prisma.quote.delete({ where: { id } })
    revalidatePath('/quotes')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao excluir orçamento' }
  }
}

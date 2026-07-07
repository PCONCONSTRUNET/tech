'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getServiceOrders() {
  return prisma.serviceOrder.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createServiceOrder(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const device = formData.get('device') as string
  const brand = formData.get('brand') as string
  const model = formData.get('model') as string
  const imei = formData.get('imei') as string
  const defect = formData.get('defect') as string
  const price = parseFloat(formData.get('price') as string || '0')
  const status = formData.get('status') as string || 'RECEBIDO'

  if (!customerId || !device || !defect) return { error: 'Campos obrigatórios faltando' }

  try {
    await prisma.serviceOrder.create({
      data: { customerId, device, brand, model, imei, defect, price, status }
    })
    revalidatePath('/os')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao criar OS' }
  }
}

export async function updateServiceOrderStatus(id: string, status: string) {
  try {
    await prisma.serviceOrder.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/os')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao atualizar OS' }
  }
}

export async function deleteServiceOrder(id: string) {
  try {
    await prisma.serviceOrder.delete({ where: { id } })
    revalidatePath('/os')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao excluir OS' }
  }
}

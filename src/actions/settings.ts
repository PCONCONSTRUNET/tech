'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
  return await prisma.settings.findFirst()
}

export async function updateSettings(data: {
  storeName: string
  fiscalData: string
  whatsapp: string
  cep: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  warrantyTerm: string
  hours?: string
}) {
  try {
    const existing = await prisma.settings.findFirst()
    
    if (existing) {
      await prisma.settings.update({
        where: { id: existing.id },
        data
      })
    } else {
      await prisma.settings.create({
        data
      })
    }
    
    revalidatePath('/painel', 'layout')
    revalidatePath('/painel', 'layout')
    return { success: true }
  } catch (error: any) {
    console.error('Settings update error:', error)
    return { error: 'Erro ao salvar configurações.' }
  }
}

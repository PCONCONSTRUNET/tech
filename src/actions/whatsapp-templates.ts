'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTemplates() {
  try {
    const templates = await prisma.whatsAppTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { data: templates }
  } catch (error: any) {
    console.error("Error fetching templates", error)
    return { error: 'Erro ao buscar templates' }
  }
}

export async function getTemplateByStatus(status: string) {
  try {
    const template = await prisma.whatsAppTemplate.findUnique({
      where: { status }
    })
    return { data: template }
  } catch (error: any) {
    console.error("Error fetching template", error)
    return { error: 'Erro ao buscar template' }
  }
}

export async function saveTemplate(status: string, message: string, isActive: boolean) {
  try {
    const template = await prisma.whatsAppTemplate.upsert({
      where: { status },
      update: { message, isActive },
      create: { status, message, isActive }
    })
    revalidatePath('/painel', 'layout')
    return { data: template }
  } catch (error: any) {
    console.error("Error saving template", error)
    return { error: 'Erro ao salvar template' }
  }
}

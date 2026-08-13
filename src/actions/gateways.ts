'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getGateways() {
  try {
    const gateways = await prisma.gateway.findMany({
      orderBy: { name: 'asc' }
    })
    return { data: gateways }
  } catch (error) {
    return { error: 'Erro ao buscar gateways.' }
  }
}

export async function upsertGateway(
  name: string,
  data: {
    active?: boolean
    publicKey?: string
    accessToken?: string
    secretKey?: string
    webhookUrl?: string
    sandbox?: boolean
  }
) {
  try {
    const gateway = await prisma.gateway.upsert({
      where: { name },
      update: data,
      create: { name, ...data }
    })
    revalidatePath('/painel/integrations')
    return { data: gateway }
  } catch (error) {
    return { error: 'Erro ao salvar configurações do gateway.' }
  }
}

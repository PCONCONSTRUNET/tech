'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth-check'

export async function getOpenSession() {
  try {
    return await prisma.cashSession.findFirst({
      where: { status: 'ABERTO' },
      include: { movements: { orderBy: { createdAt: 'desc' } } },
    })
  } catch { return null }
}

export async function getClosedSessions() {
  try {
    return await prisma.cashSession.findMany({
      where: { status: 'FECHADO' },
      include: { movements: true },
      orderBy: { closedAt: 'desc' },
    })
  } catch { return [] }
}

export async function openCashSession(operatorName: string, initialAmount: number) {
  try {
    const session = await prisma.cashSession.create({
      data: { operatorName, initialAmount, status: 'ABERTO' },
    })
    revalidatePath('/painel', 'layout')
    return { success: true, session }
  } catch (e) {
    console.error(e)
    return { error: 'Erro ao abrir caixa' }
  }
}

export async function closeCashSession(id: string) {
  try {
    await prisma.cashSession.update({
      where: { id },
      data: { status: 'FECHADO', closedAt: new Date() },
    })
    revalidatePath('/painel', 'layout')
    return { success: true }
  } catch { return { error: 'Erro ao fechar caixa' } }
}

export async function addMovement(sessionId: string, type: string, amount: number, method?: string, description?: string) {
  try {
    await prisma.cashMovement.create({
      data: { sessionId, type, amount, method, description },
    })
    revalidatePath('/painel', 'layout')
    return { success: true }
  } catch { return { error: 'Erro ao registrar movimentação' } }
}

export async function deleteCashMovement(id: string) {
  try {
    await requireAuth()
    await prisma.cashMovement.delete({ where: { id } })
    revalidatePath('/painel', 'layout')
    return { success: true }
  } catch (e: any) {
    return { error: e?.message || 'Erro ao excluir movimentação' }
  }
}

export async function deleteCashSession(id: string) {
  try {
    await requireAuth()
    await prisma.$transaction(async (tx) => {
      await tx.cashMovement.deleteMany({ where: { sessionId: id } })
      await tx.cashSession.delete({ where: { id } })
    })
    revalidatePath('/painel', 'layout')
    return { success: true }
  } catch (e: any) {
    return { error: e?.message || 'Erro ao excluir sessão de caixa' }
  }
}

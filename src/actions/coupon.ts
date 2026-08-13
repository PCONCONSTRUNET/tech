'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

export async function getCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return coupons
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return []
  }
}

export async function createCoupon(data: { code: string; type: string; value: number }) {
  try {
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() }
    })

    if (existing) {
      return { success: false, error: 'Cupom com este código já existe' }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        active: true,
      }
    })
    
    revalidatePath('/painel', 'layout')
    return { success: true, coupon }
  } catch (error) {
    console.error('Error creating coupon:', error)
    return { success: false, error: 'Erro ao criar cupom' }
  }
}

export async function updateCoupon(id: string, data: { active?: boolean }) {
  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data
    })
    
    revalidatePath('/painel', 'layout')
    return { success: true, coupon }
  } catch (error) {
    console.error('Error updating coupon:', error)
    return { success: false, error: 'Erro ao atualizar cupom' }
  }
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({
      where: { id }
    })
    
    revalidatePath('/painel', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return { success: false, error: 'Erro ao deletar cupom' }
  }
}

export async function validateCoupon(code: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return { valid: false, error: 'Cupom inválido' }
    }

    if (!coupon.active) {
      return { valid: false, error: 'Cupom expirado ou inativo' }
    }

    return { valid: true, coupon }
  } catch (error) {
    console.error('Error validating coupon:', error)
    return { valid: false, error: 'Erro ao validar cupom' }
  }
}

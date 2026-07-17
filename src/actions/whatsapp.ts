'use server'

import prisma from '@/lib/prisma'

export async function getWhatsAppStatus() {
  const settings = await prisma.settings.findFirst()
  if (!settings?.hours) return { error: 'API não configurada' }
  
  try {
    const apiConfig = JSON.parse(settings.hours)
    if (!apiConfig.serverUrl || !apiConfig.instance || !apiConfig.token) {
      return { error: 'Configuração incompleta' }
    }

    const url = `${apiConfig.serverUrl.replace(/\/$/, '')}/instance/status`
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'token': apiConfig.token
      },
      cache: 'no-store'
    })
    
    const data = await res.json()
    return { data }
  } catch (error: any) {
    console.error("Status fetch error", error)
    return { error: 'Erro ao buscar status' }
  }
}

export async function connectWhatsApp() {
  const settings = await prisma.settings.findFirst()
  if (!settings?.hours) return { error: 'API não configurada' }
  
  try {
    const apiConfig = JSON.parse(settings.hours)
    if (!apiConfig.serverUrl || !apiConfig.instance || !apiConfig.token) {
      return { error: 'Configuração incompleta' }
    }

    const url = `${apiConfig.serverUrl.replace(/\/$/, '')}/instance/connect`
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': apiConfig.token
      },
      cache: 'no-store'
    })
    
    const data = await res.json()
    return { data }
  } catch (error: any) {
    console.error("Connect fetch error", error)
    return { error: 'Erro ao gerar QR Code' }
  }
}

export async function disconnectWhatsApp() {
  const settings = await prisma.settings.findFirst()
  if (!settings?.hours) return { error: 'API não configurada' }
  
  try {
    const apiConfig = JSON.parse(settings.hours)
    if (!apiConfig.serverUrl || !apiConfig.instance || !apiConfig.token) {
      return { error: 'Configuração incompleta' }
    }

    const url = `${apiConfig.serverUrl.replace(/\/$/, '')}/instance/disconnect`
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'token': apiConfig.token
      }
    })
    
    const data = await res.json()
    return { data }
  } catch (error: any) {
    console.error("Disconnect fetch error", error)
    return { error: 'Erro ao desconectar' }
  }
}

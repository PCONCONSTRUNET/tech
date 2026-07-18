'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getServiceOrders() {
  return prisma.serviceOrder.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getServiceOrder(id: string) {
  return prisma.serviceOrder.findUnique({
    where: { id },
    include: { customer: true }
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
  
  const password = formData.get('password') as string || ''
  const physicalCondition = formData.get('physicalCondition') as string || ''
  const paymentStatus = formData.get('paymentStatus') as string || 'PENDENTE'

  if (!customerId || !device || !defect) return { error: 'Campos obrigatórios faltando' }

  try {
    const notes = JSON.stringify({ password, physicalCondition, paymentStatus })

    const created = await prisma.serviceOrder.create({
      data: { customerId, device, brand, model, imei, defect, price, status, notes },
      include: { customer: true }
    })

    if (paymentStatus === 'PAGO' && price > 0) {
      await prisma.transaction.create({
        data: {
          type: 'RECEITA',
          amount: price,
          description: `Pagamento de Entrada - OS #${created.id.slice(-6).toUpperCase()}`,
          status: 'PAGO',
          paymentMethod: 'Dinheiro', // default
          customerId
        }
      })
    }

    revalidatePath('/painel/os')
    return { success: true, os: created }
  } catch (error) {
    return { error: 'Erro ao criar OS' }
  }
}

export async function updateServiceOrderStatus(id: string, status: string) {
  try {
    const os = await prisma.serviceOrder.update({
      where: { id },
      data: { status },
      include: { customer: true }
    })
    
    // Trigger WhatsApp notification on status change
    const settings = await prisma.settings.findFirst()
    if (settings?.hours) {
      try {
        const apiConfig = JSON.parse(settings.hours)
        if (apiConfig.serverUrl && apiConfig.token) {
          let phone = os.customer.whatsapp || os.customer.phone
          
          if (phone) {
            phone = phone.replace(/\D/g, '')
            if (phone.length === 10 || phone.length === 11) {
              phone = '55' + phone
            }

            // Buscar template do banco de dados
            const template = await prisma.whatsAppTemplate.findUnique({
              where: { status }
            })

            if (template && template.isActive) {
              // BTZap API endpoint for text messages
              const url = `${apiConfig.serverUrl.replace(/\/$/, '')}/message/sendText/${apiConfig.instance || ''}`
              const urlFallback = `${apiConfig.serverUrl.replace(/\/$/, '')}/send/text`
              
              let message = template.message
              message = message.replace(/{nome}/g, os.customer.name.split(' ')[0])
              message = message.replace(/{aparelho}/g, os.device)
              message = message.replace(/{numero_os}/g, os.id.slice(-6).toUpperCase())
              message = message.replace(/{status}/g, status.replace(/_/g, ' '))
              message = message.replace(/{valor}/g, os.price ? `R$ ${os.price.toFixed(2).replace('.', ',')}` : '')

              // Try BTZap format first
              const sendMsg = async (endpoint: string) => fetch(endpoint, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'token': apiConfig.token
                },
                body: JSON.stringify({
                  number: phone,
                  text: message
                })
              })

              try {
                const res = await sendMsg(urlFallback)
                if (!res.ok) {
                  await sendMsg(url)
                }
              } catch {
                await sendMsg(url).catch(e => console.error("Erro ao enviar WhatsApp:", e))
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse or execute WhatsApp API", e)
      }
    }

    
    revalidatePath('/painel/os')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao atualizar OS' }
  }
}

export async function deleteServiceOrder(id: string) {
  try {
    await prisma.serviceOrder.delete({ where: { id } })
    revalidatePath('/painel/os')
    return { success: true }
  } catch (error) {
    return { error: 'Erro ao excluir OS' }
  }
}

export async function sendOsPdfWhatsApp(osId: string, phone: string) {
  try {
    const settings = await prisma.settings.findFirst()
    if (!settings?.hours) return { error: 'WhatsApp não configurado' }

    const apiConfig = JSON.parse(settings.hours)
    if (!apiConfig.serverUrl || !apiConfig.token) return { error: 'API sem configuração' }

    // Format phone: strip non-digits, add 55 prefix if needed
    let dest = phone.replace(/\D/g, '')
    if (dest.length === 10 || dest.length === 11) dest = '55' + dest

    // Public URL of the OS html-pdf page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const pdfUrl = `${baseUrl}/api/os/${osId}/pdf`
    const osCode = osId.slice(-6).toUpperCase()

    const url = `${apiConfig.serverUrl.replace(/\/$/, '')}/send/media`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': apiConfig.token
      },
      body: JSON.stringify({
        number: dest,
        type: 'document',
        file: pdfUrl,
        filename: `OS-${osCode}.pdf`
      })
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('WhatsApp API error:', text)
      return { error: 'Falha ao enviar pelo WhatsApp' }
    }

    return { success: true }
  } catch (e) {
    console.error('Erro ao enviar PDF via WhatsApp:', e)
    return { error: 'Falha ao enviar documento' }
  }
}

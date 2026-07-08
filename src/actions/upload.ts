'use server'

import fs from 'fs'
import path from 'path'

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    const url = formData.get('url') as string | null;

    // Se recebemos uma URL direta (caso o usuário cole uma URL de imagem)
    if (url && url.startsWith('http')) {
      return { success: true, url };
    }

    if (!file) {
      return { error: 'Nenhum arquivo enviado.' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Garantir que a pasta existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Criar nome de arquivo único
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    const filePath = path.join(uploadDir, fileName)

    // Salvar o arquivo
    fs.writeFileSync(filePath, buffer)

    // Retornar a URL relativa
    return { success: true, url: `/uploads/${fileName}` }
  } catch (error) {
    console.error('Erro no upload:', error)
    return { error: 'Falha ao salvar a imagem no servidor.' }
  }
}

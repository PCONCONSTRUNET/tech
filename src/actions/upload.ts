'use server'

import { createClient } from '@/utils/supabase/server'

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    const url = formData.get('url') as string | null;

    if (url && url.startsWith('http')) {
      return { success: true, url };
    }

    if (!file) {
      return { error: 'Nenhum arquivo enviado.' }
    }

    const supabase = await createClient()

    // Criar nome único para o arquivo
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    // Fazendo upload para o Supabase Storage no bucket "uploads"
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Erro no Supabase Storage:', error.message)
      return { error: 'Falha ao salvar a imagem no servidor de storage. Verifique se o bucket "uploads" existe no Supabase e se é público.' }
    }

    // Gerar URL pública da imagem
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName)

    return { success: true, url: publicUrl }
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return { error: 'Ocorreu um erro ao processar a imagem.' }
  }
}

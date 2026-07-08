'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { uploadImage } from '@/actions/upload'

interface ImageUploaderProps {
  initialPhotos?: string[]
  onChange: (urls: string[]) => void
}

export default function ImageUploader({ initialPhotos = [], onChange }: ImageUploaderProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos)
  const [isUploading, setIsUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar com onChange quando photos mudar
  useEffect(() => {
    onChange(photos)
  }, [photos])

  const handleUploadFiles = async (files: FileList | File[]) => {
    setIsUploading(true)
    const newUrls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      try {
        // Opções de compressão
        const options = {
          maxSizeMB: 0.5, // máx 500kb
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        }
        
        const compressedFile = await imageCompression(file, options)
        
        // Preparar para enviar
        const formData = new FormData()
        formData.append('file', compressedFile, compressedFile.name)
        
        const result = await uploadImage(formData)
        if (result.success && result.url) {
          newUrls.push(result.url)
        }
      } catch (error) {
        console.error('Erro na compressão/upload', error)
      }
    }
    
    if (newUrls.length > 0) {
      setPhotos(prev => [...prev, ...newUrls])
    }
    setIsUploading(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(e.target.files)
    }
  }

  const handleUrlAdd = async () => {
    if (!urlInput) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('url', urlInput)
      const result = await uploadImage(formData)
      if (result.success && result.url) {
        setPhotos(prev => [...prev, result.url])
        setUrlInput('')
        setShowUrlInput(false)
      }
    } catch (e) {
      console.error(e)
    }
    setIsUploading(false)
  }

  const handleRemove = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  // Handle Drag & Drop
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files)
    }
  }

  // Handle Ctrl+V (Paste) globalmente na janela ou no container
  const onPaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    const files: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) files.push(file)
      }
    }
    if (files.length > 0) {
      e.preventDefault()
      handleUploadFiles(files)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('paste', onPaste)
    }
  }, [onPaste])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Grid de Imagens */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {photos.map((url, index) => (
          <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <img src={url} alt={`Foto ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button 
              type="button"
              onClick={() => handleRemove(index)}
              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Botão de Adicionar (Drag & Drop Zone) */}
        <div 
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ width: '100px', height: '100px', borderRadius: '8px', border: '2px dashed var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', gap: '8px', position: 'relative' }}
        >
          {isUploading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              <Upload size={24} />
              <span style={{ fontSize: '0.65rem', textAlign: 'center', padding: '0 4px' }}>Upload, Cole ou Arraste</span>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            multiple 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      {/* Adicionar via URL */}
      {showUrlInput ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="url" 
            placeholder="Cole o link da imagem aqui..." 
            className="input" 
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" className="btn btn-primary" onClick={handleUrlAdd} disabled={isUploading || !urlInput}>
            Adicionar
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setShowUrlInput(false)}>
            Cancelar
          </button>
        </div>
      ) : (
        <button 
          type="button" 
          onClick={() => setShowUrlInput(true)} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', alignSelf: 'flex-start' }}
        >
          <LinkIcon size={16} /> Adicionar via Link / URL
        </button>
      )}

      {/* Campo Oculto para o form submission */}
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />
    </div>
  )
}

'use client'

import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: '60vh',
      width: '100%'
    }}>
      <Loader2 size={48} className="animate-spin" style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text)' }}>Carregando...</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Buscando informações do banco de dados.</p>
    </div>
  )
}

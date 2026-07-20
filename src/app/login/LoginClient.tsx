'use client'

import { useState, useEffect } from 'react'
import { LogIn, Lock, Mail } from 'lucide-react'
import { login } from '@/actions/auth'
import { useRouter } from 'next/navigation'

export default function LoginClient() {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    router.prefetch('/painel')
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await login(formData)
      
      if (result?.error) {
        setErrorMsg(result.error)
        setLoading(false)
      } else if (result?.success) {
        router.push('/painel')
      }
    } catch (e: any) {
      setErrorMsg('Erro cliente: ' + (e?.message || String(e)))
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a', // Slate 900
      backgroundImage: 'radial-gradient(circle at top right, #1e1b4b, transparent 40%), radial-gradient(circle at bottom left, #312e81, transparent 40%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        margin: '20px',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src="/logo.png" alt="Digital Tech Logo" style={{ height: '80px', objectFit: 'contain', marginBottom: '16px' }} />
          <h1 style={{ color: '#f8fafc', fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>Bem-vindo de volta</h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Acesse seu painel administrativo (ERP)</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {errorMsg && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {errorMsg}
            </div>
          )}

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                name="email"
                type="email" 
                required
                placeholder="seu@email.com"
                style={{ 
                  width: '100%', 
                  padding: '14px 14px 14px 44px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                name="password"
                type="password" 
                required
                placeholder="••••••••"
                style={{ 
                  width: '100%', 
                  padding: '14px 14px 14px 44px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '12px',
              width: '100%',
              padding: '14px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4f46e5')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#6366f1')}
          >
            {loading ? 'Entrando...' : (
              <>
                Entrar <LogIn size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

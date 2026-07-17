'use client'

import { useState, useEffect } from 'react'
import { Save, Code2, QrCode, PowerOff, RefreshCw, MessageSquare, X } from 'lucide-react'
import { updateSettings } from '@/actions/settings'
import { saveTemplate } from '@/actions/whatsapp-templates'
import { getWhatsAppStatus, connectWhatsApp, disconnectWhatsApp } from '@/actions/whatsapp'
import { useRouter } from 'next/navigation'

export default function IntegrationsClient({ initialSettings, initialTemplates }: { initialSettings: any, initialTemplates: any[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isFetchingStatus, setIsFetchingStatus] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<{title: string, type: 'success' | 'error'} | null>(null)
  const [currentView, setCurrentView] = useState('whatsapp')
  const [templates, setTemplates] = useState(initialTemplates || [])
  const [activeTab, setActiveTab] = useState('EM_CONSERTO')
  
  // We use the 'hours' field as a hack to store the webhook URL for now.
  const [formData, setFormData] = useState({
    storeName: initialSettings?.storeName || 'Digital Tech',
    fiscalData: initialSettings?.fiscalData || '',
    whatsapp: initialSettings?.whatsapp || '',
    cep: initialSettings?.cep || '',
    neighborhood: initialSettings?.neighborhood || '',
    street: initialSettings?.street || '',
    number: initialSettings?.number || '',
    city: initialSettings?.city || '',
    state: initialSettings?.state || '',
    warrantyTerm: initialSettings?.warrantyTerm || 'Garantia de 90 dias para serviços executados...',
    hours: initialSettings?.hours || ''
  })

  // Parse hours as JSON for API config
  let apiConfig = { serverUrl: '', instance: '', token: '' };
  try {
    if (formData.hours) {
      apiConfig = JSON.parse(formData.hours);
    }
  } catch (e) {
    // legacy string or error
  }

  function handleApiChange(field: string, value: string) {
    const newConfig = { ...apiConfig, [field]: value };
    setFormData(prev => ({ ...prev, hours: JSON.stringify(newConfig) }));
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function showToast(title: string, type: 'success' | 'error') {
    setToastMessage({ title, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  async function handleSave() {
    setIsLoading(true)
    const res = await updateSettings(formData)
    setIsLoading(false)
    if (res.error) {
      showToast(res.error, 'error')
    } else {
      showToast('Configurações salvas com sucesso!', 'success')
      router.refresh()
    }
  }

  // Check status on mount if config exists
  useEffect(() => {
    if (formData.hours && formData.hours !== '{}') {
      checkStatus(true)
    }
  }, [])

  // Poll status while QR code is active
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (status === 'qr_code') {
      interval = setInterval(() => {
        checkStatus(true)
      }, 4000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status])

  async function checkStatus(silent = false) {
    if (!silent) setIsFetchingStatus(true)
    const res = await getWhatsAppStatus()
    if (res.data?.instance?.status) {
      setStatus(res.data.instance.status)
    } else if (res.data?.instance?.state) {
      setStatus(res.data.instance.state)
    } else if (res.data?.status?.connected) {
       setStatus('connected')
    } else if (res.data?.state) {
       setStatus(res.data.state)
    } else {
      setStatus('disconnected')
    }
    
    // Only clear QR code if we are no longer in qr_code status
    if (res.data?.instance?.status === 'connected' || res.data?.status?.connected || res.data?.instance?.state === 'open') {
      setQrCode(null)
    }
    
    if (!silent) setIsFetchingStatus(false)
  }

  async function handleConnect() {
    setIsFetchingStatus(true)
    const res = await connectWhatsApp()
    if (res.data?.base64) {
      setQrCode(res.data.base64)
      setStatus('qr_code')
    } else if (res.data?.qrcode?.base64) {
      setQrCode(res.data.qrcode.base64)
      setStatus('qr_code')
    } else if (res.data?.qrcode) {
      setQrCode(res.data.qrcode)
      setStatus('qr_code')
    } else if (res.data?.instance?.qrcode) {
      setQrCode(res.data.instance.qrcode)
      setStatus('qr_code')
    } else if (res.data?.instance?.status) {
      setStatus(res.data.instance.status)
    } else if (res.data?.instance?.state) {
      setStatus(res.data.instance.state)
    } else {
      console.log("Connect API Response:", res)
      alert('Erro ao carregar QR Code. Resposta da API: ' + JSON.stringify(res))
    }
    setIsFetchingStatus(false)
  }

  async function confirmDisconnect() {
    setIsFetchingStatus(true)
    setShowDisconnectModal(false)
    await disconnectWhatsApp()
    setStatus('disconnected')
    setQrCode(null)
    setIsFetchingStatus(false)
  }

  function handleDisconnect() {
    setShowDisconnectModal(true)
  }

  async function handleSaveTemplate(statusKey: string, message: string, isActive: boolean) {
    const res = await saveTemplate(statusKey, message, isActive)
    if (res.data) {
      setTemplates(templates.map(t => t.status === statusKey ? res.data : t))
      if (!templates.find(t => t.status === statusKey)) {
        setTemplates([...templates, res.data])
      }
      showToast('Template salvo com sucesso!', 'success')
    } else {
      showToast('Erro ao salvar template.', 'error')
    }
  }

  const osStatuses = [
    { value: 'RECEBIDO', label: 'Recebido' },
    { value: 'EM_ANALISE', label: 'Em Análise' },
    { value: 'AGUARDANDO_APROVACAO', label: 'Aguardando Aprovação' },
    { value: 'AGUARDANDO_PECA', label: 'Aguardando Peça' },
    { value: 'EM_CONSERTO', label: 'Em Conserto' },
    { value: 'PRONTO', label: 'Pronto' },
    { value: 'ENTREGUE', label: 'Entregue' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ]

  return (
    <div>
      {currentView === 'whatsapp' && (
      <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Integrações</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Gerencie as integrações de API da sua loja.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: '8px' }} onClick={handleSave} disabled={isLoading}>
          <Save size={18} /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid-responsive-2" style={{ gap: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#25d366' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </span>
            Integração API WhatsApp
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
              Configure aqui os dados de acesso da sua API (BTZAP/Evolution). O sistema utilizará esses dados para enviar notificações automáticas ao cliente (ex: quando a OS entrar "Em Serviço").
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>URL do Servidor</label>
                <input type="text" className="input" placeholder="https://server.btzap.com.br" value={apiConfig.serverUrl} onChange={e => handleApiChange('serverUrl', e.target.value)} />
              </div>
              <div className="grid-responsive-2">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Instância</label>
                  <input type="text" className="input" placeholder="digitech" value={apiConfig.instance} onChange={e => handleApiChange('instance', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Token da Instância (API Key)</label>
                  <input type="text" className="input" placeholder="0efb84ef-5b35-4acc-b16b-612c81fdbe6a" value={apiConfig.token} onChange={e => handleApiChange('token', e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '20px', backgroundColor: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Conexão do WhatsApp
                <button 
                  onClick={() => checkStatus(false)} 
                  disabled={isFetchingStatus}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                  title="Atualizar Status"
                >
                  <RefreshCw size={16} className={isFetchingStatus ? 'spin' : ''} />
                </button>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                {status === 'open' || status === 'connected' ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '16px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                      WhatsApp Conectado
                    </div>
                    <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleDisconnect}>
                      <PowerOff size={18} /> Desconectar Instância
                    </button>
                  </div>
                ) : qrCode ? (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '8px', color: '#64748b' }}>Escaneie o QR Code abaixo com seu WhatsApp:</p>
                    <div style={{ padding: '8px', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid #fef3c7' }}>
                      ⚠️ O QR Code expira em poucos segundos! Se der erro, atualize.
                    </div>
                    <img src={qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`} alt="QR Code" style={{ width: '250px', height: '250px', border: '4px solid white', borderRadius: '8px', backgroundColor: 'white', marginBottom: '16px' }} />
                    <div>
                      <button className="btn" style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={handleConnect} disabled={isFetchingStatus}>
                        <RefreshCw size={16} className={isFetchingStatus ? 'spin' : ''} /> Atualizar QR Code
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '12px', color: '#64748b' }}>Sua instância parece estar desconectada.</p>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }} onClick={handleConnect} disabled={isFetchingStatus}>
                      <QrCode size={18} /> Gerar QR Code de Conexão
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '12px' }}>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={18} color="var(--color-primary)" /> Mensagens Automáticas
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Configure os textos que serão enviados quando a OS mudar de status.</p>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setCurrentView('templates')}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Configurar Mensagens
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      </>
      )}

      {showDisconnectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--color-border)',
            animation: 'modalSlideUp 0.3s ease-out'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <PowerOff size={24} />
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text)' }}>
              Desconectar WhatsApp
            </h3>
            
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
              Tem certeza que deseja desconectar a sua instância? Você precisará ler um novo QR Code caso queira conectar novamente.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowDisconnectModal(false)}
                className="btn" 
                style={{ backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1' }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDisconnect}
                className="btn" 
                style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
              >
                Desconectar
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10000,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          {toastMessage.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
          <span style={{ fontWeight: '500' }}>{toastMessage.title}</span>
        </div>
      )}

      {currentView === 'templates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => setCurrentView('whatsapp')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', backgroundColor: '#f1f5f9' }}>
                <X size={20} color="#64748b" />
              </button>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Mensagens Automáticas</h1>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Configure os templates de mensagens para cada status.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
              {osStatuses.map(status => (
                <button
                  key={status.value}
                  onClick={() => setActiveTab(status.value)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    whiteSpace: 'nowrap', fontWeight: '500', fontSize: '0.9rem',
                    backgroundColor: activeTab === status.value ? 'var(--color-primary)' : '#f1f5f9',
                    color: activeTab === status.value ? 'white' : '#64748b',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {osStatuses.map(status => {
              if (status.value !== activeTab) return null
              
              const template = templates.find((t: any) => t.status === status.value) || {
                status: status.value,
                message: `Olá {nome}! Sua Ordem de Serviço {numero_os} do aparelho {aparelho} mudou para o status: ${status.label}.`,
                isActive: false
              }
              
              return (
                <div key={status.value}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Status: {status.label}</h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.9rem', color: template.isActive ? '#10b981' : '#64748b', fontWeight: '500' }}>
                        {template.isActive ? 'Ativado' : 'Desativado'}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={template.isActive}
                        onChange={(e) => {
                          const updated = { ...template, isActive: e.target.checked }
                          handleSaveTemplate(status.value, updated.message, updated.isActive)
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </label>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: '#64748b' }}>
                      Mensagem
                    </label>
                    <textarea 
                      className="input" 
                      rows={6}
                      value={template.message}
                      onChange={(e) => {
                        const newTemplates = [...templates]
                        const idx = newTemplates.findIndex(t => t.status === status.value)
                        if (idx >= 0) {
                          newTemplates[idx].message = e.target.value
                        } else {
                          newTemplates.push({ ...template, message: e.target.value })
                        }
                        setTemplates(newTemplates as any)
                      }}
                      style={{ fontFamily: 'inherit' }}
                    />
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>Variáveis disponíveis:</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['{nome}', '{aparelho}', '{numero_os}', '{status}', '{valor}'].map(v => (
                        <span key={v} style={{ backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#334155', fontFamily: 'monospace' }}>
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleSaveTemplate(status.value, template.message, template.isActive)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Save size={18} /> Salvar Modelo
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}} />
    </div>
  )
}

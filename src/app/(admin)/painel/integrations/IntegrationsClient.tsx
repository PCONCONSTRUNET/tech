'use client'

import { useState, useEffect } from 'react'
import { Save, Code2, QrCode, RefreshCw, MessageSquare, X, CreditCard, CheckCircle, AlertCircle, ChevronRight, Eye, EyeOff, Zap, Globe, Phone, Key, Smartphone, Activity, Plus, Trash2 } from 'lucide-react'
import { updateSettings } from '@/actions/settings'
import { saveTemplate } from '@/actions/whatsapp-templates'
import { getWhatsAppStatus, connectWhatsApp, disconnectWhatsApp } from '@/actions/whatsapp'
import { upsertGateway } from '@/actions/gateways'
import { useRouter } from 'next/navigation'

const WhatsappIcon = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
)

// ── Gateway definitions (add more gateways here easily)
const GATEWAY_CONFIGS = [
  {
    name: 'MERCADOPAGO',
    label: 'Mercado Pago',
    description: 'Aceite Pix, cartão de crédito, débito e boleto com um dos maiores gateways do Brasil.',
    color: '#009ee3',
    fields: [
      { key: 'publicKey', label: 'Public Key', placeholder: 'APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', type: 'text', hint: 'Encontre em: Mercado Pago → Sua Conta → Credenciais' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'APP_USR-0000000000000000-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password', hint: 'Token de acesso da sua aplicação Mercado Pago' },
    ],
    webhookUrl: 'https://qxpyulhdzrqplykgiovk.supabase.co/functions/v1/mercadopago-webhook',
    docs: 'https://www.mercadopago.com.br/developers/pt/docs'
  },
  {
    name: 'PAGBANK',
    label: 'PagBank',
    description: 'Aceite Pix, cartão de crédito e boleto pelo PagBank (PagSeguro). Gere links de checkout facilmente.',
    color: '#00c950',
    fields: [
      { key: 'accessToken', label: 'Token de Acesso (Bearer Token)', placeholder: 'Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password', hint: 'Encontre em: PagBank → Minha Conta → Preferências → Token de Segurança' },
    ],
    webhookUrl: 'https://qxpyulhdzrqplykgiovk.supabase.co/functions/v1/pagbank-webhook',
    docs: 'https://developer.pagbank.com.br/reference/criar-checkout'
  },
  // Future gateways:
  // { name: 'STRIPE', label: 'Stripe', ... },
  // { name: 'PAGARME', label: 'Pagar.me', ... },
  // { name: 'ASAAS', label: 'Asaas', ... },
]

type MainTab = 'whatsapp' | 'gateways'

export default function IntegrationsClient({ initialSettings, initialTemplates, initialGateways = [] }: { initialSettings: any, initialTemplates: any[], initialGateways?: any[] }) {
  const router = useRouter()
  const [mainTab, setMainTab] = useState<MainTab>('whatsapp')
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isFetchingStatus, setIsFetchingStatus] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<{title: string, type: 'success' | 'error'} | null>(null)
  const [currentView, setCurrentView] = useState('whatsapp')
  const [templates, setTemplates] = useState(initialTemplates || [])
  const [activeTab, setActiveTab] = useState('EM_CONSERTO')

  // Gateway state
  const [gateways, setGateways] = useState<Record<string, any>>(() => {
    const map: Record<string, any> = {}
    initialGateways.forEach((g: any) => { map[g.name] = g })
    return map
  })
  const [showFields, setShowFields] = useState<Record<string, boolean>>({})
  const [gatewayForms, setGatewayForms] = useState<Record<string, any>>(() => {
    const map: Record<string, any> = {}
    GATEWAY_CONFIGS.forEach(cfg => {
      const existing = initialGateways.find((g: any) => g.name === cfg.name)
      map[cfg.name] = {
        active: existing?.active ?? false,
        publicKey: existing?.publicKey ?? '',
        accessToken: existing?.accessToken ?? '',
        secretKey: existing?.secretKey ?? '',
        sandbox: existing?.sandbox ?? false,
      }
    })
    return map
  })
  const [gatewayLoading, setGatewayLoading] = useState<Record<string, boolean>>({})

  // Settings form
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

  let apiConfig = { serverUrl: '', instance: '', token: '' };
  try {
    if (formData.hours) { apiConfig = JSON.parse(formData.hours); }
  } catch (e) {}

  function handleApiChange(field: string, value: string) {
    const newConfig = { ...apiConfig, [field]: value };
    setFormData(prev => ({ ...prev, hours: JSON.stringify(newConfig) }));
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function showToast(title: string, type: 'success' | 'error') {
    setToastMessage({ title, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  async function handleSave() {
    setIsLoading(true)
    const res = await updateSettings(formData)
    setIsLoading(false)
    if (res.error) { showToast(res.error, 'error') } 
    else { showToast('Configurações salvas com sucesso!', 'success'); router.refresh() }
  }

  // Gateway handlers
  function updateGatewayForm(gatewayName: string, field: string, value: any) {
    setGatewayForms(prev => ({ ...prev, [gatewayName]: { ...prev[gatewayName], [field]: value } }))
  }

  async function handleSaveGateway(gatewayName: string) {
    setGatewayLoading(prev => ({ ...prev, [gatewayName]: true }))
    const cfg = GATEWAY_CONFIGS.find(c => c.name === gatewayName)
    
    // Auto-ativar se as credenciais estiverem preenchidas
    const formValues = { ...gatewayForms[gatewayName] }
    const hasCredentials = cfg?.fields.some(f => !!formValues[f.key])
    if (hasCredentials) {
      formValues.active = true
    }
    
    const payload = {
      ...formValues,
      webhookUrl: cfg?.webhookUrl ?? '',
    }
    
    const res = await upsertGateway(gatewayName, payload)
    if ('data' in res && res.data) {
      setGateways(prev => ({ ...prev, [gatewayName]: res.data }))
      setGatewayForms(prev => ({ ...prev, [gatewayName]: { ...prev[gatewayName], active: payload.active } }))
      showToast('Gateway salvo e ativado com sucesso!', 'success')
    } else {
      showToast('Erro ao salvar gateway.', 'error')
    }
    setGatewayLoading(prev => ({ ...prev, [gatewayName]: false }))
  }

  useEffect(() => {
    if (formData.hours && formData.hours !== '{}') { checkStatus(true) }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (status === 'qr_code') {
      interval = setInterval(() => { checkStatus(true) }, 4000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [status])

  async function checkStatus(silent = false) {
    if (!silent) setIsFetchingStatus(true)
    const res = await getWhatsAppStatus()
    if (res.data?.instance?.status) { setStatus(res.data.instance.status) }
    else if (res.data?.instance?.state) { setStatus(res.data.instance.state) }
    else if (res.data?.status?.connected) { setStatus('connected') }
    else if (res.data?.state) { setStatus(res.data.state) }
    else { setStatus('disconnected') }
    if (res.data?.instance?.status === 'connected' || res.data?.status?.connected || res.data?.instance?.state === 'open') { setQrCode(null) }
    if (!silent) setIsFetchingStatus(false)
  }

  async function handleConnect() {
    setIsFetchingStatus(true)
    const res = await connectWhatsApp()
    if (res.data?.base64) { setQrCode(res.data.base64); setStatus('qr_code') }
    else if (res.data?.qrcode?.base64) { setQrCode(res.data.qrcode.base64); setStatus('qr_code') }
    else if (res.data?.qrcode) { setQrCode(res.data.qrcode); setStatus('qr_code') }
    else if (res.data?.instance?.qrcode) { setQrCode(res.data.instance.qrcode); setStatus('qr_code') }
    else if (res.data?.instance?.status) { setStatus(res.data.instance.status) }
    else if (res.data?.instance?.state) { setStatus(res.data.instance.state) }
    else { alert('Erro ao carregar QR Code. Resposta da API: ' + JSON.stringify(res)) }
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

  async function handleSaveTemplate(statusKey: string, message: string, isActive: boolean) {
    const res = await saveTemplate(statusKey, message, isActive)
    if (res.data) {
      setTemplates(templates.map(t => t.status === statusKey ? res.data : t))
      if (!templates.find(t => t.status === statusKey)) { setTemplates([...templates, res.data]) }
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
      {/* ── Main Tab Navigation ── */}
      {currentView !== 'templates' && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Integrações</h1>
              <p style={{ color: 'var(--color-text-muted)' }}>Gerencie as integrações e gateways da sua loja.</p>
            </div>
            {mainTab === 'whatsapp' && (
              <button className="btn btn-primary" style={{ gap: '8px' }} onClick={handleSave} disabled={isLoading}>
                <Save size={18} /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: '0' }}>
            {[
              { key: 'whatsapp' as MainTab, label: 'WhatsApp', icon: <WhatsappIcon size={16} /> },
              { key: 'gateways' as MainTab, label: 'Gateways de Pagamento', icon: <CreditCard size={16} /> },
            ].map(tab => (
              <button key={tab.key} onClick={() => setMainTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 20px', border: 'none', cursor: 'pointer',
                  background: 'none', fontFamily: 'inherit', fontSize: '0.875rem',
                  fontWeight: mainTab === tab.key ? '700' : '500',
                  color: mainTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  borderBottom: mainTab === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── WhatsApp Tab ── */}
      {mainTab === 'whatsapp' && currentView === 'whatsapp' && (
        <div className="grid-responsive-2" style={{ gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#25d366', display: 'flex' }}>
                <WhatsappIcon size={20} color="#25d366" />
              </span>
              Integração API WhatsApp
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                Configure aqui os dados de acesso da sua API (BTZAP/Evolution). O sistema utilizará esses dados para enviar notificações automáticas ao cliente.
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
                    <input type="text" className="input" placeholder="0efb84ef-..." value={apiConfig.token} onChange={e => handleApiChange('token', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', padding: '20px', backgroundColor: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Conexão do WhatsApp
                  <button onClick={() => checkStatus(false)} disabled={isFetchingStatus} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }} title="Atualizar Status">
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
                      <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowDisconnectModal(true)}>
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
                      <button className="btn" style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={handleConnect} disabled={isFetchingStatus}>
                        <RefreshCw size={16} className={isFetchingStatus ? 'spin' : ''} /> Atualizar QR Code
                      </button>
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
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Configure os textos enviados quando a OS mudar de status.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setCurrentView('templates')} style={{ whiteSpace: 'nowrap' }}>
                    Configurar Mensagens
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Gateways Tab ── */}
      {mainTab === 'gateways' && currentView !== 'templates' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {GATEWAY_CONFIGS.map(cfg => {
              const savedGateway = gateways[cfg.name]
              const form = gatewayForms[cfg.name] || {}
              const isActive = form.active
              const isSaving = gatewayLoading[cfg.name]

              return (
                <div key={cfg.name} className="card" style={{ border: isActive ? `1px solid ${cfg.color}40` : '1px solid var(--color-border)', transition: 'border 0.2s' }}>
                  {/* Gateway Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Logo placeholder with brand color */}
                      <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={26} color={cfg.color} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{cfg.label}</h2>
                          {savedGateway && isActive && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '700', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '3px 10px', borderRadius: '9999px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Ativo
                            </span>
                          )}
                          {savedGateway && !isActive && (
                            <span style={{ fontSize: '0.72rem', fontWeight: '700', backgroundColor: 'rgba(100,116,139,0.1)', color: '#64748b', padding: '3px 10px', borderRadius: '9999px' }}>
                              Inativo
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{cfg.description}</p>
                      </div>
                    </div>

                    {/* Toggle Ativo/Inativo */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: isActive ? '#10b981' : 'var(--color-text-muted)' }}>
                        {isActive ? 'Ativado' : 'Desativado'}
                      </span>
                      <div
                        onClick={() => updateGatewayForm(cfg.name, 'active', !isActive)}
                        style={{
                          width: '44px', height: '24px', borderRadius: '12px',
                          backgroundColor: isActive ? '#10b981' : '#cbd5e1',
                          position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s',
                        }}>
                        <div style={{
                          position: 'absolute', top: '2px',
                          left: isActive ? '22px' : '2px',
                          width: '20px', height: '20px', borderRadius: '50%',
                          backgroundColor: 'white', transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                    </label>
                  </div>

                  {/* Sandbox Mode Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: form.sandbox ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.04)', border: `1px solid ${form.sandbox ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.15)'}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Zap size={16} color={form.sandbox ? '#f59e0b' : '#10b981'} />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: form.sandbox ? '#d97706' : '#10b981' }}>
                          {form.sandbox ? '🔧 Modo Sandbox (Testes)' : '🚀 Modo Produção'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                          {form.sandbox ? 'Transações não cobram dinheiro real.' : 'As cobranças são reais.'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => updateGatewayForm(cfg.name, 'sandbox', !form.sandbox)}
                      style={{ fontSize: '0.8rem', fontWeight: '600', padding: '6px 14px', borderRadius: '8px', border: `1px solid ${form.sandbox ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)'}`, backgroundColor: 'transparent', color: form.sandbox ? '#d97706' : '#10b981', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {form.sandbox ? 'Ir para Produção' : 'Voltar ao Sandbox'}
                    </button>
                  </div>

                  {/* Credential Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cfg.fields.map(field => (
                      <div key={field.key}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.82rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{field.label}</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={field.type === 'password' && !showFields[`${cfg.name}_${field.key}`] ? 'password' : 'text'}
                            className="input"
                            placeholder={field.placeholder}
                            value={form[field.key] || ''}
                            onChange={e => updateGatewayForm(cfg.name, field.key, e.target.value)}
                            style={{ paddingRight: field.type === 'password' ? '44px' : undefined, fontFamily: 'monospace', fontSize: '0.82rem' }}
                          />
                          {field.type === 'password' && (
                            <button
                              type="button"
                              onClick={() => setShowFields(prev => ({ ...prev, [`${cfg.name}_${field.key}`]: !prev[`${cfg.name}_${field.key}`] }))}
                              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                              {showFields[`${cfg.name}_${field.key}`] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          )}
                        </div>
                        {field.hint && <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '5px' }}>ℹ️ {field.hint}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Webhook URL - Supabase Edge Function */}
                  {cfg.webhookUrl && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.82rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        URL de Webhook <span style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', marginLeft: '6px' }}>Supabase Edge Function</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          readOnly
                          value={cfg.webhookUrl}
                          className="input"
                          style={{ fontFamily: 'monospace', fontSize: '0.8rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', paddingRight: '90px' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(cfg.webhookUrl!)
                            showToast('URL copiada!', 'success')
                          }}
                          style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: cfg.color, border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', color: 'white', fontSize: '0.75rem', fontWeight: '700', fontFamily: 'inherit' }}
                        >
                          Copiar
                        </button>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '5px' }}>
                        📋 Cole esta URL no painel do {cfg.label} em <strong>Integrações → Webhooks</strong> para receber notificações de pagamento em tempo real.
                      </p>
                    </div>
                  )}

                  {/* Footer: Docs link + Save button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                    <a href={cfg.docs} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: cfg.color, textDecoration: 'none', fontWeight: '600' }}>
                      <Globe size={14} /> Documentação oficial <ChevronRight size={14} />
                    </a>
                    <button
                      onClick={() => handleSaveGateway(cfg.name)}
                      disabled={isSaving}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', border: 'none', backgroundColor: cfg.color, color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', fontFamily: 'inherit', opacity: isSaving ? 0.7 : 1 }}>
                      <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Coming Soon card */}
            <div className="card" style={{ border: '1px dashed var(--color-border)', backgroundColor: 'transparent', textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CreditCard size={22} color="var(--color-text-muted)" />
              </div>
              <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '6px' }}>Mais gateways em breve</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Stripe, Pagar.me, Asaas e outros em breve disponíveis.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Templates View ── */}
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
              {osStatuses.map(s => (
                <button key={s.value} onClick={() => setActiveTab(s.value)}
                  style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500', fontSize: '0.9rem', backgroundColor: activeTab === s.value ? 'var(--color-primary)' : '#f1f5f9', color: activeTab === s.value ? 'white' : '#64748b', transition: 'all 0.2s ease' }}>
                  {s.label}
                </button>
              ))}
            </div>

            {osStatuses.map(s => {
              if (s.value !== activeTab) return null
              const template = templates.find((t: any) => t.status === s.value) || {
                status: s.value,
                message: `Olá {nome}! Sua Ordem de Serviço {numero_os} do aparelho {aparelho} mudou para o status: ${s.label}.`,
                isActive: false
              }
              return (
                <div key={s.value}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Status: {s.label}</h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.9rem', color: template.isActive ? '#10b981' : '#64748b', fontWeight: '500' }}>{template.isActive ? 'Ativado' : 'Desativado'}</span>
                      <input type="checkbox" checked={template.isActive} onChange={(e) => { handleSaveTemplate(s.value, template.message, e.target.checked) }} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    </label>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: '#64748b' }}>Mensagem</label>
                    <textarea className="input" rows={6} value={template.message}
                      onChange={(e) => {
                        const newTemplates = [...templates]
                        const idx = newTemplates.findIndex(t => t.status === s.value)
                        if (idx >= 0) { newTemplates[idx].message = e.target.value } else { newTemplates.push({ ...template, message: e.target.value }) }
                        setTemplates(newTemplates as any)
                      }}
                      style={{ fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>Variáveis disponíveis:</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['{nome}', '{aparelho}', '{numero_os}', '{status}', '{valor}'].map(v => (
                        <span key={v} style={{ backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#334155', fontFamily: 'monospace' }}>{v}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => handleSaveTemplate(s.value, template.message, template.isActive)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Save size={18} /> Salvar Modelo
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Disconnect Modal ── */}
      {showDisconnectModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)', animation: 'modalSlideUp 0.3s ease-out' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <PowerOff size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Desconectar WhatsApp</h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>Tem certeza que deseja desconectar a sua instância? Você precisará ler um novo QR Code caso queira conectar novamente.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDisconnectModal(false)} className="btn" style={{ backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancelar</button>
              <button onClick={confirmDisconnect} className="btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}>Desconectar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#ef4444', color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10000, animation: 'slideInRight 0.3s ease-out' }}>
          {toastMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: '500' }}>{toastMessage.title}</span>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
      `}} />
    </div>
  )
}

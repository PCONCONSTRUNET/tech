import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CheckCircle, Clock, Package, Wrench, FileText, AlertCircle, Phone, XCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_MAP = [
  { key: 'RECEBIDO',             label: 'Entrada',           icon: FileText,    color: '#64748b', bg: '#f1f5f9' },
  { key: 'EM_ANALISE',           label: 'Em Análise',        icon: AlertCircle, color: '#2563eb', bg: '#eff6ff' },
  { key: 'AGUARDANDO_APROVACAO', label: 'Aguard. Aprovação', icon: Clock,       color: '#d97706', bg: '#fffbeb' },
  { key: 'AGUARDANDO_PECA',      label: 'Aguardando Peça',   icon: Package,     color: '#d97706', bg: '#fffbeb' },
  { key: 'EM_CONSERTO',          label: 'Em Serviço',        icon: Wrench,      color: '#9333ea', bg: '#faf5ff' },
  { key: 'PRONTO',               label: 'Concluído',         icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
  { key: 'ENTREGUE',             label: 'Pago/Entregue',     icon: CheckCircle, color: '#0d9488', bg: '#ccfbf1' },
  { key: 'CANCELADO',            label: 'Cancelado',         icon: XCircle,     color: '#dc2626', bg: '#fef2f2' },
]

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  let [os, settings] = await Promise.all([
    prisma.serviceOrder.findUnique({
      where: { id: resolvedParams.id },
      include: { customer: true }
    }),
    prisma.settings.findFirst()
  ])

  if (!os) {
    const quote = await prisma.quote.findUnique({
      where: { id: resolvedParams.id },
      include: { customer: true }
    })
    if (quote) {
      let parsedNotes: any = {}
      try { parsedNotes = JSON.parse(quote.notes || '{}') } catch {}
      os = {
        id: quote.id,
        status: quote.status,
        device: parsedNotes.device || 'Não informado',
        brand: parsedNotes.brand || '',
        model: parsedNotes.model || '',
        price: quote.totalAmount,
        customer: quote.customer,
        createdAt: quote.createdAt,
      } as any
    }
  }

  if (!os) return notFound()

  const currentIndex = STATUS_MAP.findIndex(s => s.key === os.status)
  const isCanceled = os.status === 'CANCELADO'
  const storeName = settings?.storeName || 'Digital Tech'
  const logoUrl = settings?.logoUrl || '/logo.png'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#0f172a', padding: '32px 24px', textAlign: 'center', color: 'white' }}>
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} style={{ height: '60px', objectFit: 'contain', marginBottom: '16px', filter: 'brightness(0) invert(1)' }} />
          ) : (
            <div style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '16px' }}>🔧 {storeName}</div>
          )}
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '4px' }}>
            Acompanhamento de Serviço
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '0.05em' }}>
            #{os.id.slice(-6).toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px 24px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Olá, {os.customer?.name.split(' ')[0] || 'Cliente'}!</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
              Aparelho: <strong>{os.brand} {os.model}</strong>
            </div>
          </div>

          <div style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', textAlign: 'center' }}>
              Status Atual
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isCanceled ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <XCircle size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#dc2626' }}>Serviço Cancelado / Interrompido</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>O reparo não pôde ser concluído.</div>
                  </div>
                </div>
              ) : (
                STATUS_MAP.filter(s => s.key !== 'CANCELADO').map((status, index) => {
                  const isPast = index < currentIndex
                  const isCurrent = index === currentIndex
                  const Icon = status.icon

                  let iconBg = '#f1f5f9'
                  let iconColor = '#94a3b8'
                  if (isPast) { iconBg = '#dcfce7'; iconColor = '#16a34a' }
                  if (isCurrent) { iconBg = status.bg; iconColor = status.color }

                  return (
                    <div key={status.key} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                      {/* Linha conectora */}
                      {index < STATUS_MAP.length - 2 && (
                        <div style={{ position: 'absolute', left: '19px', top: '40px', bottom: '-20px', width: '2px', backgroundColor: isPast ? '#16a34a' : '#e2e8f0', zIndex: 0 }} />
                      )}
                      
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, border: '4px solid #f1f5f9' }}>
                        <Icon size={18} />
                      </div>
                      
                      <div style={{ paddingTop: '10px', flex: 1, opacity: (isPast || isCurrent) ? 1 : 0.5 }}>
                        <div style={{ fontWeight: isCurrent ? '800' : '600', color: isCurrent ? '#0f172a' : '#64748b', fontSize: isCurrent ? '1rem' : '0.9rem' }}>
                          {status.label}
                        </div>
                        {isCurrent && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                            Sua OS está atualmente nesta etapa.
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Dúvidas sobre o reparo?
            </div>
            {settings?.whatsapp && (
              <a 
                href={`https://wa.me/55${settings.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem' }}
              >
                <Phone size={18} />
                Falar pelo WhatsApp
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

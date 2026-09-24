import { X, Edit2, CheckCircle, Calendar, Shield, Trash2, Phone, Printer, User, Smartphone, Lock, Package, Check, Mail, FileText, Wrench, AlertCircle, Clock, ChevronDown, Plus, Search } from 'lucide-react'
import WhatsappIcon from '@/components/WhatsappIcon'
import { sendOsPdfWhatsApp } from '@/actions/os'

const STATUS_LABEL: Record<string, string> = {
  RECEBIDO: 'Recebido',
  EM_ANALISE: 'Em Análise',
  AGUARDANDO_APROVACAO: 'Aguard. Aprovação',
  AGUARDANDO_PECA: 'Aguard. Peça',
  EM_CONSERTO: 'Em Serviço',
  PRONTO: 'Pronto',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

const STATUS_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  RECEBIDO:             { bg: 'rgba(107,114,128,0.1)',   color: '#475569', border: '#cbd5e1' },
  EM_ANALISE:           { bg: 'rgba(59,130,246,0.1)',    color: '#2563eb', border: '#bfdbfe' },
  AGUARDANDO_APROVACAO: { bg: 'rgba(245,158,11,0.1)',    color: '#d97706', border: '#fde68a' },
  AGUARDANDO_PECA:      { bg: 'rgba(245,158,11,0.1)',    color: '#d97706', border: '#fde68a' },
  EM_CONSERTO:          { bg: 'rgba(168,85,247,0.1)',    color: '#9333ea', border: '#e9d5ff' },
  PRONTO:               { bg: 'rgba(16,185,129,0.1)',    color: '#059669', border: '#a7f3d0' },
  ENTREGUE:             { bg: 'rgba(20,184,166,0.1)',    color: '#0d9488', border: '#99f6e4' },
  CANCELADO:            { bg: 'rgba(239,68,68,0.1)',     color: '#dc2626', border: '#fecaca' },
}

const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export default function QuoteDetailsModal({ quote, quoteNumber, onClose, isQuote = false }: { quote: any; quoteNumber: number; onClose: () => void; isQuote?: boolean }) {
  if (!quote) return null;

  let parsedNotes: any = {};
  if (quote.notes) {
    try { parsedNotes = JSON.parse(quote.notes); } catch(e) {}
  }
  const device = parsedNotes.device || quote.device || 'Não informado';
  const brand = parsedNotes.brand || quote.brand || '';
  const model = parsedNotes.model || quote.model || '';
  const imei = parsedNotes.imei || quote.imei || '';
  const defect = parsedNotes.defect || quote.defect || 'Não informado';
  const diagnostic = parsedNotes.diagnostic || quote.diagnostic || 'Não informado';
  const password = parsedNotes.password || quote.password || 'Não informado';
  const accessories = parsedNotes.accessories || quote.accessories || 'Nenhum acessório';
  const physicalCondition = parsedNotes.physicalCondition || quote.physicalCondition || '';
  const totalPrice = quote.totalAmount ?? quote.price ?? 0;

  const sc = STATUS_COLOR[quote.status] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, backdropFilter: 'blur(4px)', padding: '24px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '750px', height: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#0f172a', color: 'white', fontWeight: '800', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '6px' }}>
              #{quoteNumber}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', color: sc.color, backgroundColor: sc.bg, border: `1px solid ${sc.border}`, padding: '4px 12px', borderRadius: '16px' }}>
              <CheckCircle size={12} /> {STATUS_LABEL[quote.status as keyof typeof STATUS_LABEL]}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <Edit2 size={18} />
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* Cliente */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>CLIENTE</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: '#3b82f6', marginTop: '2px' }}><User size={20} /></div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>{quote.customer?.name || 'Não informado'}</div>
                {quote.customer?.phone && <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{quote.customer.phone}</div>}
              </div>
            </div>
          </div>

          {/* Aparelho */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>APARELHO</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <Smartphone size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>{device} {brand} {model}</div>
                {imei && <div style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', display: 'inline-block', marginTop: '6px' }}>IMEI {imei}</div>}
              </div>
            </div>
          </div>

          {/* Valor Total & Status de Pagamento */}
          <div style={{ marginBottom: '24px', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', backgroundColor: '#fafafa' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>VALOR TOTAL</div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>{totalPrice ? fmt(totalPrice) : 'R$ 0,00'}</div>
            
            {totalPrice > 0 && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: '800', color: '#16a34a', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <CheckCircle size={16} /> ENTRADA RECEBIDA
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16a34a', marginBottom: '8px', borderBottom: '1px solid #dcfce7', paddingBottom: '8px' }}>
                  <span>Pix</span>
                  <span>{fmt(totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#16a34a', marginBottom: '4px' }}>
                  <span>Já recebido:</span>
                  <span style={{ fontWeight: '800' }}>{fmt(totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#16a34a' }}>
                  <span>Falta receber:</span>
                  <span style={{ fontWeight: '800' }}>R$ 0,00</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.65rem', color: '#16a34a', marginTop: '4px', opacity: 0.8 }}>
                  Pago em {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              <div style={{ width: '16px', height: '16px', border: '1px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={12} style={{ color: 'transparent' }} />
              </div>
              Pagamento na retirada
            </div>
            
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Calendar size={18} style={{ color: '#3b82f6' }} />
              <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>Data de Entrada <span style={{ fontWeight: '600' }}>{new Date(quote.createdAt).toLocaleDateString('pt-BR')}</span></div>
            </div>
            
            <div style={{ border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#065f46' }}>90 dias</div>
                  <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>Garantia legal aplicável.</div>
                </div>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800', color: '#16a34a' }}>
                100%
              </div>
            </div>
          </div>

          {/* Problema Relatado */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>PROBLEMA RELATADO / SERVIÇO</div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', fontSize: '0.9rem', color: '#0f172a', minHeight: '60px' }}>
              {defect}
            </div>
          </div>
          
          {/* Laudo Final */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={12} color="#f43f5e" /> DESCRIÇÃO DO ORÇAMENTO
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Preencha após análise técnica. Pode ser editado depois na quote.</div>
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#10b981', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>REGISTRADO</div>
            </div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', fontSize: '0.9rem', color: '#0f172a', minHeight: '60px' }}>
              Aparelho reparado com sucesso. Tudo ok.
            </div>
          </div>

          {/* Senha e Acessórios */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={12} color="#f59e0b" /> SENHA DO APARELHO
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', fontSize: '0.9rem', color: '#0f172a' }}>
                {password}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={12} color="#8b5cf6" /> ACESSÓRIOS RECEBIDOS
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', fontSize: '0.9rem', color: '#0f172a' }}>
                {accessories}
              </div>
            </div>
          </div>

          {/* Serviçquote e Peças */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wrench size={12} color="#10b981" /> SERVIÇOS E PEÇAS
            </div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#0f172a' }}>
                <span>{defect || 'Serviço'}</span>
                <span>{totalPrice ? fmt(totalPrice) : 'R$ 0,00'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', padding: '0 8px' }}>
              <span>Total dos serviços</span>
              <span style={{ fontWeight: '800', color: '#0f172a' }}>{totalPrice ? fmt(totalPrice) : 'R$ 0,00'}</span>
            </div>
          </div>

          {/* Acompanhamento do cliente */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ACOMPANHAMENTO DO CLIENTE
            </div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '16px' }}>
                Crie um link seguro para que o cliente acompanhe o status da quote em tempo real.
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Exemplo de link gerado</div>
              <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px 8px 0 0', padding: '16px', fontSize: '0.85rem', color: '#2563eb', fontFamily: 'monospace' }}>
                https://reparopro.com.br/og/track/abc123...
              </div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '12px 16px', fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={12} style={{ color: '#f59e0b' }} /> Link privado e seguro para seus clientes.
              </div>
              
              <button style={{ width: '100%', marginTop: '16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                Gerar link de acompanhamento
              </button>
            </div>
          </div>

          {/* Histórico */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={12} color="#eab308" /> HISTÓRICO
            </div>
            
            <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '5px', top: '24px', bottom: '0', width: '2px', backgroundColor: '#e2e8f0' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 1 }}>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '2px solid white', marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Criado</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>quote aberta no sistema</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{new Date(quote.createdAt).toLocaleString('pt-BR')}</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
          <button onClick={() => { if(confirm('Excluir?')) {} }} style={{ padding: '10px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <Trash2 size={16} /> Excluir
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ padding: '10px 16px', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <Phone size={16} color="#3b82f6" /> Apenas Contatar
            </button>
            <button style={{ padding: '10px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#16a34a', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <WhatsappIcon size={16} color="#25D366" /> WhatsApp
            </button>
            <button 
              onClick={async () => {
                const btn = document.activeElement as HTMLButtonElement
                const oldText = btn.innerHTML
                btn.innerHTML = 'Enviando...'
                btn.disabled = true
                try {
                  const res = await sendOsPdfWhatsApp(quote.id, quote.customer?.phone || '')
                  if (res?.error) alert('Erro: ' + res.error)
                  else alert('PDF enviado com sucesso!')
                } catch(e) {
                  alert('Erro ao enviar o PDF via API.')
                } finally {
                  btn.innerHTML = oldText
                  btn.disabled = false
                }
              }}
              style={{ padding: '10px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#16a34a', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <WhatsappIcon size={16} color="#25D366" /> Enviar PDF (API)
            </button>
            <button 
              onClick={() => window.open(`/api/quotes/${quote.id}/pdf`, '_blank')}
              style={{ padding: '10px 24px', backgroundColor: '#2563eb', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Printer size={16} /> Imprimir Orçamento
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

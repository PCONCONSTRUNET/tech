'use client'

import { useState, useTransition } from 'react'
import { X, Edit2, CheckCircle, Calendar, Shield, Trash2, Phone, MessageCircle, Printer, User, Smartphone, Lock, Package, Check, FileText, Wrench, Clock, Copy } from 'lucide-react'
import { deleteServiceOrder } from '@/actions/os'
import { useRouter } from 'next/navigation'

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

const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export default function OSDetailsModal({ os, osNumber, onClose, isQuote = false }: { os: any; osNumber: number; onClose: () => void; isQuote?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!os) return null;

  const sc = STATUS_COLOR[os.status] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }

  let notesData: any = {}
  try { notesData = JSON.parse(os.notes || '{}') } catch {}

  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/loja/track/${os.id}` : ''

  const handleCopyTrackLink = () => {
    navigator.clipboard.writeText(trackingUrl)
    alert('Link de acompanhamento copiado!')
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
      startTransition(async () => {
        const res = await deleteServiceOrder(os.id);
        if (res?.error) alert(res.error);
        else {
          alert('Excluído com sucesso!');
          onClose();
        }
      })
    }
  }

  const customerPhoneClean = os.customer?.phone ? os.customer.phone.replace(/\D/g, '') : '';
  const customerNameFirst = os.customer?.name ? os.customer.name.split(' ')[0] : 'Cliente';
  const whatsappUrl = customerPhoneClean 
    ? `https://wa.me/55${customerPhoneClean}?text=Olá ${customerNameFirst}, sobre a sua Ordem de Serviço #${osNumber}...`
    : '#';

  const apenasContatarUrl = customerPhoneClean ? `https://wa.me/55${customerPhoneClean}` : '#';

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, backdropFilter: 'blur(4px)', padding: '24px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '750px', height: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#0f172a', color: 'white', fontWeight: '800', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '6px' }}>
              #{osNumber}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', color: sc.color, backgroundColor: sc.bg, border: `1px solid ${sc.border}`, padding: '4px 12px', borderRadius: '16px' }}>
              <CheckCircle size={12} /> {STATUS_LABEL[os.status as keyof typeof STATUS_LABEL]}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Omitindo botão edit pois editar seria outra tela inteira */}
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
              <div style={{ color: '#94a3b8', marginTop: '2px' }}><User size={20} /></div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>{os.customer?.name || 'Não informado'}</div>
                {os.customer?.phone && <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{os.customer.phone}</div>}
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
                <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>{os.device || 'Não informado'} {os.brand} {os.model}</div>
                {os.imei && <div style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', display: 'inline-block', marginTop: '6px' }}>IMEI {os.imei}</div>}
              </div>
            </div>
          </div>

          {/* Valor Total & Status de Pagamento */}
          <div style={{ marginBottom: '24px', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', backgroundColor: '#fafafa' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>VALOR TOTAL</div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>{os.price ? fmt(os.price) : 'R$ 0,00'}</div>
            
            {os.price > 0 && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: '800', color: '#16a34a', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <CheckCircle size={16} /> ENTRADA RECEBIDA
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16a34a', marginBottom: '8px', borderBottom: '1px solid #dcfce7', paddingBottom: '8px' }}>
                  <span>Dinheiro / Pix / Cartão</span>
                  <span>{fmt(os.price)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#16a34a', marginBottom: '4px' }}>
                  <span>Já pago:</span>
                  <span style={{ fontWeight: '800' }}>{fmt(os.price)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#16a34a' }}>
                  <span>Falta receber:</span>
                  <span style={{ fontWeight: '800' }}>R$ 0,00</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.65rem', color: '#16a34a', marginTop: '4px', opacity: 0.8 }}>
                  Atualizado em {new Date(os.updatedAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}
            
            {!os.price && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                <div style={{ width: '16px', height: '16px', border: '1px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} style={{ color: 'transparent' }} />
                </div>
                Pagamento pendente ou valor R$ 0,00
              </div>
            )}
            
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Calendar size={18} style={{ color: '#3b82f6' }} />
              <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>Data de Entrada <span style={{ fontWeight: '600' }}>{new Date(os.createdAt).toLocaleDateString('pt-BR')}</span></div>
            </div>
            
            <div style={{ border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#065f46' }}>90 dias</div>
                  <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>Garantia legal aplicável após finalização.</div>
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
              {os.defect || 'Não informado'}
            </div>
          </div>
          
          {/* Laudo Final */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={12} /> LAUDO FINAL / DIAGNÓSTICO
                </div>
              </div>
              {os.diagnostic && <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#10b981', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>REGISTRADO</div>}
            </div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', fontSize: '0.9rem', color: os.diagnostic ? '#0f172a' : '#94a3b8', minHeight: '60px', backgroundColor: os.diagnostic ? 'white' : '#f8fafc' }}>
              {os.diagnostic || 'Nenhum laudo final ou diagnóstico registrado na OS ainda.'}
            </div>
          </div>

          {/* Senha e Acessórios */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={12} /> SENHA / DESBLOQUEIO
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', fontSize: '0.9rem', color: '#0f172a', fontFamily: notesData.password ? 'monospace' : 'inherit' }}>
                {notesData.password || 'Não informado'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={12} /> ESTADO FÍSICO
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', fontSize: '0.9rem', color: '#0f172a' }}>
                {notesData.physicalCondition || 'Não informado'}
              </div>
            </div>
          </div>

          {/* Serviços e Peças */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wrench size={12} /> SERVIÇOS E PEÇAS
            </div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#0f172a' }}>
                <span>{os.defect || 'Serviço'}</span>
                <span>{os.price ? fmt(os.price) : 'R$ 0,00'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', padding: '0 8px' }}>
              <span>Total dos serviços</span>
              <span style={{ fontWeight: '800', color: '#0f172a' }}>{os.price ? fmt(os.price) : 'R$ 0,00'}</span>
            </div>
          </div>

          {/* Acompanhamento do cliente */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ACOMPANHAMENTO DO CLIENTE
            </div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '16px' }}>
                Crie um link seguro para que o cliente acompanhe o status da OS em tempo real.
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Link gerado</div>
              <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px 8px 0 0', padding: '16px', fontSize: '0.85rem', color: '#2563eb', fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {trackingUrl}
              </div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '12px 16px', fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={12} style={{ color: '#10b981' }} /> Link privado e seguro para seus clientes.
              </div>
              
              <button onClick={handleCopyTrackLink} style={{ width: '100%', marginTop: '16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <Copy size={16} /> Copiar link de acompanhamento
              </button>
            </div>
          </div>

          {/* Histórico */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={12} /> HISTÓRICO
            </div>
            
            <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '5px', top: '24px', bottom: '0', width: '2px', backgroundColor: '#e2e8f0' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 1 }}>
                
                {/* Evento Atualizado (se mudou o status) */}
                {os.status !== 'RECEBIDO' && (
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: sc.color, border: '2px solid white', marginTop: '4px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Alterado para {STATUS_LABEL[os.status as keyof typeof STATUS_LABEL]}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Status da OS atualizado.</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{new Date(os.updatedAt).toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                )}
                
                {/* Evento Criado */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#94a3b8', border: '2px solid white', marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Criado</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>OS aberta no sistema</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{new Date(os.createdAt).toLocaleString('pt-BR')}</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', justifyContent: 'space-between', backgroundColor: '#f8fafc', flexWrap: 'wrap' }}>
          <button onClick={handleDelete} disabled={isPending} style={{ padding: '10px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: isPending ? 'wait' : 'pointer', opacity: isPending ? 0.5 : 1 }}>
            <Trash2 size={16} /> Excluir
          </button>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {customerPhoneClean ? (
              <a href={apenasContatarUrl} target="_blank" style={{ textDecoration: 'none', padding: '10px 16px', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={16} /> Apenas Contatar
              </a>
            ) : (
              <button onClick={() => alert('Telefone do cliente não informado.')} style={{ padding: '10px 16px', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'not-allowed' }}>
                <Phone size={16} /> Apenas Contatar
              </button>
            )}

            {customerPhoneClean ? (
              <a href={whatsappUrl} target="_blank" style={{ textDecoration: 'none', padding: '10px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#16a34a', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageCircle size={16} /> WhatsApp
              </a>
            ) : (
              <button onClick={() => alert('Telefone do cliente não informado.')} style={{ padding: '10px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'not-allowed' }}>
                <MessageCircle size={16} /> WhatsApp
              </button>
            )}

            <button 
              onClick={() => window.open(isQuote ? `/painel/quotes/${os.id}` : `/api/os/${os.id}/pdf`, '_blank')}
              style={{ padding: '10px 24px', backgroundColor: '#2563eb', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Printer size={16} /> Imprimir {isQuote ? 'Orçamento' : 'OS'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

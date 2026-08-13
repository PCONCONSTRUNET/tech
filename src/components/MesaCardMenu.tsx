'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical, Printer, Phone, Edit,
  XCircle, Trash2, AlertCircle, Package, Wrench, CheckCircle, DollarSign, FileText, Clock
} from 'lucide-react';
import WhatsappIcon from './WhatsappIcon';
import { sendOsPdfWhatsApp, deleteServiceOrder, updateServiceOrderStatus } from '@/actions/os';
import ConfirmModal from './ConfirmModal';

const STATUS_OPTIONS = [
  { key: 'RECEBIDO',             label: 'Entrada',           icon: FileText,    color: '#64748b', bg: '#f1f5f9' },
  { key: 'EM_ANALISE',           label: 'Em Análise',        icon: AlertCircle, color: '#2563eb', bg: '#eff6ff' },
  { key: 'AGUARDANDO_APROVACAO', label: 'Aguard. Aprovação', icon: Clock,       color: '#d97706', bg: '#fffbeb' },
  { key: 'AGUARDANDO_PECA',      label: 'Aguardando Peça',   icon: Package,     color: '#d97706', bg: '#fffbeb' },
  { key: 'EM_CONSERTO',          label: 'Em Serviço',        icon: Wrench,      color: '#9333ea', bg: '#faf5ff' },
  { key: 'PRONTO',               label: 'Concluído',         icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
  { key: 'ENTREGUE',             label: 'Pago',              icon: DollarSign,  color: '#475569', bg: '#f1f5f9' },
  { key: 'CANCELADO',            label: 'Interrompido',      icon: XCircle,     color: '#dc2626', bg: '#fef2f2' },
];

export default function MesaCardMenu({ card }: { card: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showStatusSub, setShowStatusSub] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive: boolean;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', isDestructive: false, onConfirm: () => {} });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowStatusSub(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.right + window.scrollX - 200,
    });
    setIsOpen(prev => !prev);
    setShowStatusSub(false);
  }

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setIsOpen(false);
    window.open(`/api/os/${card.id}/pdf`, '_blank');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setIsOpen(false);
    if (!card.customerPhone) { alert('Cliente não possui telefone cadastrado!'); return; }
    
    setConfirmConfig({
      isOpen: true,
      title: 'Enviar PDF',
      message: `Deseja enviar o PDF da OS #${card.number} para o WhatsApp do cliente?`,
      isDestructive: false,
      onConfirm: () => {
        startTransition(async () => {
          const res = await sendOsPdfWhatsApp(card.id, card.customerPhone);
          if (res?.error) alert(res.error);
          else alert('PDF enviado com sucesso para o WhatsApp!');
        });
      }
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setIsOpen(false);
    
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir OS',
      message: 'Tem certeza que deseja excluir esta OS? Essa ação não pode ser desfeita.',
      isDestructive: true,
      onConfirm: () => {
        startTransition(async () => {
          const res = await deleteServiceOrder(card.id);
          if (res && res.error) {
            alert(res.error);
          }
        });
      }
    });
  };

  const handleStatus = (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation(); e.preventDefault();
    setIsOpen(false);
    setShowStatusSub(false);
    startTransition(async () => {
      const res = await updateServiceOrderStatus(card.id, newStatus);
      if (res && res.error) {
        alert(res.error);
      }
    });
  };

  const menu = isOpen && typeof document !== 'undefined' ? createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: menuPos.top,
        left: Math.max(8, menuPos.left),
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 20px 40px -8px rgba(0,0,0,0.18)',
        minWidth: '210px',
        maxWidth: 'calc(100vw - 16px)',
        zIndex: 99999,
        padding: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      {/* Editar OS */}
      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsOpen(false); alert('Para editar, acesse a tela de OS.'); }} style={itemStyle}>
        <Edit size={14} color="#64748b" /> Editar OS
      </button>

      {/* Imprimir */}
      <button onClick={handlePrint} style={itemStyle}>
        <Printer size={14} color="#64748b" /> Imprimir PDF
      </button>

      {/* WhatsApp PDF */}
      <button onClick={handleWhatsApp} style={itemStyle}>
        <WhatsappIcon size={14} color="#25D366" /> Enviar PDF WhatsApp
      </button>

      {/* Contatar */}
      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} style={itemStyle}>
        <Phone size={14} color="#64748b" /> Apenas Contatar
      </button>

      <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />

      {/* Seção STATUS */}
      <div style={{ padding: '4px 10px 2px', fontSize: '0.63rem', fontWeight: '800', letterSpacing: '0.07em', color: '#94a3b8' }}>
        ALTERAR STATUS
      </div>

      {STATUS_OPTIONS.map(opt => {
        const Icon = opt.icon;
        const isCurrent = card.status === opt.key;
        return (
          <button
            key={opt.key}
            onClick={(e) => handleStatus(e, opt.key)}
            style={{
              ...itemStyle,
              background: isCurrent ? opt.bg : 'transparent',
              color: isCurrent ? opt.color : '#334155',
              fontWeight: isCurrent ? '600' : '500',
            }}
            onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: '22px', height: '22px', borderRadius: '6px',
              backgroundColor: opt.bg, color: opt.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Icon size={13} />
            </div>
            {opt.label}
            {isCurrent && (
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: opt.color }}>✓ atual</span>
            )}
          </button>
        );
      })}

      <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />

      {/* Excluir */}
      <button onClick={handleDelete} style={{ ...itemStyle, color: '#dc2626' }}>
        <Trash2 size={14} color="#dc2626" /> Excluir OS
      </button>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
        <button
          ref={buttonRef}
          onClick={handleOpen}
          disabled={isPending}
          style={{
            background: isOpen ? '#f1f5f9' : 'transparent', border: 'none',
            padding: '4px', borderRadius: '8px', cursor: isPending ? 'not-allowed' : 'pointer',
            color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', opacity: isPending ? 0.5 : 1,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
          onMouseLeave={e => (e.currentTarget.style.background = isOpen ? '#f1f5f9' : 'transparent')}
        >
          <MoreVertical size={16} />
        </button>
        {menu}
      </div>
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}

const itemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
  padding: '7px 10px', border: 'none', background: 'transparent',
  textAlign: 'left', cursor: 'pointer', borderRadius: '8px',
  color: '#334155', fontSize: '0.83rem', fontWeight: '500',
  transition: 'background 0.1s',
};

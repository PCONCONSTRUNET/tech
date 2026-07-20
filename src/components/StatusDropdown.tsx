'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Package, Wrench, CheckCircle, DollarSign, XCircle, ChevronDown, Check, FileText, Clock } from 'lucide-react';
import { updateServiceOrderStatus } from '@/actions/os';

export const STATUS_UI: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  RECEBIDO:             { label: 'Entrada',            icon: FileText,    color: '#64748b', bg: '#f1f5f9' },
  EM_ANALISE:           { label: 'Em Análise',         icon: AlertCircle, color: '#2563eb', bg: '#eff6ff' },
  AGUARDANDO_APROVACAO: { label: 'Aguard. Aprovação',  icon: Clock,       color: '#d97706', bg: '#fffbeb' },
  AGUARDANDO_PECA:      { label: 'Aguardando Peça',    icon: Package,     color: '#d97706', bg: '#fffbeb' },
  EM_CONSERTO:          { label: 'Em Serviço',         icon: Wrench,      color: '#9333ea', bg: '#faf5ff' },
  PRONTO:               { label: 'Concluído',          icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
  ENTREGUE:             { label: 'Pago',               icon: DollarSign,  color: '#475569', bg: '#f1f5f9' },
  CANCELADO:            { label: 'Interrompido',       icon: XCircle,     color: '#dc2626', bg: '#fef2f2' },
};

export default function StatusDropdown({ osId, currentStatus }: { osId: string, currentStatus: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    });
    setIsOpen(prev => !prev);
  }

  const current = STATUS_UI[optimisticStatus] || STATUS_UI['RECEBIDO'];
  const CurrentIcon = current.icon;

  function handleSelect(newStatus: string) {
    if (newStatus === optimisticStatus) return;
    setOptimisticStatus(newStatus);
    setIsOpen(false);
    startTransition(async () => {
      await updateServiceOrderStatus(osId, newStatus);
    });
  }

  const dropdown = isOpen && typeof document !== 'undefined' ? createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: dropdownPos.top,
        left: dropdownPos.left,
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.18)',
        minWidth: '220px',
        maxWidth: 'calc(100vw - 16px)',
        zIndex: 99999,
        padding: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      {Object.entries(STATUS_UI).map(([key, config]) => {
        const Icon = config.icon;
        const isSelected = optimisticStatus === key;
        return (
          <button
            key={key}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(key); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '8px 10px', border: 'none', background: isSelected ? '#f8fafc' : 'transparent',
              textAlign: 'left', cursor: 'pointer', borderRadius: '8px',
              color: '#1e293b', fontSize: '0.85rem', fontWeight: '500',
              transition: 'background-color 0.1s'
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = isSelected ? '#f8fafc' : 'transparent')}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '26px', height: '26px', borderRadius: '8px',
              backgroundColor: config.bg, color: config.color, flexShrink: 0
            }}>
              <Icon size={14} />
            </div>
            <span style={{ flex: 1, color: isSelected ? '#6366f1' : 'inherit', fontWeight: isSelected ? '600' : '500' }}>
              {config.label}
            </span>
            {isSelected && <Check size={16} color="#6366f1" />}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        disabled={isPending}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '0.75rem', fontWeight: '600',
          color: current.color, backgroundColor: current.bg,
          border: `1px solid ${current.color}40`, cursor: isPending ? 'not-allowed' : 'pointer',
          padding: '6px 12px', borderRadius: '16px',
          opacity: isPending ? 0.7 : 1, transition: 'all 0.2s',
          outline: 'none', whiteSpace: 'nowrap'
        }}
      >
        <CurrentIcon size={14} /> {current.label}
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>

      {dropdown}
    </div>
  );
}

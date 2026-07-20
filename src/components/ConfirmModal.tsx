'use client';

import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false
}: ConfirmModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: '24px' }}>
      <div 
        className="confirm-modal-content"
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: isDestructive ? '#fef2f2' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: isDestructive ? '#ef4444' : '#3b82f6' }}>
            <AlertCircle size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{title}</h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>{message}</p>
        </div>
        
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', backgroundColor: '#f8fafc', display: 'flex', gap: '12px' }}>
          <button 
            onClick={onClose} 
            style={{ flex: 1, padding: '12px', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            style={{ flex: 1, padding: '12px', backgroundColor: isDestructive ? '#ef4444' : '#2563eb', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

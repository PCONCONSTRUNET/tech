'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { MoreVertical, Printer, MessageCircle, Phone, Edit, ArrowRight, XCircle, Trash2, Archive, Check } from 'lucide-react';
import { sendOsPdfWhatsApp, deleteServiceOrder, updateServiceOrderStatus } from '@/actions/os';
import { useRouter } from 'next/navigation';

export default function MesaCardMenu({ card }: { card: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
    window.open(`/api/os/${card.id}/pdf`, '_blank');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
    
    if (!card.customerPhone) {
      alert("Cliente não possui telefone cadastrado!");
      return;
    }
    
    const confirmSend = confirm(`Deseja enviar o PDF da OS #${card.number} para o WhatsApp do cliente?`);
    if (!confirmSend) return;
    
    startTransition(async () => {
      const res = await sendOsPdfWhatsApp(card.id, card.customerPhone);
      if (res?.error) {
        alert(res.error);
      } else {
        alert('PDF enviado com sucesso para o WhatsApp!');
      }
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
    if (confirm('Tem certeza que deseja excluir esta OS?')) {
      startTransition(async () => {
        await deleteServiceOrder(card.id);
      });
    }
  };

  const handleStatus = (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
    startTransition(async () => {
      await updateServiceOrderStatus(card.id, newStatus);
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
    // Ideally opens a modal, but for now we can navigate to the OS page
    // or just alert if edit from Mesa is not fully supported yet.
    // The user might be fine navigating to the OS list for full edit.
    alert("Para editar todos os campos, acesse a tela de Ordens de Serviço.");
  };

  return (
    <div ref={ref} style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsOpen(!isOpen); }}
        disabled={isPending}
        style={{
          background: isOpen ? '#f1f5f9' : 'transparent', border: 'none',
          padding: '4px', borderRadius: '8px', cursor: isPending ? 'not-allowed' : 'pointer',
          color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s', opacity: isPending ? 0.5 : 1
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
        onMouseLeave={e => e.currentTarget.style.background = isOpen ? '#f1f5f9' : 'transparent'}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: '0',
          backgroundColor: 'white', border: '1px solid var(--color-border)',
          borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
          minWidth: '200px', padding: '6px',
          display: 'flex', flexDirection: 'column', gap: '2px'
        }}>
          <button onClick={handleEdit} className="menu-item" style={menuItemStyle}>
            <Edit size={14} color="#64748b" /> Editar OS
          </button>
          
          <button onClick={handlePrint} className="menu-item" style={menuItemStyle}>
            <Printer size={14} color="#64748b" /> Imprimir PDF
          </button>
          
          <button onClick={handleWhatsApp} className="menu-item" style={menuItemStyle}>
            <MessageCircle size={14} color="#16a34a" /> WhatsApp
          </button>
          
          <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); alert("Em breve: Contatar cliente!"); }} className="menu-item" style={menuItemStyle}>
            <Phone size={14} color="#64748b" /> Apenas Contatar
          </button>

          <div style={{ height: '1px', background: 'var(--color-border)', margin: '6px 0' }} />
          
          <div style={{ padding: '4px 10px', fontSize: '0.65rem', fontWeight: '800', color: 'var(--color-text-muted)' }}>
            STATUS
          </div>
          
          <button onClick={(e) => handleStatus(e, 'EM_CONSERTO')} className="menu-item" style={menuItemStyle}>
            <ArrowRight size={14} color="#3b82f6" /> Avançar Status
          </button>
          
          <button onClick={(e) => handleStatus(e, 'CANCELADO')} className="menu-item" style={{...menuItemStyle, color: '#dc2626'}}>
            <XCircle size={14} color="#dc2626" /> Interromper Reparo
          </button>

          <div style={{ height: '1px', background: 'var(--color-border)', margin: '6px 0' }} />
          
          <button onClick={handleDelete} className="menu-item" style={{...menuItemStyle, color: '#dc2626'}}>
            <Trash2 size={14} color="#dc2626" /> Excluir
          </button>
          
          <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className="menu-item" style={menuItemStyle}>
            <Archive size={14} color="#64748b" /> Arquivar
          </button>
        </div>
      )}
    </div>
  )
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
  padding: '8px 10px', border: 'none', background: 'transparent',
  textAlign: 'left', cursor: 'pointer', borderRadius: '8px',
  color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: '500',
};

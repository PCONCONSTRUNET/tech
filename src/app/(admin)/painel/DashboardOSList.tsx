'use client'

import { useState } from 'react'
import { MoreHorizontal, X } from 'lucide-react'

export default function DashboardOSList({ osList }: { osList: any[] }) {
  const [selectedOs, setSelectedOs] = useState<any | null>(null)

  const statusColors: Record<string, { color: string, bg: string }> = {
    'RECEBIDO': { color: '#475569', bg: '#f1f5f9' },
    'EM_ANALISE': { color: '#2563eb', bg: '#dbeafe' },
    'AGUARDANDO_APROVACAO': { color: '#d97706', bg: '#fef3c7' },
    'EM_CONSERTO': { color: '#d97706', bg: '#fef3c7' },
    'PRONTO': { color: '#059669', bg: '#d1fae5' },
    'ENTREGUE': { color: '#059669', bg: '#d1fae5' },
    'CANCELADO': { color: '#dc2626', bg: '#fee2e2' }
  }

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return {
      date: d.toLocaleDateString('pt-BR'),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Últimas Ordens de Serviço</h2>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><MoreHorizontal size={20} color="var(--color-text-muted)" /></button>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>OS</th>
              <th>Cliente</th>
              <th>Aparelho</th>
              <th>Status</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {osList.map(os => {
              const statusStyle = statusColors[os.status] || { color: 'black', bg: 'transparent' }
              return (
                <tr 
                  key={os.id} 
                  onClick={() => setSelectedOs(os)} 
                  style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ fontWeight: '600' }}>#{os.number.toString().padStart(3, '0')}</td>
                  <td>{os.customer?.name}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      {os.device}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: statusStyle.color, backgroundColor: statusStyle.bg, padding: '4px 10px', borderRadius: '99px' }}>
                      {os.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {os.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.price) : '-'}
                  </td>
                </tr>
              )
            })}
            {osList.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                  Nenhuma OS registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOs && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Detalhes da OS #{selectedOs.number.toString().padStart(3, '0')}</h2>
              <button onClick={() => setSelectedOs(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Data de Criação</p>
                <p style={{ fontWeight: '500' }}>{formatDateTime(selectedOs.createdAt).date} às {formatDateTime(selectedOs.createdAt).time}</p>
              </div>
              
              <div className="grid-responsive-2">
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Cliente</p>
                  <p style={{ fontWeight: '500' }}>{selectedOs.customer?.name}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Aparelho</p>
                  <p style={{ fontWeight: '500' }}>{selectedOs.brand} {selectedOs.device}</p>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Defeito Relatado</p>
                <p style={{ fontWeight: '500', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>{selectedOs.defect}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: statusColors[selectedOs.status]?.color, backgroundColor: statusColors[selectedOs.status]?.bg, padding: '4px 10px', borderRadius: '99px' }}>
                  {selectedOs.status}
                </span>
                <span style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                  {selectedOs.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOs.price) : 'A orçar'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

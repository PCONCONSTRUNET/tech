'use client'

import { useState } from 'react'
import { ShoppingBag, Search, Eye, Filter, Store, MonitorSmartphone, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import { updateSaleStatus } from '@/actions/sale'

export default function SalesClient({ sales }: { sales: any[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL') // ALL, LOJA_VIRTUAL, PDV

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.id.toLowerCase().includes(search.toLowerCase()) || 
                          (s.customer && s.customer.name.toLowerCase().includes(search.toLowerCase()))
    
    const matchesFilter = filter === 'ALL' || s.origin === filter
    
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDENTE': return <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Pendente</span>
      case 'PAGO': return <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12}/> Pago</span>
      case 'ENVIADO': return <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={12}/> Enviado</span>
      case 'CONCLUIDO': return <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12}/> Concluído</span>
      case 'CANCELADO': return <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12}/> Cancelado</span>
      default: return <span>{status}</span>
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateSaleStatus(id, newStatus)
  }

  return (
    <div className="fade-in">
      <style>{`
        .mobile-cards { display: none; }
        .desktop-table { display: block; overflow-x: auto; }
        @media (max-width: 768px) {
          .desktop-table { display: none !important; }
          .mobile-cards { display: flex !important; flex-direction: column; gap: 16px; padding: 16px 0; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--color-text)' }}>Vendas & Pedidos</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Acompanhe todas as vendas do PDV e pedidos da Loja Virtual
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input" 
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ minWidth: '150px' }}>
              <option value="ALL">Todas as Origens</option>
              <option value="LOJA_VIRTUAL">Loja Virtual</option>
              <option value="PDV">PDV Físico</option>
            </select>
          </div>
        </div>

        <div className="desktop-table">
          <table className="table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Origem</th>
                <th>ID do Pedido / Data</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Pagamento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    {sale.origin === 'LOJA_VIRTUAL' ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        <Store size={14} /> Loja Online
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(100, 116, 139, 0.1)', color: '#475569', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        <MonitorSmartphone size={14} /> PDV
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>#{sale.id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(sale.createdAt).toLocaleDateString('pt-BR')} às {new Date(sale.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{sale.customer?.name || 'Cliente Avulso'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.totalAmount)}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{sale.paymentMethod}</span>
                  </td>
                  <td>
                    {getStatusBadge(sale.status)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select 
                        className="input" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto', minWidth: '120px' }}
                        value={sale.status}
                        onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                      >
                        <option value="PENDENTE">Pendente</option>
                        <option value="PAGO">Pago</option>
                        <option value="ENVIADO">Enviado</option>
                        <option value="CONCLUIDO">Concluído</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="mobile-cards" style={{ padding: '0 16px' }}>
          {filteredSales.map((sale) => (
            <div key={sale.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-text)' }}>#{sale.id.slice(-6).toUpperCase()}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {new Date(sale.createdAt).toLocaleDateString('pt-BR')} às {new Date(sale.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                {sale.origin === 'LOJA_VIRTUAL' ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    <Store size={12} /> Loja
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(100, 116, 139, 0.1)', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    <MonitorSmartphone size={12} /> PDV
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text)' }}>{sale.customer?.name || 'Cliente Avulso'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'} • {sale.paymentMethod}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-text)' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.totalAmount)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>{getStatusBadge(sale.status)}</div>
                <select 
                  className="input" 
                  style={{ padding: '6px 8px', fontSize: '0.75rem', height: 'auto', flex: 1 }}
                  value={sale.status}
                  onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                >
                  <option value="PENDENTE">Mudar para Pendente</option>
                  <option value="PAGO">Mudar para Pago</option>
                  <option value="ENVIADO">Mudar para Enviado</option>
                  <option value="CONCLUIDO">Mudar para Concluído</option>
                  <option value="CANCELADO">Mudar para Cancelado</option>
                </select>
              </div>
            </div>
          ))}
          {filteredSales.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Nenhuma venda encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

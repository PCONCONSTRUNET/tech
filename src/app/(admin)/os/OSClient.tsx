'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, X, Eye } from 'lucide-react'
import { createServiceOrder, deleteServiceOrder, updateServiceOrderStatus } from '@/actions/os'

export default function OSClient({ serviceOrders, customers }: { serviceOrders: any[], customers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = serviceOrders.filter(os => {
    const matchesSearch = os.device.toLowerCase().includes(search.toLowerCase()) || 
                          os.customer.name.toLowerCase().includes(search.toLowerCase()) ||
                          os.id.includes(search)
    const matchesStatus = filterStatus ? os.status === filterStatus : true
    return matchesSearch && matchesStatus
  })

  async function handleAdd(formData: FormData) {
    await createServiceOrder(formData)
    setIsModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir esta OS?')) {
      await deleteServiceOrder(id)
    }
  }

  const statusColors: Record<string, string> = {
    'RECEBIDO': 'var(--color-text-muted)',
    'EM_ANALISE': 'var(--color-info)',
    'AGUARDANDO_APROVACAO': 'var(--color-warning)',
    'EM_CONSERTO': 'var(--color-warning)',
    'PRONTO': 'var(--color-success)',
    'ENTREGUE': 'var(--color-success)',
    'CANCELADO': 'var(--color-error)'
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Ordens de Serviço</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Gerencie os consertos e manutenções.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: '8px' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nova OS
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por ID, cliente ou aparelho..." 
              className="input" 
              style={{ paddingLeft: '40px' }} 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input" style={{ width: '200px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos os Status</option>
            <option value="RECEBIDO">Recebido</option>
            <option value="EM_ANALISE">Em Análise</option>
            <option value="AGUARDANDO_APROVACAO">Aguardando Aprovação</option>
            <option value="EM_CONSERTO">Em Conserto</option>
            <option value="PRONTO">Pronto</option>
            <option value="ENTREGUE">Entregue</option>
          </select>
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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(os => (
                <tr key={os.id}>
                  <td style={{ fontWeight: '600' }}>{os.id.slice(-6).toUpperCase()}</td>
                  <td>{os.customer.name}</td>
                  <td>{os.brand} {os.device}</td>
                  <td>
                    <select 
                      value={os.status} 
                      onChange={(e) => updateServiceOrderStatus(os.id, e.target.value)}
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        color: statusColors[os.status] || 'black', 
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="RECEBIDO">Recebido</option>
                      <option value="EM_ANALISE">Em Análise</option>
                      <option value="AGUARDANDO_APROVACAO">Aguardando Aprovação</option>
                      <option value="EM_CONSERTO">Em Conserto</option>
                      <option value="PRONTO">Pronto</option>
                      <option value="ENTREGUE">Entregue</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {os.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.price) : 'A orçar'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }} onClick={() => handleDelete(os.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    Nenhuma ordem de serviço encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Nova Ordem de Serviço</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Cliente *</label>
                <select name="customerId" className="input" required>
                  <option value="">Selecione um cliente...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.document || 'Sem CPF'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Aparelho *</label>
                  <input name="device" type="text" className="input" required placeholder="Ex: Smartphone" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Marca *</label>
                  <input name="brand" type="text" className="input" required placeholder="Ex: Apple" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Modelo</label>
                  <input name="model" type="text" className="input" placeholder="Ex: iPhone 13" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>IMEI / Série</label>
                  <input name="imei" type="text" className="input" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Defeito Relatado *</label>
                <textarea name="defect" rows={3} className="input" required placeholder="Descreva o problema..."></textarea>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Orçamento Inicial (R$)</label>
                <input name="price" type="number" step="0.01" className="input" defaultValue="0" />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '12px' }}>Abrir Ordem de Serviço</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

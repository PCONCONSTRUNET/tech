'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, X } from 'lucide-react'
import { createCustomer, deleteCustomer } from '@/actions/customer'
import { maskCPFOrCNPJ, maskCEP, maskPhone } from '@/lib/masks'

export default function CustomerClient({ customers }: { customers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.document && c.document.includes(search)))

  async function handleAdd(formData: FormData) {
    await createCustomer(formData)
    setIsModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteCustomer(id)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Clientes</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Gerencie os clientes da sua loja.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: '8px' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..." 
              className="input" 
              style={{ paddingLeft: '40px' }} 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Documento</th>
                <th>Endereço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '500' }}>{c.name}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{c.document || '-'}</td>
                  <td>{c.city ? `${c.city} - ${c.state || ''}` : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }} onClick={() => handleDelete(c.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Novo Cliente</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Nome Completo *</label>
                <input name="name" type="text" className="input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Telefone / WhatsApp</label>
                <input name="phone" type="text" className="input" onChange={e => e.target.value = maskPhone(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>CPF / CNPJ</label>
                <input name="document" type="text" className="input" onChange={e => e.target.value = maskCPFOrCNPJ(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>CEP</label>
                  <input name="cep" type="text" className="input" onChange={e => e.target.value = maskCEP(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Bairro</label>
                  <input name="neighborhood" type="text" className="input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Rua</label>
                  <input name="street" type="text" className="input" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Número</label>
                  <input name="number" type="text" className="input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Cidade</label>
                  <input name="city" type="text" className="input" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Estado</label>
                  <input name="state" type="text" className="input" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Salvar Cliente</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

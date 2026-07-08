'use client'

import { useState } from 'react'
import { Plus, Search, Trash2, Truck, X } from 'lucide-react'
import { createSupplier, deleteSupplier } from '@/actions/supplier'
import { maskCPFOrCNPJ, maskCEP, maskPhone } from '@/lib/masks'

export default function SupplierClient({ suppliers }: { suppliers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.document && s.document.includes(search))
  )

  async function handleAdd(formData: FormData) {
    await createSupplier(formData)
    setIsModalOpen(false)
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Fornecedores</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Gerencie seus fornecedores de produtos e serviços.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ gap: '8px' }}>
          <Plus size={20} /> Novo Fornecedor
        </button>
      </div>

      <div className="card">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CNPJ..." 
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
                <th>Nome / Razão Social</th>
                <th>CNPJ/CPF</th>
                <th>Telefone</th>
                <th>Cidade/UF</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Truck size={18} />
                    </div>
                    {supplier.name}
                  </td>
                  <td>{supplier.document || '-'}</td>
                  <td>{supplier.phone || '-'}</td>
                  <td>{supplier.city ? `${supplier.city}/${supplier.state}` : '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => {
                        if (confirm('Deseja excluir este fornecedor?')) {
                          deleteSupplier(supplier.id)
                        }
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    Nenhum fornecedor encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Novo Fornecedor</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="grid-responsive-2">
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Nome / Razão Social *</label>
                  <input name="name" type="text" className="input" required placeholder="Ex: Distribuidora XYZ" />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>CNPJ ou CPF</label>
                  <input 
                    name="document" 
                    type="text" 
                    className="input" 
                    placeholder="00.000.000/0001-00" 
                    onChange={e => e.target.value = maskCPFOrCNPJ(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Telefone</label>
                  <input 
                    name="phone" 
                    type="text" 
                    className="input" 
                    placeholder="(00) 00000-0000" 
                    onChange={e => e.target.value = maskPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>CEP</label>
                  <input 
                    name="cep" 
                    type="text" 
                    className="input" 
                    placeholder="00000-000" 
                    onChange={e => e.target.value = maskCEP(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Endereço</label>
                  <input name="street" type="text" className="input" placeholder="Rua, Avenida..." />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Número</label>
                  <input name="number" type="text" className="input" placeholder="123" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Bairro</label>
                  <input name="neighborhood" type="text" className="input" placeholder="Centro" />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Cidade</label>
                  <input name="city" type="text" className="input" placeholder="São Paulo" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Estado (UF)</label>
                  <input name="state" type="text" className="input" placeholder="SP" maxLength={2} style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                Salvar Fornecedor
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, X, Package } from 'lucide-react'
import { createProduct, deleteProduct } from '@/actions/product'

export default function ProductClient({ products }: { products: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  async function handleAdd(formData: FormData) {
    await createProduct(formData)
    setIsModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProduct(id)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Estoque</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Gerencie produtos, peças e acessórios.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: '8px' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar produto por nome ou SKU..." 
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
                <th>Produto</th>
                <th>SKU</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                        <Package size={20} />
                      </div>
                      <span style={{ fontWeight: '500' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{p.sku || '-'}</td>
                  <td style={{ fontWeight: '500' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.salePrice)}
                  </td>
                  <td>
                    <span style={{ fontWeight: '600', color: p.stock <= p.minStock ? 'var(--color-error)' : 'inherit' }}>
                      {p.stock}
                    </span> un
                  </td>
                  <td>
                    {p.active ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>Ativo</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', padding: '4px 8px', borderRadius: '4px' }}>Inativo</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }} onClick={() => handleDelete(p.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Novo Produto / Peça</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Nome do Produto *</label>
                <input name="name" type="text" className="input" required placeholder="Ex: Tela iPhone 11 Original" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Código / SKU</label>
                  <input name="sku" type="text" className="input" placeholder="Opcional" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Estoque Inicial</label>
                  <input name="stock" type="number" className="input" defaultValue="0" min="0" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Custo (R$)</label>
                  <input name="costPrice" type="number" step="0.01" className="input" defaultValue="0.00" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Preço de Venda (R$)</label>
                  <input name="salePrice" type="number" step="0.01" className="input" defaultValue="0.00" />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '12px' }}>Salvar Produto</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, X, Package, Store } from 'lucide-react'
import { createProduct, deleteProduct, toggleVitrineVisibility } from '@/actions/product'
import ImageUploader from '@/components/ImageUploader'

export default function ProductClient({ 
  products, 
  categories,
  title = "Produtos",
  type = "PRODUCT"
}: { 
  products: any[]; 
  categories: any[];
  title?: string;
  type?: string;
}) {
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)' }}>{title}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Gerencie o catálogo e estoque.</p>
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
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Vitrine Online</th>
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
                  <td>
                    {p.category ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                        {p.category.name}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.salePrice)}
                  </td>
                  <td>
                    <span style={{ fontWeight: '600', color: p.stock <= p.minStock ? 'var(--color-error)' : 'inherit' }}>
                      {p.stock}
                    </span> un
                  </td>
                  <td>
                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={p.showOnVitrine} 
                        onChange={(e) => toggleVitrineVisibility(p.id, e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: p.showOnVitrine ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                        {p.showOnVitrine ? 'Ativo' : 'Oculto'}
                      </span>
                    </label>
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
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Novo Produto / Peça</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="hidden" name="type" value={type} />
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Fotos do Produto</label>
                <ImageUploader onChange={() => {}} />
              </div>

              <div className="grid-responsive-2">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Nome do Produto *</label>
                  <input name="name" type="text" className="input" required placeholder="Ex: Tela iPhone 11 Original" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Categoria</label>
                  <input name="category" type="text" className="input" list="category-list" placeholder="Ex: Telas, Capinhas..." />
                  <datalist id="category-list">
                    {categories.map(c => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Descrição do Produto</label>
                <textarea name="description" className="input" rows={3} placeholder="Descreva os detalhes do produto, como cor, tamanho, armazenamento..." style={{ resize: 'vertical' }}></textarea>
              </div>
              
              <div className="grid-responsive-3">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Código / SKU</label>
                  <input name="sku" type="text" className="input" placeholder="Opcional" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>NCM</label>
                  <input name="ncm" type="text" className="input" placeholder="Ex: 85177010" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Estoque Inicial</label>
                  <input name="stock" type="number" className="input" defaultValue="0" min="0" />
                </div>
              </div>

              <div className="grid-responsive-2">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Custo (R$)</label>
                  <input name="costPrice" type="number" step="0.01" className="input" defaultValue="0.00" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Preço de Venda (R$)</label>
                  <input name="salePrice" type="number" step="0.01" className="input" defaultValue="0.00" />
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" name="showOnVitrine" id="showOnVitrine" value="true" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} />
                <div>
                  <label htmlFor="showOnVitrine" style={{ fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Store size={16} /> Exibir na Vitrine Online</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>O produto ficará visível e disponível para compra na loja pública.</span>
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

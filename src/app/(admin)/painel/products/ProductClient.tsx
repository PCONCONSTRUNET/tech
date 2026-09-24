'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, X, Package, Store, Copy } from 'lucide-react'
import { createProduct, deleteProduct, toggleVitrineVisibility, updateProduct } from '@/actions/product'
import ImageUploader from '@/components/ImageUploader'

export default function ProductClient({ 
  products, 
  categories,
  title = "Produtos",
  type = "PRODUCT"
}: { 
  products?: any[]; 
  categories?: any[];
  title?: string;
  type?: string;
}) {
  const safeProducts = products || [];
  const safeCategories = categories || [];

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [search, setSearch] = useState('')
  
  const filtered = safeProducts.filter(p => {
    const nameStr = p?.name || '';
    const skuStr = p?.sku || '';
    const searchStr = search || '';
    
    return nameStr.toLowerCase().includes(searchStr.toLowerCase()) || 
           skuStr.toLowerCase().includes(searchStr.toLowerCase());
  })

  async function handleAdd(formData: FormData) {
    await createProduct(formData)
    setIsModalOpen(false)
  }

  async function handleEdit(formData: FormData) {
    await updateProduct(formData)
    setEditingProduct(null)
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const res = await deleteProduct(id)
      if (res && res.error) {
        alert(res.error)
      }
    }
  }

  return (
    <>
      <style>{`
        .mobile-cards { display: none; }
        .desktop-table { display: block; overflow-x: auto; }
        @media (max-width: 768px) {
          .desktop-table { display: none !important; }
          .mobile-cards { display: flex !important; flex-direction: column; gap: 16px; padding: 16px 0; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)' }}>{title}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Gerencie o catálogo e estoque.</p>
          {type === 'PRODUCT' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-bg)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                <Store size={14} />
                <span>https://digitalltech.vercel.app/loja</span>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px', height: 'auto' }}
                onClick={() => {
                  navigator.clipboard.writeText('https://digitalltech.vercel.app/loja')
                  alert('Link da loja copiado!')
                }}
              >
                <Copy size={14} /> Copiar Link
              </button>
            </div>
          )}
        </div>
        <button className="btn btn-primary" style={{ gap: '8px', whiteSpace: 'nowrap' }} onClick={() => setIsModalOpen(true)}>
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

        <div className="desktop-table">
          <table className="table" style={{ minWidth: '800px' }}>
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
              {filtered.map(p => {
                let displayPhoto = p.photoUrl;
                if (!displayPhoto && p.photos) {
                  try {
                    const arr = JSON.parse(p.photos);
                    if (Array.isArray(arr) && arr.length > 0) displayPhoto = arr[0];
                  } catch(e) {}
                }
                return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', overflow: 'hidden', flexShrink: 0 }}>
                        {displayPhoto ? (
                          <img src={displayPhoto} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Package size={20} />
                        )}
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
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }} onClick={() => setEditingProduct(p)} title="Editar">
                        <Edit size={18} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }} onClick={() => handleDelete(p.id)} title="Excluir">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="mobile-cards" style={{ padding: '0 16px' }}>
          {filtered.map(p => {
            let displayPhoto = p.photoUrl;
            if (!displayPhoto && p.photos) {
              try {
                const arr = JSON.parse(p.photos);
                if (Array.isArray(arr) && arr.length > 0) displayPhoto = arr[0];
              } catch(e) {}
            }
            return (
            <div key={p.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', overflow: 'hidden', flexShrink: 0 }}>
                  {displayPhoto ? (
                    <img src={displayPhoto} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={24} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--color-text)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>SKU: {p.sku || '-'}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }} onClick={() => setEditingProduct(p)}>
                    <Edit size={18} />
                  </button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }} onClick={() => handleDelete(p.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {p.category ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                    {p.category.name}
                  </span>
                ) : <span />}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {p.active ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-success)' }}>Ativo</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Inativo</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text)' }}>
                  Estoque: <span style={{ color: p.stock <= p.minStock ? 'var(--color-error)' : 'inherit' }}>{p.stock}</span> un
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-text)' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.salePrice)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>Loja Online:</span>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={p.showOnVitrine} 
                    onChange={(e) => toggleVitrineVisibility(p.id, e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: '500', color: p.showOnVitrine ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                    {p.showOnVitrine ? 'Visível' : 'Oculto'}
                  </span>
                </label>
              </div>
            </div>
          )})}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Nenhum produto encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{type === 'SERVICE' ? 'Novo Serviço' : 'Novo Produto / Peça'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="hidden" name="type" value={type} />
              
              {type !== 'SERVICE' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Fotos do Produto</label>
                  <ImageUploader onChange={() => {}} />
                </div>
              )}

              <div className="grid-responsive-2">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>{type === 'SERVICE' ? 'Nome do Serviço *' : 'Nome do Produto *'}</label>
                  <input name="name" type="text" className="input" required placeholder={type === 'SERVICE' ? "Ex: Troca de Tela" : "Ex: Tela iPhone 11 Original"} />
                </div>
                {type !== 'SERVICE' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Categoria</label>
                    <input name="category" type="text" className="input" list="category-list" placeholder="Ex: Telas, Capinhas..." />
                    <datalist id="category-list">
                      {safeCategories.map(c => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                )}
              </div>
              
              {type !== 'SERVICE' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Descrição do Produto</label>
                  <textarea name="description" className="input" rows={3} placeholder="Descreva os detalhes do produto, como cor, tamanho, armazenamento..." style={{ resize: 'vertical' }}></textarea>
                </div>
              )}
              
              {type !== 'SERVICE' && (
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
              )}

              <div className={type === 'SERVICE' ? "" : "grid-responsive-2"}>
                {type !== 'SERVICE' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Custo (R$)</label>
                    <input name="costPrice" type="number" step="0.01" className="input" defaultValue="0.00" />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>{type === 'SERVICE' ? 'Valor (R$)' : 'Preço de Venda (R$)'}</label>
                  <input name="salePrice" type="number" step="0.01" className="input" defaultValue="0.00" />
                </div>
              </div>

              {type !== 'SERVICE' && (
                <div style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" name="showOnVitrine" id="showOnVitrine" value="true" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} />
                  <div>
                    <label htmlFor="showOnVitrine" style={{ fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Store size={16} /> Exibir na Vitrine Online</label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>O produto ficará visível e disponível para compra na loja pública.</span>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '12px' }}>{type === 'SERVICE' ? 'Salvar Serviço' : 'Salvar Produto'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editingProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{type === 'SERVICE' ? 'Editar Serviço' : 'Editar Produto'}</h2>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form action={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="hidden" name="id" value={editingProduct.id} />
              <input type="hidden" name="type" value={editingProduct.type} />

              {type !== 'SERVICE' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Fotos do Produto</label>
                  <ImageUploader
                    initialPhotos={(() => {
                      try { return JSON.parse(editingProduct.photos || '[]') } catch { return [] }
                    })()}
                    onChange={() => {}}
                  />
                </div>
              )}

              <div className="grid-responsive-2">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>{type === 'SERVICE' ? 'Nome do Serviço *' : 'Nome do Produto *'}</label>
                  <input name="name" type="text" className="input" required defaultValue={editingProduct.name} />
                </div>
                {type !== 'SERVICE' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Categoria</label>
                    <input name="category" type="text" className="input" list="edit-category-list" defaultValue={editingProduct.category?.name || ''} />
                    <datalist id="edit-category-list">
                      {safeCategories.map(c => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                )}
              </div>

              {type !== 'SERVICE' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Descrição</label>
                  <textarea name="description" className="input" rows={3} defaultValue={editingProduct.description || ''} style={{ resize: 'vertical' }}></textarea>
                </div>
              )}

              {type !== 'SERVICE' && (
                <div className="grid-responsive-3">
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Código / SKU</label>
                    <input name="sku" type="text" className="input" defaultValue={editingProduct.sku || ''} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>NCM</label>
                    <input name="ncm" type="text" className="input" defaultValue={editingProduct.ncm || ''} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Estoque atual</label>
                    <input type="text" className="input" value={`${editingProduct.stock} un`} disabled style={{ opacity: 0.6 }} />
                  </div>
                </div>
              )}

              <div className={type === 'SERVICE' ? "" : "grid-responsive-2"}>
                {type !== 'SERVICE' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Custo (R$)</label>
                    <input name="costPrice" type="number" step="0.01" className="input" defaultValue={editingProduct.costPrice} />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>{type === 'SERVICE' ? 'Valor (R$)' : 'Preço de Venda (R$)'}</label>
                  <input name="salePrice" type="number" step="0.01" className="input" defaultValue={editingProduct.salePrice} />
                </div>
              </div>

              {type !== 'SERVICE' && (
                <div style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" name="showOnVitrine" id="editShowOnVitrine" value="true" defaultChecked={editingProduct.showOnVitrine} style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} />
                  <div>
                    <label htmlFor="editShowOnVitrine" style={{ fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Store size={16} /> Exibir na Vitrine Online</label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>O produto ficará visível e disponível para compra na loja pública.</span>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '12px' }}>Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import { ShoppingCart, Search, CreditCard, Banknote, QrCode, Trash2 } from 'lucide-react'
import { createSale } from '@/actions/pos'

export default function POSClient({ products }: { products: any[] }) {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState('PIX')

  const filteredProducts = products.filter(p => 
    p.active && p.stock > 0 && 
    (p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())))
  )

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const total = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    const res = await createSale(cart, paymentMethod, total)
    if (res?.success) {
      if (confirm('Venda finalizada com sucesso! Deseja imprimir o recibo/nota?')) {
        window.open(`/invoice/${res.saleId}`, '_blank')
      }
      setCart([])
    } else {
      alert('Erro ao finalizar venda.')
    }
  }

  return (
    <div className="grid-responsive-2-1" style={{ gap: '24px', height: 'calc(100vh - 120px)' }}>
      {/* Left side: Products */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>Produtos em Estoque</h2>
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por código de barras ou nome..." 
            className="input" 
            style={{ paddingLeft: '40px', padding: '12px 12px 12px 40px', fontSize: '1.125rem' }} 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', alignContent: 'start' }}>
          {filteredProducts.map(p => {
            let displayPhoto = p.photoUrl;
            if (!displayPhoto && p.photos) {
              try {
                const arr = JSON.parse(p.photos);
                if (Array.isArray(arr) && arr.length > 0) displayPhoto = arr[0];
              } catch(e) {}
            }
            return (
            <div 
              key={p.id}
              onClick={() => addToCart(p)}
              style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s', backgroundColor: 'var(--color-surface)' }}
            >
              <div style={{ width: '80px', height: '80px', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {displayPhoto ? (
                  <img src={displayPhoto} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2rem' }}>📦</span>
                )}
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '4px' }}>{p.name}</div>
              <div style={{ fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.salePrice)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Estoque: {p.stock}</div>
            </div>
          )})}
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '24px' }}>
              Nenhum produto em estoque encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Right side: Cart */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={20} /> Carrinho
        </h2>
        
        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '24px', overflowY: 'auto' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: '600' }}>{item.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{item.quantity}x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.salePrice)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontWeight: '600' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.salePrice * item.quantity)}
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '24px' }}>
              Carrinho vazio
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1.125rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
            <span style={{ fontWeight: '600' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.5rem', fontWeight: '800' }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
          </div>

          <div className="grid-responsive-2" style={{ marginBottom: '16px' }}>
            <button 
              onClick={() => setPaymentMethod('CREDIT')}
              className={`btn ${paymentMethod === 'CREDIT' ? 'btn-primary' : 'btn-outline'}`} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', gap: '8px' }}
            >
              <img src="/cartao.png" alt="Cartão" style={{ width: '24px', height: '24px', filter: paymentMethod === 'CREDIT' ? 'invert(1)' : 'none' }} /> Crédito
            </button>
            <button 
              onClick={() => setPaymentMethod('CASH')}
              className={`btn ${paymentMethod === 'CASH' ? 'btn-primary' : 'btn-outline'}`} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', gap: '8px' }}
            >
              <img src="/dinheiro.png" alt="Dinheiro" style={{ width: '24px', height: '24px', filter: paymentMethod === 'CASH' ? 'invert(1)' : 'none' }} /> Dinheiro
            </button>
            <button 
              onClick={() => setPaymentMethod('PIX')}
              className={`btn ${paymentMethod === 'PIX' ? 'btn-primary' : 'btn-outline'}`} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', gap: '8px', gridColumn: 'span 2' }}
            >
              <img src="/pix.png" alt="PIX" style={{ width: '24px', height: '24px' }} /> PIX
            </button>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.125rem', fontWeight: '700', opacity: cart.length === 0 ? 0.5 : 1 }}
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  )
}

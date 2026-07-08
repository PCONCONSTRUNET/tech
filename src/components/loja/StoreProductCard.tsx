'use client'

import { useCart } from './CartContext'
import { ShoppingBag } from 'lucide-react'

export default function StoreProductCard({ 
  product 
}: { 
  product: { id: string, name: string, price: number, category: string, image?: string } 
}) {
  const { addItem } = useCart()

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'pointer' }}
         onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
         onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ backgroundColor: 'var(--color-bg)', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', borderBottom: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {product.image && (product.image.startsWith('http') || product.image.startsWith('/')) ? (
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          product.image || '📱'
        )}
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600', textTransform: 'uppercase' }}>{product.category}</span>
        <h4 style={{ fontWeight: '600', margin: 0, fontSize: '1rem', lineHeight: 1.4, flex: 1 }}>{product.name}</h4>
        <div style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: 'auto' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
        </div>
        <button 
          className="btn btn-outline" 
          style={{ width: '100%', marginTop: '8px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
          onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
        >
          <ShoppingBag size={16} /> Adicionar
        </button>
      </div>
    </div>
  )
}

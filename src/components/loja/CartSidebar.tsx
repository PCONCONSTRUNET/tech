'use client'

import { ShoppingBag, X, Plus, Minus, ArrowRight, MessageCircle } from 'lucide-react'
import { useCart } from './CartContext'
import { useState } from 'react'
import { processCheckout } from '@/actions/checkout'
import { validateCoupon } from '@/actions/coupon'
import { maskPhone } from '@/lib/masks'

export default function CartSidebar() {
  const { items, isSidebarOpen, setSidebarOpen, removeItem, updateQuantity, totalAmount, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Formulário Checkout
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // Cupom
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [discount, setDiscount] = useState(0)

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    
    // Check database for coupon
    const result = await validateCoupon(couponCode)
    
    if (result.valid && result.coupon) {
      if (result.coupon.type === 'PERCENTAGE') {
        const discountValue = totalAmount * (result.coupon.value / 100)
        setDiscount(discountValue)
      } else {
        setDiscount(result.coupon.value)
      }
      setAppliedCoupon(result.coupon.code)
    } else {
      alert(result.error || 'Cupom inválido ou expirado.')
      setDiscount(0)
      setAppliedCoupon('')
    }
  }

  const finalTotal = Math.max(0, totalAmount - discount)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return

    setIsLoading(true)
    const res = await processCheckout({
      customerName: name,
      customerPhone: phone,
      items: items,
      totalAmount
    })
    setIsLoading(false)

    if (res.error) {
      alert(res.error)
      return
    }

    if (res.success) {
      // Montar mensagem para o WhatsApp
      let msg = `*NOVO PEDIDO (Vitrine Online)*\n`
      msg += `👤 Cliente: ${name}\n\n`
      msg += `*Itens do Pedido:*\n`
      items.forEach(item => {
        msg += `- ${item.quantity}x ${item.name} (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)})\n`
      })
      
      if (discount > 0) {
        msg += `\n*Subtotal:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}`
        msg += `\n*Desconto (${appliedCoupon}):* -${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)}`
      }
      msg += `\n*Total a pagar: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalTotal)}*`

      const encodedMsg = encodeURIComponent(msg)
      // Remove all non-numeric chars from store whatsapp
      const storePhoneNum = res.storeWhatsapp.replace(/\D/g, '')
      
      const wpUrl = `https://wa.me/55${storePhoneNum}?text=${encodedMsg}`
      
      clearCart()
      setSidebarOpen(false)
      setIsCheckingOut(false)
      setName('')
      setPhone('')
      
      window.open(wpUrl, '_blank')
    }
  }

  return (
    <>
      {/* Botão Flutuante */}
      <button 
        onClick={() => setSidebarOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4), 0 8px 10px -6px rgba(79, 70, 229, 0.2)',
          cursor: 'pointer',
          zIndex: 40,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <ShoppingBag size={28} />
        {items.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: 'var(--color-error)',
            color: 'white',
            borderRadius: '99px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px solid white'
          }}>
            {items.reduce((acc, item) => acc + item.quantity, 0)}
          </div>
        )}
      </button>

      {/* Overlay Escuro */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 45,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* Gaveta (Drawer) */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100%',
        width: '400px',
        maxWidth: '100%',
        backgroundColor: '#111',
        color: '#fff',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        zIndex: 50,
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Drawer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid #333' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={24} color="#fff" />
            Seu Carrinho
          </h2>
          <button 
            onClick={() => {
              setSidebarOpen(false)
              setIsCheckingOut(false)
            }} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', gap: '16px' }}>
              <ShoppingBag size={64} opacity={0.2} />
              <p>Seu carrinho está vazio.</p>
            </div>
          ) : isCheckingOut ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
              <h3 style={{ fontWeight: '600', fontSize: '1.1rem' }}>Finalizar Pedido</h3>
              <p style={{ fontSize: '0.875rem', color: '#999' }}>Preencha seus dados para enviarmos o pedido direto para o WhatsApp da loja.</p>
              
              <form id="checkout-form" onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: '#ddd' }}>Seu Nome</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: João da Silva" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: '#ddd' }}>Seu WhatsApp</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="(00) 90000-0000" 
                    value={phone}
                    onChange={e => setPhone(maskPhone(e.target.value))}
                    style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </form>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '📱'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '4px', color: '#fff' }}>{item.name}</div>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#222', padding: '4px 8px', borderRadius: '8px' }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#fff' }}><Minus size={14} /></button>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#fff' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#fff' }}><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Drawer */}
        {items.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid #333', backgroundColor: '#111' }}>
            
            {/* Cupom */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Possui um cupom?</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Código do cupom" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#222', border: '1px solid #333', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
                <button 
                  onClick={handleApplyCoupon}
                  style={{ padding: '0 20px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
                >
                  Aplicar
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: discount > 0 ? '8px' : '20px', fontSize: discount > 0 ? '1rem' : '1.25rem', fontWeight: discount > 0 ? 'normal' : 'bold', color: discount > 0 ? '#aaa' : '#fff' }}>
              <span>Subtotal:</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}</span>
            </div>

            {discount > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1rem', color: '#25d366', fontWeight: 'bold' }}>
                  <span>Desconto ({appliedCoupon}):</span>
                  <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>
                  <span>Total:</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalTotal)}</span>
                </div>
              </>
            )}
            
            {isCheckingOut ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  style={{ flex: 1, backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer', padding: '16px', fontWeight: 'bold' }}
                  onClick={() => setIsCheckingOut(false)}
                >
                  Voltar
                </button>
                <button 
                  type="submit" 
                  form="checkout-form"
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#25d366', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', padding: '16px', fontWeight: 'bold' }}
                  disabled={isLoading}
                >
                  <MessageCircle size={18} />
                  {isLoading ? 'Enviando...' : 'Enviar Pedido'}
                </button>
              </div>
            ) : (
              <button 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => setIsCheckingOut(true)}
              >
                Finalizar Compra <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}

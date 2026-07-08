'use client'

import { ShoppingBag, X, Plus, Minus, ArrowRight, MessageCircle } from 'lucide-react'
import { useCart } from './CartContext'
import { useState } from 'react'
import { processCheckout } from '@/actions/checkout'
import { maskPhone } from '@/lib/masks'

export default function CartSidebar() {
  const { items, isSidebarOpen, setSidebarOpen, removeItem, updateQuantity, totalAmount, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Formulário Checkout
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

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
      msg += `\n*Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}*`

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
        backgroundColor: 'var(--color-surface)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
        zIndex: 50,
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Drawer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={24} color="var(--color-primary)" />
            Seu Carrinho
          </h2>
          <button 
            onClick={() => {
              setSidebarOpen(false)
              setIsCheckingOut(false)
            }} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', gap: '16px' }}>
              <ShoppingBag size={64} opacity={0.2} />
              <p>Seu carrinho está vazio.</p>
            </div>
          ) : isCheckingOut ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
              <h3 style={{ fontWeight: '600', fontSize: '1.1rem' }}>Finalizar Pedido</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Preencha seus dados para enviarmos o pedido direto para o WhatsApp da loja.</p>
              
              <form id="checkout-form" onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>Seu Nome</label>
                  <input 
                    type="text" 
                    className="input" 
                    required 
                    placeholder="Ex: João da Silva" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>Seu WhatsApp</label>
                  <input 
                    type="text" 
                    className="input" 
                    required 
                    placeholder="(00) 90000-0000" 
                    value={phone}
                    onChange={e => setPhone(maskPhone(e.target.value))}
                  />
                </div>
              </form>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {item.image || '📱'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--color-bg)', padding: '4px 8px', borderRadius: '8px' }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><Minus size={14} /></button>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Drawer */}
        {items.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.25rem', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}</span>
            </div>
            
            {isCheckingOut ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, backgroundColor: 'white' }}
                  onClick={() => setIsCheckingOut(false)}
                >
                  Voltar
                </button>
                <button 
                  type="submit" 
                  form="checkout-form"
                  className="btn btn-primary" 
                  style={{ flex: 2, gap: '8px', backgroundColor: '#25d366', borderColor: '#25d366', color: 'white' }}
                  disabled={isLoading}
                >
                  <MessageCircle size={18} />
                  {isLoading ? 'Enviando...' : 'Enviar Pedido'}
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', gap: '8px', padding: '16px' }}
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

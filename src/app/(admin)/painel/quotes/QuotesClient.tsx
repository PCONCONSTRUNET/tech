'use client'

import { useState } from 'react'
import { FileText, Plus, Trash2, Edit2, X, Printer, Search, CheckCircle, XCircle, Download, MessageCircle } from 'lucide-react'
import { createQuote, deleteQuote, updateQuoteStatus } from '@/actions/quote'

export default function QuotesClient({ quotes, customers, products }: { quotes: any[], customers: any[], products: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  
  // New Quote Form State
  const [customerId, setCustomerId] = useState('')
  const [notes, setNotes] = useState('')
  const [validity, setValidity] = useState(7)
  const [discount, setDiscount] = useState(0)
  
  const [items, setItems] = useState<Array<{ productId?: string, name: string, quantity: number, price: number }>>([])
  
  const [successQuote, setSuccessQuote] = useState<any>(null)
  
  // Current Item Draft
  const [draftProduct, setDraftProduct] = useState('')
  const [draftName, setDraftName] = useState('')
  const [draftPrice, setDraftPrice] = useState(0)
  const [draftQuantity, setDraftQuantity] = useState(1)

  const filteredQuotes = quotes.filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    const cName = q.customer?.name?.toLowerCase() || '';
    return cName.includes(s) || q.status.toLowerCase().includes(s);
  })

  function handleDraftProductChange(id: string) {
    setDraftProduct(id)
    if (id) {
      const p = products.find(prod => prod.id === id)
      if (p) {
        setDraftName(p.name)
        setDraftPrice(p.salePrice)
      }
    } else {
      setDraftName('')
      setDraftPrice(0)
    }
  }

  function addItem() {
    if (!draftName || draftPrice <= 0 || draftQuantity <= 0) return
    setItems([...items, {
      productId: draftProduct || undefined,
      name: draftName,
      price: draftPrice,
      quantity: draftQuantity
    }])
    // Reset draft
    setDraftProduct('')
    setDraftName('')
    setDraftPrice(0)
    setDraftQuantity(1)
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const total = subtotal - discount

  async function handleSaveQuote(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      alert("Adicione pelo menos um item ao orçamento.")
      return
    }

    const res = await createQuote({
      customerId: customerId || null,
      totalAmount: total,
      discount: discount,
      validity: validity,
      notes: notes,
      items: items
    })

    if (res.error) {
      alert(res.error)
    } else {
      setSuccessQuote(res.quote)
      // Reset form
      setCustomerId('')
      setNotes('')
      setDiscount(0)
      setItems([])
    }
  }

  function handleSendWhatsapp(q: any) {
    let text = `*ORÇAMENTO - ${q.id.slice(-6).toUpperCase()}*\n\n`
    if (q.customer?.name) {
      text += `Cliente: ${q.customer.name}\n\n`
    }
    text += `*Itens:*\n`
    
    // items can come from table (q.items) or just after creation.
    // If it's just created, we might only have what the server returns.
    // Let's ensure we have items.
    const quoteItems = q.items || []
    quoteItems.forEach((item: any) => {
      text += `- ${item.name} (${item.quantity}x): ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}\n`
    })
    
    text += `\n*Subtotal:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(q.totalAmount + q.discount)}\n`
    if (q.discount > 0) {
      text += `*Desconto:* - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(q.discount)}\n`
    }
    text += `*TOTAL:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(q.totalAmount)}\n\n`
    text += `Validade: ${q.validity} dias.\n`
    
    const encodedText = encodeURIComponent(text)
    
    let phone = q.customer?.whatsapp || q.customer?.phone || ''
    phone = phone.replace(/\D/g, '')
    
    if (phone) {
      window.open(`https://wa.me/55${phone}?text=${encodedText}`, '_blank')
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank')
    }
  }

  async function handleStatus(id: string, status: string) {
    await updateQuoteStatus(id, status)
  }

  async function handleDelete(id: string) {
    if (confirm('Deseja excluir este orçamento?')) {
      await deleteQuote(id)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Orçamentos</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Gerencie e emita orçamentos para seus clientes.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: '8px' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Novo Orçamento
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', width: '350px', maxWidth: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou status..." 
              className="input" 
              style={{ paddingLeft: '40px', width: '100%' }} 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map(q => (
              <tr key={q.id}>
                <td>{new Date(q.createdAt).toLocaleDateString('pt-BR')}</td>
                <td style={{ fontWeight: '500' }}>{q.customer?.name || 'Cliente Não Informado'}</td>
                <td style={{ fontWeight: '600' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(q.totalAmount)}</td>
                <td>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontWeight: '600',
                    backgroundColor: q.status === 'APROVADO' ? 'rgba(16, 185, 129, 0.1)' : q.status === 'REJEITADO' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: q.status === 'APROVADO' ? 'var(--color-success)' : q.status === 'REJEITADO' ? 'var(--color-error)' : '#d97706'
                  }}>
                    {q.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={`/quotes/${q.id}`} target="_blank" className="btn btn-outline" style={{ padding: '6px', color: '#3b82f6' }} title="PDF / Imprimir">
                      <Download size={16} />
                    </a>
                    <button onClick={() => handleSendWhatsapp(q)} className="btn btn-outline" style={{ padding: '6px', color: '#10b981' }} title="WhatsApp">
                      <MessageCircle size={16} />
                    </button>
                    {q.status === 'PENDENTE' && (
                      <>
                        <button onClick={() => handleStatus(q.id, 'APROVADO')} className="btn btn-outline" style={{ padding: '6px', color: 'var(--color-success)' }} title="Aprovar">
                          <CheckCircle size={16} />
                        </button>
                        <button onClick={() => handleStatus(q.id, 'REJEITADO')} className="btn btn-outline" style={{ padding: '6px', color: 'var(--color-error)' }} title="Rejeitar">
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(q.id)} className="btn btn-outline" style={{ padding: '6px', color: 'var(--color-error)' }} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredQuotes.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  Nenhum orçamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Novo Orçamento</h2>
              <button onClick={() => { setIsModalOpen(false); setSuccessQuote(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            {successQuote ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', marginBottom: '16px' }}>
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Orçamento Salvo!</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>O que você deseja fazer agora?</p>
                
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <a href={`/quotes/${successQuote.id}`} target="_blank" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', borderColor: '#3b82f6' }}>
                    <Download size={20} /> Baixar PDF / Imprimir
                  </a>
                  <button onClick={() => handleSendWhatsapp(successQuote)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', borderColor: '#10b981' }}>
                    <MessageCircle size={20} /> Enviar por WhatsApp
                  </button>
                </div>
                
                <button onClick={() => { setIsModalOpen(false); setSuccessQuote(null); }} className="btn btn-outline" style={{ marginTop: '32px' }}>
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveQuote} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="grid-responsive-2-1">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Cliente</label>
                  <select className="input" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                    <option value="">Selecione um cliente (Opcional)</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Validade (Dias)</label>
                  <input type="number" className="input" value={validity} onChange={e => setValidity(Number(e.target.value))} min={1} />
                </div>
              </div>

              {/* Itens do Orçamento */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Itens do Orçamento</h3>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Produto do Estoque</label>
                    <select className="input" value={draftProduct} onChange={e => handleDraftProductChange(e.target.value)}>
                      <option value="">Item Manual (Serviço/Outro)</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.salePrice)}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Descrição do Item</label>
                    <input type="text" className="input" value={draftName} onChange={e => setDraftName(e.target.value)} placeholder="Ex: Mão de Obra" />
                  </div>
                  <div style={{ width: '120px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Preço Unt.</label>
                    <input type="number" step="0.01" className="input" value={draftPrice} onChange={e => setDraftPrice(Number(e.target.value))} />
                  </div>
                  <div style={{ width: '100px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Qtd</label>
                    <input type="number" className="input" value={draftQuantity} onChange={e => setDraftQuantity(Number(e.target.value))} min="1" />
                  </div>
                  <button type="button" className="btn btn-outline" onClick={addItem}>Adicionar</button>
                </div>

                <table className="table" style={{ fontSize: '0.875rem' }}>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Qtd</th>
                      <th>V. Unit.</th>
                      <th>Total</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</td>
                        <td style={{ fontWeight: '600' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</td>
                        <td>
                          <button type="button" onClick={() => removeItem(idx)} style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-muted)' }}>Nenhum item adicionado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid-responsive-2-1">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Observações / Condições</label>
                  <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Garantia, condições de pagamento, etc..."></textarea>
                </div>
                
                <div style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span>Subtotal:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem' }}>Desconto (R$):</span>
                    <input type="number" step="0.01" className="input" style={{ width: '100px', padding: '4px 8px', minHeight: '32px' }} value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.25rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                    <span>Total:</span>
                    <span style={{ color: 'var(--color-primary)' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                  </div>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                Salvar Orçamento
              </button>
            </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

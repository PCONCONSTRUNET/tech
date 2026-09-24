'use client'

import { useState } from 'react'
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Download, X, Search, Trash2, Edit2, Filter, Calendar } from 'lucide-react'
import { createTransaction, deleteTransaction, updateTransaction } from '@/actions/finance'

export default function PaymentsClient({ transactions, categories, customers = [] }: { transactions: any[], categories: any[], customers?: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [transactionType, setTransactionType] = useState<'RECEITA' | 'DESPESA'>('RECEITA')
  const [paymentMethod, setPaymentMethod] = useState('PIX')
  
  // Filtros Avançados
  const [filterType, setFilterType] = useState<'ALL' | 'RECEITA' | 'DESPESA'>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [filterCustomer, setFilterCustomer] = useState<string>('ALL')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [customerSearchModal, setCustomerSearchModal] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  function setQuickFilter(type: 'HOJE' | 'SEMANA' | 'MES' | 'TUDO') {
    if (type === 'TUDO') {
      setDateFrom('')
      setDateTo('')
      return
    }
    const today = new Date()
    let from = new Date()
    let to = new Date()
    
    if (type === 'HOJE') {
      // both today
    } else if (type === 'SEMANA') {
      from.setDate(today.getDate() - 7)
    } else if (type === 'MES') {
      from = new Date(today.getFullYear(), today.getMonth(), 1)
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    }
    
    setDateFrom(from.toISOString().split('T')[0])
    setDateTo(to.toISOString().split('T')[0])
  }

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (filterCategory !== 'ALL') {
      if (!t.category || t.category.id !== filterCategory) return false;
    }
    if (filterCustomer !== 'ALL') {
      if (t.customerId !== filterCustomer) return false;
    }
    if (filterPaymentMethod !== 'ALL') {
      if (t.paymentMethod !== filterPaymentMethod) return false;
    }
    if (dateFrom) {
      if (new Date(t.date) < new Date(dateFrom + 'T00:00:00')) return false;
    }
    if (dateTo) {
      if (new Date(t.date) > new Date(dateTo + 'T23:59:59')) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(s);
      const matchCat = t.category?.name?.toLowerCase().includes(s);
      const matchCust = t.customer?.name?.toLowerCase().includes(s);
      if (!matchDesc && !matchCat && !matchCust) return false;
    }
    return true;
  })

  const totalReceitas = filteredTransactions.filter(t => t.type === 'RECEITA').reduce((acc, t) => acc + t.amount, 0)
  const totalDespesas = filteredTransactions.filter(t => t.type === 'DESPESA').reduce((acc, t) => acc + t.amount, 0)
  const saldo = totalReceitas - totalDespesas
  const maxVal = Math.max(totalReceitas, totalDespesas, 1)

  async function handleAdd(formData: FormData) {
    formData.append('type', transactionType)
    formData.append('paymentMethod', paymentMethod)
    
    if (isEditing && selectedTransaction) {
      await updateTransaction(selectedTransaction.id, formData)
    } else {
      await createTransaction(formData)
    }
    
    setIsModalOpen(false)
    setIsEditing(false)
    setSelectedTransaction(null)
  }

  async function handleDelete(id: string) {
    setDeletingTxId(id)
  }

  async function confirmDelete() {
    if (deletingTxId) {
      await deleteTransaction(deletingTxId)
      setSelectedTransaction(null)
      setDeletingTxId(null)
    }
  }

  function openEditModal(t: any) {
    setSelectedTransaction(t)
    setTransactionType(t.type)
    setPaymentMethod(t.paymentMethod || 'PIX')
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const gerarComprovante = (t: any) => {
    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    const dt = new Date(t.date).toLocaleString('pt-BR')
    const html = `<html><head><title>Comprovante - ${t.description}</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; }
        .logo { max-height: 60px; margin-bottom: 10px; }
        .title { font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .label { color: #64748b; font-size: 14px; }
        .val { font-weight: 600; font-size: 15px; text-align: right; }
        .total { font-size: 24px; font-weight: 800; color: ${t.type === 'RECEITA' ? '#10b981' : '#ef4444'}; margin-top: 10px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }
      </style>
      </head><body>
        <div class="header">
          <img src="${window.location.origin}/logo.png" class="logo" alt="Digitech" onerror="this.style.display='none'" />
          <div class="title">Comprovante de ${t.type === 'RECEITA' ? 'Pagamento' : 'Despesa'}</div>
          <div style="color:#64748b; margin-top:5px">Gerado em ${new Date().toLocaleString('pt-BR')}</div>
        </div>
        <div class="row"><div class="label">Descrição</div><div class="val">${t.description}</div></div>
        <div class="row"><div class="label">Data da Transação</div><div class="val">${dt}</div></div>
        <div class="row"><div class="label">Categoria</div><div class="val">${t.category?.name || '—'}</div></div>
        <div class="row"><div class="label">Método</div><div class="val">${t.paymentMethod || '—'}</div></div>
        <div class="row"><div class="label">Status</div><div class="val">${t.status === 'PAGO' ? 'Concluída' : 'Pendente'}</div></div>
        <div class="row"><div class="label">Cliente</div><div class="val">${t.customer?.name || (t.customerId ? 'Cliente Oculto' : '—')}</div></div>
        ${t.customer?.document ? `<div class="row"><div class="label">CPF/CNPJ do Cliente</div><div class="val">${t.customer.document}</div></div>` : ''}
        
        <div style="margin-top: 30px; text-align: right;">
          <div class="label">Valor Total</div>
          <div class="total">${fmt(t.amount)}</div>
        </div>
        <div class="footer">
          Este documento não possui valor fiscal.<br>
          Obrigado pela preferência!
        </div>
        <script>window.onload=function(){window.print()}<\/script>
      </body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }

  return (
    <>
      <style>{`
        .mobile-cards { display: none; }
        .desktop-table { display: block; overflow-x: auto; }
        @media (max-width: 768px) {
          .desktop-table { display: none !important; }
          .mobile-cards { display: flex !important; flex-direction: column; gap: 12px; padding: 12px 0; }
          .mobile-header-actions { flex-direction: column; align-items: stretch; gap: 12px; }
          .mobile-header-actions button { width: 100%; justify-content: center; }
          .mobile-filters-row { flex-direction: column; align-items: stretch !important; gap: 12px; }
          .mobile-filters-row > div { width: 100% !important; max-width: none !important; }
          .mobile-balance-card { flex-direction: column !important; }
          .mobile-balance-card > div:first-child { width: 100% !important; border-right: none !important; border-bottom: 1px solid var(--color-border); padding-bottom: 16px; margin-bottom: 8px; }
          .quick-filters { overflow-x: auto; padding-bottom: 4px; white-space: nowrap; flex-wrap: nowrap !important; justify-content: flex-start !important; width: 100%; }
        }
      `}</style>
      <div className="mobile-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Pagamentos</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Análise detalhada do extrato e movimentações.</p>
        </div>
        <button className="btn btn-outline" style={{ gap: '8px' }} onClick={() => window.print()}>
          <Download size={18} /> Exportar
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="mobile-balance-card" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          
          {/* Gráfico Simplificado */}
          <div style={{ width: '200px', height: '120px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', padding: '8px', borderRight: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', height: '100%' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-success)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalReceitas)}
              </span>
              <div style={{ width: '32px', backgroundColor: 'var(--color-success)', height: `${(totalReceitas / maxVal) * 80}%`, borderRadius: '4px 4px 0 0', minHeight: '4px', transition: 'height 0.3s ease' }}></div>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Entradas</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', height: '100%' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-error)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalDespesas)}
              </span>
              <div style={{ width: '32px', backgroundColor: 'var(--color-error)', height: `${(totalDespesas / maxVal) * 80}%`, borderRadius: '4px 4px 0 0', minHeight: '4px', transition: 'height 0.3s ease' }}></div>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Saídas</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Saldo do Período</h3>
            <p style={{ fontSize: '1.75rem', fontWeight: '700', color: saldo >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            </p>
            <div className="quick-filters" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={() => setQuickFilter('TUDO')} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>Tudo</button>
              <button onClick={() => setQuickFilter('HOJE')} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>Hoje</button>
              <button onClick={() => setQuickFilter('SEMANA')} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>Últimos 7 dias</button>
              <button onClick={() => setQuickFilter('MES')} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>Este Mês</button>
            </div>
          </div>
          
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="mobile-filters-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: showFilters ? '16px' : '0' }}>
          <div className="mobile-filters-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Buscar por descrição, categoria ou cliente..." 
                className="input" 
                style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button 
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ gap: '8px', whiteSpace: 'nowrap' }}
            >
              <Filter size={18} /> Filtros Avançados
            </button>
          </div>
          
          <div className="mobile-filters-row" style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-outline" 
              style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)', whiteSpace: 'nowrap' }}
              onClick={() => { setTransactionType('RECEITA'); setIsEditing(false); setIsModalOpen(true); }}
            >
              + Nova Entrada
            </button>
            <button 
              className="btn btn-outline" 
              style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)', whiteSpace: 'nowrap' }}
              onClick={() => { setTransactionType('DESPESA'); setIsEditing(false); setIsModalOpen(true); }}
            >
              - Nova Saída
            </button>
          </div>
        </div>

        {/* Painel de Filtros Avançados */}
        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-muted)' }}>Tipo</label>
              <select className="input" value={filterType} onChange={e => { setFilterType(e.target.value as any); setFilterCategory('ALL'); }}>
                <option value="ALL">Todos os Tipos</option>
                <option value="RECEITA">Entradas (+)</option>
                <option value="DESPESA">Saídas (-)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-muted)' }}>Data Inicial</label>
              <input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-muted)' }}>Data Final</label>
              <input type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-muted)' }}>Cliente</label>
              <select className="input" value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)}>
                <option value="ALL">Todos os Clientes</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-muted)' }}>Categoria</label>
              <select className="input" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="ALL">Todas as Categorias</option>
                {categories.filter(c => filterType === 'ALL' || c.type === filterType).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-muted)' }}>Forma de Pagto</label>
              <select className="input" value={filterPaymentMethod} onChange={e => setFilterPaymentMethod(e.target.value)}>
                <option value="ALL">Todas</option>
                <option value="PIX">Pix</option>
                <option value="CARTAO">Cartão</option>
                <option value="DINHEIRO">Dinheiro</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="card table-container">
        <div className="desktop-table">
          <table className="table">
            <thead>
              <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Cliente</th>
              <th>Categoria</th>
              <th>Pagto</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(t => (
              <tr key={t.id} onClick={() => setSelectedTransaction(t)} style={{ cursor: 'pointer' }} className="hover:bg-gray-50">
                <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                <td style={{ fontWeight: '500' }}>{t.description}</td>
                <td>{t.customer?.name ? <span style={{ fontSize: '0.85rem' }}>{t.customer.name}</span> : '-'}</td>
                <td>
                  {t.category ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                      {t.category.name}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  {t.paymentMethod === 'PIX' && <img src="/pix.png" alt="Pix" style={{ width: '24px', height: '24px' }} title="Pix" />}
                  {t.paymentMethod === 'CARTAO' && <img src="/cartao.png" alt="Cartão" style={{ width: '24px', height: '24px' }} title="Cartão" />}
                  {t.paymentMethod === 'DINHEIRO' && <img src="/dinheiro.png" alt="Dinheiro" style={{ width: '24px', height: '24px' }} title="Dinheiro" />}
                  {!t.paymentMethod && '-'}
                </td>
                <td>
                  {t.type === 'RECEITA' ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Entrada</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Saída</span>
                  )}
                </td>
                <td style={{ fontWeight: '600' }}>
                  {t.type === 'DESPESA' ? '-' : ''}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                    {t.status || 'Pago'}
                  </span>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  Nenhuma movimentação encontrada para estes filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        
        {filteredTransactions.length > 0 && (
          <div className="mobile-cards">
            {filteredTransactions.map(t => (
              <div key={t.id} onClick={() => setSelectedTransaction(t)} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--color-surface)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{t.description}</div>
                  <div style={{ fontWeight: '800', color: t.type === 'RECEITA' ? 'var(--color-success)' : 'var(--color-error)', fontSize: '1rem' }}>
                    {t.type === 'DESPESA' ? '-' : '+'}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t.customer?.name || 'Sem cliente'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{t.category?.name || 'Sem categoria'}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: t.type === 'RECEITA' ? 'var(--color-success)' : 'var(--color-error)', backgroundColor: t.type === 'RECEITA' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      {t.type === 'RECEITA' ? 'Entrada' : 'Saída'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      {t.status || 'Pago'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {t.paymentMethod === 'PIX' && <img src="/pix.png" alt="Pix" style={{ width: '20px', height: '20px' }} />}
                    {t.paymentMethod === 'CARTAO' && <img src="/cartao.png" alt="Cartão" style={{ width: '20px', height: '20px' }} />}
                    {t.paymentMethod === 'DINHEIRO' && <img src="/dinheiro.png" alt="Dinheiro" style={{ width: '20px', height: '20px' }} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                {isEditing ? 'Editar Transação' : `Nova ${transactionType === 'RECEITA' ? 'Receita' : 'Despesa'}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid-responsive-2">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Descrição *</label>
                  <input name="description" type="text" className="input" required defaultValue={isEditing ? selectedTransaction?.description : ''} placeholder="Ex: Pagamento de Luz" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Categoria</label>
                  <input name="category" type="text" className="input" list="transaction-category-list" defaultValue={isEditing ? selectedTransaction?.category?.name : ''} placeholder="Ex: Contas, Salário..." />
                  <datalist id="transaction-category-list">
                    {categories.filter(c => c.type === transactionType).map(c => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid-responsive-2">
                <div style={{ gridColumn: 'span 2', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Vincular a um Cliente (Opcional)</label>
                  <input type="hidden" name="customerId" value={selectedCustomerId} />
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      className="input"
                      placeholder="Buscar por nome, CPF ou telefone..."
                      value={customerSearchModal}
                      onChange={e => { setCustomerSearchModal(e.target.value); setShowCustomerDropdown(true); setSelectedCustomerId('') }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      style={{ paddingLeft: '32px' }}
                      autoComplete="off"
                    />
                  </div>
                  {showCustomerDropdown && customerSearchModal.length > 0 && (
                    <div style={{ position: 'absolute', zIndex: 99, top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '180px', overflowY: 'auto', marginTop: '4px' }}>
                      {customers
                        .filter((c: any) => {
                          const q = customerSearchModal.toLowerCase()
                          return c.name?.toLowerCase().includes(q) || c.document?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.whatsapp?.toLowerCase().includes(q)
                        })
                        .slice(0, 8)
                        .map((c: any) => (
                          <div key={c.id}
                            onClick={() => { setSelectedCustomerId(c.id); setCustomerSearchModal(c.name); setShowCustomerDropdown(false) }}
                            style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
                          >
                            <div style={{ fontWeight: '600' }}>{c.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{c.document && `CPF: ${c.document}`}{c.phone && ` • ${c.phone}`}</div>
                          </div>
                        ))}
                      {customers.filter((c: any) => {
                        const q = customerSearchModal.toLowerCase()
                        return c.name?.toLowerCase().includes(q) || c.document?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q)
                      }).length === 0 && (
                        <div style={{ padding: '12px 14px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Nenhum cliente encontrado</div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Observações (Opcional)</label>
                  <textarea name="notes" className="input" defaultValue={isEditing ? selectedTransaction?.notes : ''} placeholder="Detalhes adicionais sobre a transação..." rows={2} style={{ resize: 'vertical' }}></textarea>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Forma de Pagamento</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div onClick={() => setPaymentMethod('PIX')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <div style={{ padding: '8px', border: `2px solid ${paymentMethod === 'PIX' ? 'var(--color-primary)' : 'transparent'}`, borderRadius: '8px', backgroundColor: 'var(--color-bg)' }}>
                      <img src="/pix.png" alt="Pix" style={{ width: '32px', height: '32px' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Pix</span>
                  </div>
                  <div onClick={() => setPaymentMethod('CARTAO')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <div style={{ padding: '8px', border: `2px solid ${paymentMethod === 'CARTAO' ? 'var(--color-primary)' : 'transparent'}`, borderRadius: '8px', backgroundColor: 'var(--color-bg)' }}>
                      <img src="/cartao.png" alt="Cartão" style={{ width: '32px', height: '32px' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Cartão</span>
                  </div>
                  <div onClick={() => setPaymentMethod('DINHEIRO')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <div style={{ padding: '8px', border: `2px solid ${paymentMethod === 'DINHEIRO' ? 'var(--color-primary)' : 'transparent'}`, borderRadius: '8px', backgroundColor: 'var(--color-bg)' }}>
                      <img src="/dinheiro.png" alt="Dinheiro" style={{ width: '32px', height: '32px' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Dinheiro</span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Valor (R$) *</label>
                <input name="amount" type="number" step="0.01" min="0.01" defaultValue={isEditing ? selectedTransaction?.amount : ''} className="input" required />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  marginTop: '16px', 
                  backgroundColor: transactionType === 'RECEITA' ? 'var(--color-success)' : 'var(--color-error)' 
                }}
              >
                {isEditing ? 'Atualizar Transação' : 'Salvar Transação'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedTransaction && !isEditing && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Detalhes da Movimentação</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => gerarComprovante(selectedTransaction)} 
                  className="btn btn-outline" 
                  style={{ padding: '8px', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                  title="Gerar Comprovante"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => openEditModal(selectedTransaction)} 
                  className="btn btn-outline" 
                  style={{ padding: '8px' }}
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(selectedTransaction.id)} 
                  className="btn btn-outline" 
                  style={{ padding: '8px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setSelectedTransaction(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}><X size={20} /></button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Descrição</p>
                <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{selectedTransaction.description}</p>
              </div>

              <div className="grid-responsive-2">
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Valor</p>
                  <p style={{ fontWeight: '700', fontSize: '1.25rem', color: selectedTransaction.type === 'RECEITA' ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {selectedTransaction.type === 'DESPESA' ? '-' : ''}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Data</p>
                  <p style={{ fontWeight: '500' }}>{new Date(selectedTransaction.date).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Tipo</p>
                  <p style={{ fontWeight: '500' }}>{selectedTransaction.type === 'RECEITA' ? 'Receita' : 'Despesa'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Categoria</p>
                  <p style={{ fontWeight: '500' }}>{selectedTransaction.category?.name || 'Sem Categoria'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Forma de Pagamento</p>
                  <p style={{ fontWeight: '500' }}>{selectedTransaction.paymentMethod || 'Não informada'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Cliente Vinculado</p>
                  <p style={{ fontWeight: '500' }}>
                    {selectedTransaction.customer?.name || (selectedTransaction.customerId ? 'Cliente Oculto/Excluído' : 'Nenhum')}
                  </p>
                </div>
              </div>

              {selectedTransaction.notes && (
                <div style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Observações</p>
                  <p style={{ fontWeight: '500', whiteSpace: 'pre-wrap' }}>{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {deletingTxId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '360px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>Confirmar Exclusão</h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.5' }}>
              Tem certeza que deseja excluir esta transação? Essa ação não poderá ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setDeletingTxId(null)}
                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer' }}
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

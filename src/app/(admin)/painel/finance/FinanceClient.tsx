'use client'

import { useState } from 'react'
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Download, X, Search, Trash2, Edit2 } from 'lucide-react'
import { createTransaction, deleteTransaction, updateTransaction } from '@/actions/finance'

export default function FinanceClient({ transactions, categories, customers = [] }: { transactions: any[], categories: any[], customers?: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [transactionType, setTransactionType] = useState<'RECEITA' | 'DESPESA'>('RECEITA')
  const [paymentMethod, setPaymentMethod] = useState('PIX')
  const [filterType, setFilterType] = useState<'ALL' | 'RECEITA' | 'DESPESA'>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (filterCategory !== 'ALL') {
      if (!t.category || t.category.id !== filterCategory) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(s);
      const matchCat = t.category?.name.toLowerCase().includes(s);
      if (!matchDesc && !matchCat) return false;
    }
    return true;
  })

  const totalIncome = transactions.filter(t => t.type === 'RECEITA').reduce((acc, t) => acc + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'DESPESA').reduce((acc, t) => acc + t.amount, 0)
  const balance = totalIncome - totalExpense

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
    if (confirm('Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
      await deleteTransaction(id)
      setSelectedTransaction(null)
    }
  }

  function openEditModal(t: any) {
    setSelectedTransaction(t)
    setTransactionType(t.type)
    setPaymentMethod(t.paymentMethod || 'PIX')
    setIsEditing(true)
    setIsModalOpen(true)
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Financeiro</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Controle de caixa, receitas e despesas.</p>
        </div>
        <button className="btn btn-outline" style={{ gap: '8px' }} onClick={() => window.print()}>
          <Download size={18} /> Exportar Relatório
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '12px', borderRadius: '12px' }}>
              <ArrowUpCircle size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'var(--color-text-muted)' }}>Receitas Totais</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
          </div>
        </div>
        
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '12px', borderRadius: '12px' }}>
              <ArrowDownCircle size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'var(--color-text-muted)' }}>Despesas Totais</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
          </div>
        </div>

        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--color-primary)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '12px', borderRadius: '12px' }}>
              <DollarSign size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Saldo Atual</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginRight: '8px' }}>Transações</h2>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Buscar descrição ou categoria..." 
                className="input" 
                style={{ paddingLeft: '40px', width: '260px' }} 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="input" 
              value={filterType} 
              onChange={e => {
                setFilterType(e.target.value as any)
                setFilterCategory('ALL') // Reset category when changing type
              }}
              style={{ width: '160px' }}
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="RECEITA">Apenas Receitas</option>
              <option value="DESPESA">Apenas Despesas</option>
            </select>
            <select 
              className="input" 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
              style={{ width: '180px' }}
            >
              <option value="ALL">Todas as Categorias</option>
              {categories
                .filter(c => filterType === 'ALL' || c.type === filterType)
                .map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {filterType === 'ALL' ? (c.type === 'RECEITA' ? '(+)' : '(-)') : ''}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-outline" 
              style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
              onClick={() => { setTransactionType('RECEITA'); setIsEditing(false); setIsModalOpen(true); }}
            >
              + Nova Receita
            </button>
            <button 
              className="btn btn-outline" 
              style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
              onClick={() => { setTransactionType('DESPESA'); setIsEditing(false); setIsModalOpen(true); }}
            >
              - Nova Despesa
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
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
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    Nenhuma transação encontrada.
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                Nova {transactionType === 'RECEITA' ? 'Receita' : 'Despesa'}
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
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Vincular a um Cliente (Opcional)</label>
                  <select name="customerId" className="input" defaultValue={isEditing ? (selectedTransaction?.customerId || '') : ''}>
                    <option value="">Nenhum cliente</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Detalhes da Transação</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
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
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setSelectedTransaction(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

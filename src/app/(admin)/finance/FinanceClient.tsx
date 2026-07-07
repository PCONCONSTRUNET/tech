'use client'

import { useState } from 'react'
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Download, X } from 'lucide-react'
import { createTransaction } from '@/actions/finance'

export default function FinanceClient({ transactions }: { transactions: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('INCOME')

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)
  const balance = totalIncome - totalExpense

  async function handleAdd(formData: FormData) {
    formData.append('type', transactionType)
    await createTransaction(formData)
    setIsModalOpen(false)
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Transações</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-outline" 
              style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
              onClick={() => { setTransactionType('INCOME'); setIsModalOpen(true); }}
            >
              + Nova Receita
            </button>
            <button 
              className="btn btn-outline" 
              style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
              onClick={() => { setTransactionType('EXPENSE'); setIsModalOpen(true); }}
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
                <th>Tipo</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td style={{ fontWeight: '500' }}>{t.description}</td>
                  <td>
                    {t.type === 'INCOME' ? (
                      <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>Entrada</span>
                    ) : (
                      <span style={{ color: 'var(--color-error)', fontWeight: '600' }}>Saída</span>
                    )}
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    {t.type === 'EXPENSE' ? '-' : ''}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                  </td>
                  <td>Pago</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    Nenhuma transação registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                Nova {transactionType === 'INCOME' ? 'Receita' : 'Despesa'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Descrição *</label>
                <input name="description" type="text" className="input" required placeholder="Ex: Pagamento de Luz" />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Valor (R$) *</label>
                <input name="amount" type="number" step="0.01" min="0.01" className="input" required />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  marginTop: '16px', 
                  backgroundColor: transactionType === 'INCOME' ? 'var(--color-success)' : 'var(--color-error)' 
                }}
              >
                Salvar Transação
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

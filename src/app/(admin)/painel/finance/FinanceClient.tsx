'use client'

import { useState, useMemo } from 'react'
import { DollarSign, Download, X, Search, Trash2, Edit2, RefreshCw, BarChart2, ChevronDown } from 'lucide-react'
import { createTransaction, deleteTransaction, updateTransaction } from '@/actions/finance'

/* ── helpers ── */
const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const today = () => new Date().toISOString().split('T')[0]

function startOf(period: string): Date {
  const d = new Date()
  if (period === 'hoje')       { d.setHours(0,0,0,0); return d }
  if (period === '7dias')      { d.setDate(d.getDate() - 7); return d }
  if (period === 'mes')        { d.setDate(1); d.setHours(0,0,0,0); return d }
  if (period === 'mesPas')     { d.setMonth(d.getMonth()-1); d.setDate(1); d.setHours(0,0,0,0); return d }
  if (period === '90dias')     { d.setDate(d.getDate() - 90); return d }
  return new Date(0)
}

type SubTab = 'geral' | 'reparos' | 'vendas' | 'areceber' | 'fixas'
type Period = 'hoje' | '7dias' | 'mes' | 'mesPas' | '90dias' | 'todos'

const CATEGORIAS_DESPESA = ['Peças','Aluguel','Energia','Internet','Salários','Marketing','Equipamentos','Outros']
const CATEGORIAS_RECEITA = ['Vendas','Reparos','Serviços','Outros']
const METODOS = ['Pix','Cartão de Crédito','Cartão de Débito','Dinheiro','Transferência','Boleto']

export default function FinanceClient({ transactions, categories, customers = [] }: {
  transactions: any[]; categories: any[]; customers?: any[]
}) {
  const [period, setPeriod]   = useState<Period>('mes')
  const [subTab, setSubTab]   = useState<SubTab>('geral')
  const [search, setSearch]   = useState('')

  // modals
  const [modalType, setModalType]   = useState<'RECEITA'|'DESPESA'|null>(null)
  const [editingTx, setEditingTx]   = useState<any>(null)
  const [detailTx, setDetailTx]     = useState<any>(null)
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null)

  // form
  const [title, setTitle]           = useState('')
  const [amount, setAmount]         = useState('')
  const [txDate, setTxDate]         = useState(today())
  const [category, setCategory]     = useState('')
  const [method, setMethod]         = useState('Pix')
  const [status, setStatus]         = useState<'PAGO'|'PENDENTE'>('PAGO')
  const [customerId, setCustomerId] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerList, setShowCustomerList] = useState(false)

  /* ── period filter ── */
  const periodStart = startOf(period)
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date)
      if (period !== 'todos' && d < periodStart) return false
      if (period === 'mesPas') {
        const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth()-1, 1)
        const end = new Date(now.getFullYear(), now.getMonth(), 0)
        if (d < start || d > end) return false
      }
      if (search) {
        const s = search.toLowerCase()
        if (!t.description?.toLowerCase().includes(s) && !t.category?.name?.toLowerCase().includes(s)) return false
      }
      return true
    })
  }, [transactions, period, search, periodStart])

  const receitas  = filtered.filter(t => t.type === 'RECEITA' && t.status === 'PAGO')
  const despesas  = filtered.filter(t => t.type === 'DESPESA' && t.status === 'PAGO')
  const pendentes = filtered.filter(t => t.status === 'PENDENTE')
  const totalIn   = receitas.reduce((s, t) => s + t.amount, 0)
  const totalOut  = despesas.reduce((s, t) => s + t.amount, 0)
  const balance   = totalIn - totalOut
  const aReceber  = transactions.filter(t => t.type === 'RECEITA' && t.status === 'PENDENTE')
  const vencidas  = aReceber.filter(t => new Date(t.dueDate || t.date) < new Date())

  /* ── DRE Generation ── */
  const gerarDRE = () => {
    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')

    // Breakdown by category
    const receitasPorCategoria = receitas.reduce((acc: any, t) => {
      const cat = t.category?.name || 'Sem categoria'
      acc[cat] = (acc[cat] || 0) + t.amount
      return acc
    }, {})

    const despesasPorCategoria = despesas.reduce((acc: any, t) => {
      const cat = t.category?.name || 'Sem categoria'
      acc[cat] = (acc[cat] || 0) + t.amount
      return acc
    }, {})

    const txRows = filtered.filter(t => t.status === 'PAGO').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => `
      <tr style="border-bottom:1px solid #eee">
        <td style="padding:6px">${fmtDate(t.date)}</td>
        <td style="padding:6px">${t.description}</td>
        <td style="padding:6px">${t.category?.name || '-'}</td>
        <td style="padding:6px;text-align:right;color:${t.type === 'RECEITA' ? '#10b981' : '#ef4444'}">${t.type === 'RECEITA' ? '+' : '-'}${fmt(t.amount)}</td>
      </tr>`).join('')

    const recCatsHtml = Object.entries(receitasPorCategoria).map(([cat, val]) => `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.85rem">
        <span>${cat}</span>
        <span>${fmt(val as number)}</span>
      </div>`).join('')

    const despCatsHtml = Object.entries(despesasPorCategoria).map(([cat, val]) => `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.85rem">
        <span>${cat}</span>
        <span>${fmt(val as number)}</span>
      </div>`).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>DRE</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#111}
        h1{font-size:1.5rem;margin-bottom:4px;text-align:center}
        .header-sub{text-align:center;color:#555;font-size:0.9rem;margin-bottom:32px}
        .section-title{font-size:1.1rem;font-weight:bold;margin-bottom:12px;border-bottom:2px solid #ddd;padding-bottom:4px;margin-top:24px}
        .row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.95rem}
        .row.bold{font-weight:bold;font-size:1.05rem;border-top:1px solid #ddd;padding-top:8px}
        .sub-items{padding-left:16px;margin-bottom:16px;color:#444}
        .result-box{background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:8px;margin-top:24px;text-align:center}
        .result-label{font-size:0.8rem;text-transform:uppercase;font-weight:bold;color:#64748b}
        .result-value{font-size:1.6rem;font-weight:bold;margin-top:4px;color:${balance >= 0 ? '#10b981' : '#ef4444'}}
        table{width:100%;border-collapse:collapse;font-size:0.85rem;margin-top:32px}
        th{background:#f3f4f6;padding:8px 6px;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:.04em}
        tr:nth-child(even){background:#fafafa}
        @media print{button{display:none}}
      </style>
      </head><body>
      <h1>DRE - Demonstração do Resultado do Exercício</h1>
      <div class="header-sub">Período: ${PERIODS.find(p=>p.key===period)?.label || 'Personalizado'} (Gerado em ${new Date().toLocaleString('pt-BR')})</div>
      
      <div class="section-title">1. Receita Bruta</div>
      <div class="row bold"><span>Total de Receitas</span><span style="color:#10b981">${fmt(totalIn)}</span></div>
      <div class="sub-items">${recCatsHtml}</div>

      <div class="section-title">2. Despesas Operacionais</div>
      <div class="row bold"><span>Total de Despesas</span><span style="color:#ef4444">${fmt(totalOut)}</span></div>
      <div class="sub-items">${despCatsHtml}</div>

      <div class="result-box">
        <div class="result-label">3. Lucro Líquido (Resultado do Exercício)</div>
        <div class="result-value">${fmt(balance)}</div>
      </div>

      <div class="section-title">Extrato Detalhado do Período</div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th style="text-align:right">Valor</th></tr></thead>
        <tbody>${txRows}</tbody>
      </table>

      <script>window.onload=function(){window.print()}<\/script>
      </body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }

  /* ── Comprovante Generation ── */
  const gerarComprovante = (t: any) => {
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

  /* ── handlers ── */
  function openNew(type: 'RECEITA'|'DESPESA') {
    setModalType(type); setEditingTx(null)
    setTitle(''); setAmount(''); setTxDate(today())
    setCategory(type === 'DESPESA' ? 'Peças' : 'Vendas')
    setMethod('Pix'); setStatus('PAGO')
    setCustomerId(''); setCustomerSearch(''); setShowCustomerList(false)
  }

  function openEdit(t: any) {
    setModalType(t.type); setEditingTx(t); setDetailTx(null)
    setTitle(t.description || ''); setAmount(String(t.amount || ''))
    setTxDate(new Date(t.date).toISOString().split('T')[0])
    setCategory(t.category?.name || ''); setMethod(t.paymentMethod || 'Pix')
    setStatus(t.status || 'PAGO')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('description', title)
    fd.append('amount', amount)
    fd.append('date', txDate)
    fd.append('category', category)
    fd.append('type', modalType!)
    fd.append('paymentMethod', method)
    fd.append('status', status)
    if (customerId) fd.append('customerId', customerId)
    if (editingTx) await updateTransaction(editingTx.id, fd)
    else await createTransaction(fd)
    setModalType(null); setEditingTx(null)
  }

  async function handleDelete(id: string) {
    setDeletingTxId(id)
  }

  async function confirmDelete() {
    if (deletingTxId) {
      await deleteTransaction(deletingTxId)
      setDetailTx(null)
      setDeletingTxId(null)
    }
  }

  /* ── sub-tab content ── */
  function renderGeral() {
    return (
      <div>
        {/* Big stats */}
        <div className="stats-grid">
          <StatBox label="RECEITAS" value={totalIn} color="#10b981" />
          <StatBox label="DESPESAS" value={totalOut} color="#ef4444" />
          <StatBox label="SALDO LÍQUIDO" value={balance} color={balance >= 0 ? '#10b981' : '#ef4444'} dark />
        </div>

        {/* Transaction list */}
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div className="search-filter-container" style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="Buscar por descrição ou categoria..." className="input"
                style={{ paddingLeft: '30px', height: '36px', fontSize: '0.82rem', width: '100%', boxSizing: 'border-box' }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="desktop-table">
          <table className="table">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                {['DATA','TÍTULO','CATEGORIA','MÉTODO','STATUS','VALOR',''].map(h => (
                  <th key={h} style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const isRec = t.type === 'RECEITA'
                const sc = t.status === 'PAGO'
                  ? { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Concluída' }
                  : { bg: 'rgba(245,158,11,0.1)', color: '#d97706', label: 'Pendente' }
                return (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setDetailTx(t)}>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isRec ? '#10b981' : '#ef4444', flexShrink: 0 }} />
                        {t.description}
                      </div>
                    </td>
                    <td><span style={{ fontSize: '0.72rem', fontWeight: '600', backgroundColor: 'rgba(100,116,139,0.1)', color: '#475569', padding: '2px 8px', borderRadius: '9999px' }}>{t.category?.name || '—'}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t.paymentMethod || '—'}</td>
                    <td><span style={{ fontSize: '0.72rem', fontWeight: '700', backgroundColor: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: '9999px' }}>{sc.label}</span></td>
                    <td style={{ fontWeight: '700', color: isRec ? '#10b981' : '#ef4444', fontSize: '0.9rem' }}>
                      {isRec ? '+' : '-'}{fmt(t.amount)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(t)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: 'var(--color-text-muted)' }}><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7}>
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                    <DollarSign size={36} style={{ opacity: 0.2, marginBottom: '10px' }} />
                    <p>Nenhuma transação neste período.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
          </div>
          {filtered.length > 0 && (
            <div className="mobile-cards" style={{ padding: '0 16px' }}>
              {filtered.map(t => {
                const isRec = t.type === 'RECEITA'
                const sc = t.status === 'PAGO'
                  ? { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Concluída' }
                  : { bg: 'rgba(245,158,11,0.1)', color: '#d97706', label: 'Pendente' }
                return (
                  <div key={t.id} onClick={() => setDetailTx(t)} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--color-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isRec ? '#10b981' : '#ef4444', flexShrink: 0 }} />
                        {t.description}
                      </div>
                      <div style={{ fontWeight: '800', color: isRec ? '#10b981' : '#ef4444', fontSize: '1rem' }}>
                        {isRec ? '+' : '-'}{fmt(t.amount)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: 'rgba(100,116,139,0.1)', color: '#475569', padding: '4px 8px', borderRadius: '6px' }}>{t.category?.name || '—'}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: '9999px' }}>{sc.label}</span>
                      <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(t)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(t.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderAReceber() {
    return (
      <div>
        <div className="stats-grid">
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total a receber</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{fmt(aReceber.reduce((s,t)=>s+t.amount,0))}</div>
          </div>
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Vencidas</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ef4444' }}>{fmt(vencidas.reduce((s,t)=>s+t.amount,0))}</div>
          </div>
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>A vencer (7 dias)</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f59e0b' }}>{fmt(0)}</div>
          </div>
        </div>

        <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div className="search-filter-container" style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="Buscar por cliente ou OS..." className="input"
                style={{ paddingLeft: '30px', height: '36px', fontSize: '0.82rem', width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>
          {aReceber.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
              <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>Nenhuma dívida em aberto</p>
              <p style={{ fontSize: '0.78rem' }}>Quando você registrar uma OS ou venda a prazo, ela aparecerá aqui.</p>
            </div>
          ) : (
            <>
              <div className="desktop-table">
                <table className="table">
                  <thead><tr style={{ backgroundColor: 'var(--color-bg)' }}>
                    {['CLIENTE','DESCRIÇÃO','VENCIMENTO','VALOR','STATUS','AÇÕES'].map(h => (
                      <th key={h} style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.07em' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {aReceber.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: '600', fontSize: '0.875rem' }}>{t.customer?.name || '—'}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{t.description}</td>
                        <td style={{ fontSize: '0.8rem' }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '—'}</td>
                        <td style={{ fontWeight: '700', color: '#3b82f6' }}>{fmt(t.amount)}</td>
                        <td><span style={{ fontSize: '0.7rem', fontWeight: '700', backgroundColor: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '3px 10px', borderRadius: '9999px' }}>Pendente</span></td>
                        <td>
                          <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#ef4444', fontSize: '0.72rem', fontWeight: '600', fontFamily: 'inherit' }}>
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mobile-cards" style={{ padding: '0 16px' }}>
                {aReceber.map(t => (
                  <div key={t.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--color-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{t.customer?.name || '—'}</div>
                      <div style={{ fontWeight: '800', color: '#3b82f6', fontSize: '1rem' }}>{fmt(t.amount)}</div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t.description}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: 'rgba(100,116,139,0.1)', color: '#475569', padding: '4px 8px', borderRadius: '6px' }}>
                        Venc: {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '—'}
                      </span>
                      <button onClick={() => handleDelete(t.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '0.76rem', color: '#3b82f6' }}>
          ℹ️ <strong>A Receber:</strong> estes valores que seus clientes ainda não pagaram. Esses valores <strong>não entram no caixa</strong> até que o pagamento seja registrado.
        </div>
      </div>
    )
  }

  function renderFilteredTable(list: any[], emptyMsg: string) {
    const total = list.reduce((s, t) => s + t.amount, 0);
    const inCount = list.filter(t => t.type === 'RECEITA').length;
    const outCount = list.filter(t => t.type === 'DESPESA').length;

    return (
      <div>
        <div className="stats-grid">
          <StatBox label="TOTAL NO PERÍODO" value={total} color="#3b82f6" />
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Qtd. Entradas</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>{inCount}</div>
          </div>
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Qtd. Saídas</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ef4444' }}>{outCount}</div>
          </div>
        </div>

        <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div className="desktop-table">
            <table className="table">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                {['DATA','TÍTULO','CATEGORIA','MÉTODO','STATUS','VALOR',''].map(h => (
                  <th key={h} style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(t => {
                const isRec = t.type === 'RECEITA'
                const sc = t.status === 'PAGO'
                  ? { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Concluída' }
                  : { bg: 'rgba(245,158,11,0.1)', color: '#d97706', label: 'Pendente' }
                return (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setDetailTx(t)}>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isRec ? '#10b981' : '#ef4444', flexShrink: 0 }} />
                        {t.description}
                      </div>
                    </td>
                    <td><span style={{ fontSize: '0.72rem', fontWeight: '600', backgroundColor: 'rgba(100,116,139,0.1)', color: '#475569', padding: '2px 8px', borderRadius: '9999px' }}>{t.category?.name || '—'}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t.paymentMethod || '—'}</td>
                    <td><span style={{ fontSize: '0.72rem', fontWeight: '700', backgroundColor: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: '9999px' }}>{sc.label}</span></td>
                    <td style={{ fontWeight: '700', color: isRec ? '#10b981' : '#ef4444', fontSize: '0.9rem' }}>
                      {isRec ? '+' : '-'}{fmt(t.amount)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(t)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: 'var(--color-text-muted)' }}><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {list.length === 0 && (
                <tr><td colSpan={7}>
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                    <p>{emptyMsg}</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
          </div>
          
          {list.length > 0 && (
            <div className="mobile-cards" style={{ padding: '0 16px' }}>
              {list.map(t => {
                const isRec = t.type === 'RECEITA'
                const sc = t.status === 'PAGO'
                  ? { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Concluída' }
                  : { bg: 'rgba(245,158,11,0.1)', color: '#d97706', label: 'Pendente' }
                return (
                  <div key={t.id} onClick={() => setDetailTx(t)} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--color-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isRec ? '#10b981' : '#ef4444', flexShrink: 0 }} />
                        {t.description}
                      </div>
                      <div style={{ fontWeight: '800', color: isRec ? '#10b981' : '#ef4444', fontSize: '1rem' }}>
                        {isRec ? '+' : '-'}{fmt(t.amount)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: 'rgba(100,116,139,0.1)', color: '#475569', padding: '4px 8px', borderRadius: '6px' }}>{t.category?.name || '—'}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: '9999px' }}>{sc.label}</span>
                      <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(t)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(t.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  const SUB_TABS: { key: SubTab; label: string }[] = [
    { key: 'geral',     label: 'Visão Geral' },
    { key: 'reparos',   label: 'Reparos e Estoque' },
    { key: 'vendas',    label: 'Vendas e Loja' },
    { key: 'areceber',  label: 'A Receber' },
    { key: 'fixas',     label: 'Despesas Fixas' },
  ]

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'hoje',   label: 'Hoje' },
    { key: '7dias',  label: '7 dias' },
    { key: 'mes',    label: 'Mês Atual' },
    { key: 'mesPas', label: 'Mês Passado' },
    { key: '90dias', label: '90 dias' },
    { key: 'todos',  label: 'Personalizar' },
  ]

  const isDespesa = modalType === 'DESPESA'

  return (
    <>
      <style>{`
        .mobile-cards { display: none; }
        .desktop-table { display: block; overflow-x: auto; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 20px; }
        @media (max-width: 768px) {
          .desktop-table { display: none !important; }
          .mobile-cards { display: flex !important; flex-direction: column; gap: 12px; padding: 12px 0; }
          .stats-grid { grid-template-columns: 1fr; }
          .tabs-container { overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
          .search-filter-container { flex-direction: column; align-items: stretch; width: 100%; }
          .search-filter-container input { width: 100% !important; }
          .actions-container { justify-content: flex-start !important; }
          .period-pills { overflow-x: auto; white-space: nowrap; width: 100%; justify-content: flex-start; padding-bottom: 4px; border: none !important; background: transparent !important; }
        }
      `}</style>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={22} style={{ color: 'var(--color-primary)' }} />
            Financeiro
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
            Acompanhe o fluxo de caixa e lucros da sua loja
          </p>
        </div>
        <div className="actions-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
          {/* Period pills */}
          <div className="period-pills" style={{ display: 'flex', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '9999px', padding: '3px', gap: '2px' }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                style={{
                  padding: '5px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: '600', fontFamily: 'inherit',
                  backgroundColor: period === p.key ? 'var(--color-primary)' : 'transparent',
                  color: period === p.key ? 'white' : 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                }}>
                {p.label}
                {p.key === 'todos' && <ChevronDown size={12} />}
              </button>
            ))}
          </div>
          <div className="tabs-container" style={{ display: 'flex', gap: '8px', maxWidth: '100%', paddingBottom: '4px' }}>
            <button className="btn btn-outline" style={{ gap: '6px', fontSize: '0.82rem', backgroundColor: 'white', height: '36px', whiteSpace: 'nowrap' }}>
              <RefreshCw size={14} /> Reparar
            </button>
            <button className="btn btn-outline" onClick={gerarDRE} style={{ gap: '6px', fontSize: '0.82rem', backgroundColor: 'white', height: '36px', whiteSpace: 'nowrap' }}>
              <BarChart2 size={14} /> Gerar DRE
            </button>
            <button onClick={() => openNew('DESPESA')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Despesa
            </button>
            <button onClick={() => openNew('RECEITA')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              + Receita
            </button>
          </div>
        </div>
      </div>

      {/* ── Period label ── */}
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Período exibido: <strong style={{ color: 'var(--color-text)' }}>{PERIODS.find(p=>p.key===period)?.label}</strong>
      </div>

      {/* ── Sub-tabs ── */}
      <div className="tabs-container" style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '20px', maxWidth: '100%' }}>
        {SUB_TABS.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            style={{
              padding: '12px 18px', border: 'none', cursor: 'pointer',
              background: 'none', fontFamily: 'inherit', fontSize: '0.85rem',
              fontWeight: subTab === t.key ? '700' : '500',
              color: subTab === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: subTab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {subTab === 'geral'    && renderGeral()}
      {subTab === 'areceber' && renderAReceber()}
      {subTab === 'reparos' && renderFilteredTable(
        filtered.filter(t => t.description?.toLowerCase().includes('os #') || t.category?.name?.toLowerCase().includes('reparo') || t.category?.name?.toLowerCase().includes('serviço')),
        'Nenhuma receita de reparo ou OS encontrada neste período.'
      )}
      {subTab === 'vendas' && renderFilteredTable(
        filtered.filter(t => t.description?.toLowerCase().includes('venda #') || t.category?.name?.toLowerCase().includes('venda') || (t.type === 'RECEITA' && !t.description?.toLowerCase().includes('os #'))),
        'Nenhuma receita de vendas encontrada neste período.'
      )}
      {subTab === 'fixas' && renderFilteredTable(
        filtered.filter(t => t.type === 'DESPESA' && !t.description?.toLowerCase().includes('peça') && !t.description?.toLowerCase().includes('estoque')),
        'Nenhuma despesa fixa registrada neste período.'
      )}

      {/* ── Modal: Nova Receita / Nova Despesa ── */}
      {modalType && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontWeight: '700', fontSize: '1.15rem' }}>
                {editingTx ? 'Editar' : 'Nova'} {isDespesa ? 'Despesa' : 'Receita'}
              </h2>
              <button onClick={() => { setModalType(null); setEditingTx(null) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* TÍTULO */}
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>TÍTULO</label>
                <input className="input" placeholder={isDespesa ? 'Ex: Aluguel, Venda de Acessórios...' : 'Ex: Aluguel, Venda de Acessórios...'}
                  value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              {/* VALOR + DATA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>VALOR (R$)</label>
                  <input type="number" step="0.01" min="0.01" className="input" placeholder="0,00"
                    value={amount} onChange={e => setAmount(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>DATA</label>
                  <input type="date" className="input" value={txDate} onChange={e => setTxDate(e.target.value)} />
                </div>
              </div>

              {/* CATEGORIA + MÉTODO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>CATEGORIA</label>
                  <input className="input" list={`cat-${isDespesa?'d':'r'}`} value={category} onChange={e => setCategory(e.target.value)} />
                  <datalist id={`cat-${isDespesa?'d':'r'}`}>
                    {(isDespesa ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA).map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>MÉTODO</label>
                  <input className="input" list="metodos" value={method} onChange={e => setMethod(e.target.value)} />
                  <datalist id="metodos">
                    {METODOS.map(m => <option key={m} value={m} />)}
                  </datalist>
                </div>
              </div>

              {/* STATUS toggle */}
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>STATUS</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(['PAGO','PENDENTE'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setStatus(s)}
                      style={{
                        padding: '10px', border: status === s ? 'none' : '1px solid var(--color-border)',
                        borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                        backgroundColor: status === s ? 'var(--color-primary)' : 'white',
                        color: status === s ? 'white' : 'var(--color-text-muted)',
                      }}>
                      {s === 'PAGO' ? 'Concluída' : 'Pendente'}
                    </button>
                  ))}
                </div>
              </div>

              {/* CLIENTE */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>VINCULAR CLIENTE (OPCIONAL)</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                  <input
                    className="input"
                    placeholder="Buscar por nome, CPF ou telefone..."
                    value={customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); setShowCustomerList(true); setCustomerId('') }}
                    onFocus={() => setShowCustomerList(true)}
                    style={{ paddingLeft: '32px' }}
                    autoComplete="off"
                  />
                </div>
                {showCustomerList && customerSearch.length > 0 && (
                  <div style={{ position: 'absolute', zIndex: 99, top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '180px', overflowY: 'auto', marginTop: '4px' }}>
                    {customers
                      .filter((c: any) => {
                        const q = customerSearch.toLowerCase()
                        return c.name?.toLowerCase().includes(q) || c.document?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.whatsapp?.toLowerCase().includes(q)
                      })
                      .slice(0, 8)
                      .map((c: any) => (
                        <div key={c.id}
                          onClick={() => { setCustomerId(c.id); setCustomerSearch(c.name); setShowCustomerList(false) }}
                          style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
                        >
                          <div style={{ fontWeight: '600' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{c.document && `CPF: ${c.document}`}{c.phone && ` • ${c.phone}`}</div>
                        </div>
                      ))}
                    {customers.filter((c: any) => {
                      const q = customerSearch.toLowerCase()
                      return c.name?.toLowerCase().includes(q) || c.document?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q)
                    }).length === 0 && (
                      <div style={{ padding: '12px 14px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Nenhum cliente encontrado</div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button type="button" onClick={() => { setModalType(null); setEditingTx(null) }}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                  Cancelar
                </button>
                <button type="submit"
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                    backgroundColor: isDespesa ? '#ef4444' : '#10b981',
                    color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                  + Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail modal ── */}
      {detailTx && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Detalhes da Transação</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => gerarComprovante(detailTx)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#10b981' }} title="Gerar Comprovante"><Download size={15} /></button>
                <button onClick={() => openEdit(detailTx)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}><Edit2 size={15} /></button>
                <button onClick={() => handleDelete(detailTx.id)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={15} /></button>
                <button onClick={() => setDetailTx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['Título', detailTx.description],
                ['Valor', (detailTx.type === 'RECEITA' ? '+' : '-') + fmt(detailTx.amount)],
                ['Data', new Date(detailTx.date).toLocaleDateString('pt-BR')],
                ['Categoria', detailTx.category?.name || '—'],
                ['Método', detailTx.paymentMethod || '—'],
                ['Status', detailTx.status === 'PAGO' ? 'Concluída' : 'Pendente'],
                ['Cliente', detailTx.customer?.name || '—'],
              ].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: '600' }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setDetailTx(null)} className="btn btn-outline" style={{ width: '100%', marginTop: '20px', backgroundColor: 'white' }}>Fechar</button>
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

/* ── Stat box ── */
function StatBox({ label, value, color, dark }: { label: string; value: number; color: string; dark?: boolean }) {
  return (
    <div className="card" style={{ padding: '18px 20px', backgroundColor: dark ? '#0f172a' : undefined }}>
      <div style={{ fontSize: '0.67rem', fontWeight: '700', letterSpacing: '0.08em', color: dark ? 'rgba(255,255,255,0.45)' : 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: '800', color: dark ? color : color }}>
        {fmt(value)}
      </div>
    </div>
  )
}

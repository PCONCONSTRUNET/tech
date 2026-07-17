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

  // form
  const [title, setTitle]           = useState('')
  const [amount, setAmount]         = useState('')
  const [txDate, setTxDate]         = useState(today())
  const [category, setCategory]     = useState('')
  const [method, setMethod]         = useState('Pix')
  const [status, setStatus]         = useState<'PAGO'|'PENDENTE'>('PAGO')

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

  /* ── handlers ── */
  function openNew(type: 'RECEITA'|'DESPESA') {
    setModalType(type); setEditingTx(null)
    setTitle(''); setAmount(''); setTxDate(today())
    setCategory(type === 'DESPESA' ? 'Peças' : 'Vendas')
    setMethod('Pix'); setStatus('PAGO')
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
    if (editingTx) await updateTransaction(editingTx.id, fd)
    else await createTransaction(fd)
    setModalType(null); setEditingTx(null)
  }

  async function handleDelete(id: string) {
    if (confirm('Excluir esta transação?')) { await deleteTransaction(id); setDetailTx(null) }
  }

  /* ── sub-tab content ── */
  function renderGeral() {
    return (
      <div>
        {/* Big stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
          <StatBox label="RECEITAS" value={totalIn} color="#10b981" />
          <StatBox label="DESPESAS" value={totalOut} color="#ef4444" />
          <StatBox label="SALDO LÍQUIDO" value={balance} color={balance >= 0 ? '#10b981' : '#ef4444'} dark />
        </div>

        {/* Transaction list */}
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="Buscar por descrição ou categoria..." className="input"
                style={{ paddingLeft: '30px', height: '36px', fontSize: '0.82rem' }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
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
      </div>
    )
  }

  function renderAReceber() {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '16px' }}>
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
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ position: 'relative', maxWidth: '360px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="Buscar por cliente ou OS..." className="input"
                style={{ paddingLeft: '30px', height: '36px', fontSize: '0.82rem', width: '100%' }} />
            </div>
          </div>
          {aReceber.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
              <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>Nenhuma dívida em aberto</p>
              <p style={{ fontSize: '0.78rem' }}>Quando você registrar uma OS ou venda a prazo, ela aparecerá aqui.</p>
            </div>
          ) : (
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
          )}
        </div>

        <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '0.76rem', color: '#3b82f6' }}>
          ℹ️ <strong>A Receber:</strong> estes valores que seus clientes ainda não pagaram. Esses valores <strong>não entram no caixa</strong> até que o pagamento seja registrado.
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Period pills */}
          <div style={{ display: 'flex', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '9999px', padding: '3px', gap: '2px' }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                style={{
                  padding: '5px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: '600', fontFamily: 'inherit',
                  backgroundColor: period === p.key ? 'var(--color-primary)' : 'transparent',
                  color: period === p.key ? 'white' : 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                {p.label}
                {p.key === 'todos' && <ChevronDown size={12} />}
              </button>
            ))}
          </div>
          <button className="btn btn-outline" style={{ gap: '6px', fontSize: '0.82rem', backgroundColor: 'white', height: '36px' }}>
            <RefreshCw size={14} /> Reparar
          </button>
          <button className="btn btn-outline" style={{ gap: '6px', fontSize: '0.82rem', backgroundColor: 'white', height: '36px' }}>
            <BarChart2 size={14} /> Relatório
          </button>
          <button onClick={() => openNew('DESPESA')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', fontFamily: 'inherit' }}>
            Despesa
          </button>
          <button onClick={() => openNew('RECEITA')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', fontFamily: 'inherit' }}>
            + Receita
          </button>
        </div>
      </div>

      {/* ── Period label ── */}
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Período exibido: <strong style={{ color: 'var(--color-text)' }}>{PERIODS.find(p=>p.key===period)?.label}</strong>
      </div>

      {/* ── Sub-tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '20px', overflowX: 'auto' }}>
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
      {(subTab === 'reparos' || subTab === 'vendas' || subTab === 'fixas') && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
          <BarChart2 size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <p style={{ fontWeight: '600', marginBottom: '4px' }}>Em breve</p>
          <p style={{ fontSize: '0.82rem' }}>Esta seção está sendo desenvolvida.</p>
        </div>
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

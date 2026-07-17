'use client'

import { useState } from 'react'
import { Landmark, X, Plus, Minus, Clock, RefreshCw, ChevronRight } from 'lucide-react'
import { openCashSession, closeCashSession, addMovement } from '@/actions/caixa'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const fmtDate = (d: any) => new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })

type Tab = 'atual' | 'historico'
type Modal = 'suprimento' | 'sangria' | null

export default function CaixaClient({ openSession, closedSessions }: { openSession: any; closedSessions: any[] }) {
  const [tab, setTab]               = useState<Tab>('atual')
  const [modal, setModal]           = useState<Modal>(null)
  const [movValue, setMovValue]     = useState('')
  const [movDesc, setMovDesc]       = useState('')
  const [operator, setOperator]     = useState('Operador')
  const [initialAmt, setInitialAmt] = useState('')

  /* ── compute totals ── */
  const movements = openSession?.movements || []
  const entradas   = movements.filter((m: any) => m.type === 'SUPRIMENTO' || m.type === 'ENTRADA').reduce((s: number, m: any) => s + m.amount, 0)
  const saidas     = movements.filter((m: any) => m.type === 'SANGRIA'    || m.type === 'SAIDA').reduce((s: number, m: any) => s + m.amount, 0)
  const totalMov   = entradas - saidas
  const byMethod   = (method: string) => movements.filter((m: any) => m.method === method).reduce((s: number, m: any) => s + (m.type === 'ENTRADA' || m.type === 'SUPRIMENTO' ? m.amount : -m.amount), 0)
  const dinheiro   = (openSession?.initialAmount || 0) + byMethod('DINHEIRO')

  async function handleOpen(e: React.FormEvent) {
    e.preventDefault()
    await openCashSession(operator, parseFloat(initialAmt) || 0)
  }

  async function handleClose() {
    if (!openSession) return
    if (confirm('Deseja realmente fechar o caixa?')) {
      await closeCashSession(openSession.id)
    }
  }

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault()
    if (!openSession || !movValue) return
    await addMovement(openSession.id, modal === 'suprimento' ? 'SUPRIMENTO' : 'SANGRIA', parseFloat(movValue), 'DINHEIRO', movDesc)
    setModal(null); setMovValue(''); setMovDesc('')
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'atual',     label: 'Caixa Atual' },
    { key: 'historico', label: 'Histórico' },
  ]

  const METHOD_CARDS = [
    { key: 'DINHEIRO',       label: 'DINHEIRO',       color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { key: 'PIX',            label: 'PIX',             color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
    { key: 'CARTAO_CREDITO', label: 'CARTÃO CRÉDITO',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
    { key: 'CARTAO_DEBITO',  label: 'CARTÃO DÉBITO',   color: '#f97316', bg: 'rgba(249,115,22,0.08)'  },
  ]

  return (
    <>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Landmark size={20} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Caixa</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Controle de abertura e fechamento de caixa da sua loja</p>
          </div>
        </div>
        {/* tab buttons top-right */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: tab === t.key ? '700' : '500', fontFamily: 'inherit', fontSize: '0.85rem', backgroundColor: 'transparent', color: tab === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: tab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: CAIXA ATUAL ── */}
      {tab === 'atual' && (
        <>
          {!openSession ? (
            /* ── Empty: Abrir Caixa ── */
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '40px 48px', width: '100%', maxWidth: '480px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Landmark size={36} style={{ color: 'white' }} />
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>Nenhum caixa aberto</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '28px' }}>Abra o caixa para iniciar o controle financeiro do turno.</p>
                <form onSubmit={handleOpen} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>RESPONSÁVEL PELA ABERTURA</label>
                    <div style={{ position: 'relative' }}>
                      <select className="input" value={operator} onChange={e => setOperator(e.target.value)} style={{ appearance: 'none', paddingRight: '32px' }}>
                        <option>Operador</option>
                        <option>Admin</option>
                        <option>Técnico</option>
                        <option>Vendedor</option>
                      </select>
                      <ChevronRight size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>VALOR INICIAL (TROCO)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '12px', fontWeight: '700', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>R$</span>
                      <input type="number" step="0.01" min="0" className="input" style={{ paddingLeft: '38px' }}
                        placeholder="400" value={initialAmt} onChange={e => setInitialAmt(e.target.value)} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Informe o valor em dinheiro disponível no gaveta para troco.</p>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '13px', fontSize: '0.9rem', fontWeight: '700', gap: '8px', marginTop: '4px' }}>
                    🔓 Abrir Caixa
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* ── Open Session ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status bar */}
              <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Landmark size={20} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '9999px' }}>CAIXA ABERTO</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      👤 {openSession.operatorName} &nbsp;·&nbsp; 🕐 {fmtDate(openSession.openedAt)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-outline" style={{ fontSize: '0.82rem', gap: '6px', backgroundColor: 'white' }}>
                    ✏️ Editar Valor Inicial
                  </button>
                  <button onClick={handleClose}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', fontFamily: 'inherit' }}>
                    🔴 Fechar Caixa
                  </button>
                </div>
              </div>

              {/* Suprimento / Sangria buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => setModal('suprimento')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '10px', border: '1px solid #10b981', backgroundColor: 'rgba(16,185,129,0.06)', color: '#10b981', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                  <Plus size={18} /> Suprimento
                </button>
                <button onClick={() => setModal('sangria')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '10px', border: '1px solid #ef4444', backgroundColor: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                  <Minus size={18} /> Sangria
                </button>
              </div>

              {/* Dark banner — expected cash */}
              <div style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '24px 28px', color: 'white' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  DINHEIRO ESPERADO (DINHEIRO)
                </div>
                <div style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                  {fmt(dinheiro)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                  {fmt(openSession.initialAmount)} (Valor Inicial / Troco) + {fmt(byMethod('DINHEIRO') > 0 ? byMethod('DINHEIRO') : 0)} (Entradas) - {fmt(Math.abs(byMethod('DINHEIRO') < 0 ? byMethod('DINHEIRO') : 0))} (Saídas)
                </div>
              </div>

              {/* Method cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
                {METHOD_CARDS.map(mc => (
                  <div key={mc.key} className="card" style={{ padding: '16px 18px', borderTop: `3px solid ${mc.color}` }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: '800', letterSpacing: '0.1em', color: mc.color, textTransform: 'uppercase', marginBottom: '8px' }}>
                      {mc.label}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: mc.color }}>
                      {mc.key === 'DINHEIRO' ? fmt(dinheiro) : fmt(byMethod(mc.key))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {[
                  { label: '↗ Total Entradas', value: entradas, color: '#10b981' },
                  { label: '↙ Total Saídas',   value: saidas,   color: '#ef4444' },
                  { label: '⇄ Total Movimentado', value: totalMov, color: '#1e293b' },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: s.color }}>{fmt(s.value)}</div>
                  </div>
                ))}
              </div>

              {/* Movimentações */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 18px', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>📋 Movimentações do Caixa</span>
                </div>
                {movements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.3 }}>📭</div>
                    <p style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '4px' }}>Nenhuma movimentação registrada nesta sessão.</p>
                    <p style={{ fontSize: '0.78rem' }}>Registros de sangria ou suprimento aparecerão aqui.</p>
                  </div>
                ) : (
                  <table className="table">
                    <thead><tr style={{ backgroundColor: 'var(--color-bg)' }}>
                      {['HORA','TIPO','MÉTODO','DESCRIÇÃO','VALOR'].map(h => (
                        <th key={h} style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.07em' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {movements.map((m: any) => {
                        const isIn = m.type === 'SUPRIMENTO' || m.type === 'ENTRADA'
                        return (
                          <tr key={m.id}>
                            <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}</td>
                            <td>
                              <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '3px 10px', borderRadius: '9999px', backgroundColor: isIn ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isIn ? '#10b981' : '#ef4444' }}>
                                {m.type}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem' }}>{m.method || '—'}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{m.description || '—'}</td>
                            <td style={{ fontWeight: '700', color: isIn ? '#10b981' : '#ef4444' }}>{isIn ? '+' : '-'}{fmt(m.amount)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Histórico Detalhado */}
              <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Histórico Detalhado da Sessão</span>
                </div>
                <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.67rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>RESUMO POR USUÁRIO</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{openSession.operatorName}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginLeft: 'auto', backgroundColor: 'var(--color-bg)', padding: '2px 8px', borderRadius: '9999px', border: '1px solid var(--color-border)' }}>
                      Al {movements.length + 1} ações
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.67rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>LINHA DO TEMPO COMPLETA</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <TimelineEntry label="CAIXA" badge="CRIADO" text="Caixa aberto" value={fmt(openSession.initialAmount)} detail={`Caixa de ${fmtDate(openSession.openedAt)} · ${openSession.operatorName}`} />
                  {[...movements].reverse().map((m: any) => (
                    <TimelineEntry key={m.id} label="MOV" badge={m.type} text={m.description || m.type} value={fmt(m.amount)} detail={`${fmtDate(m.createdAt)} · ${m.method || '—'}`} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB: HISTÓRICO ── */}
      {tab === 'historico' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <h2 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '2px' }}>Histórico de Caixas</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Consulte caixas fechados com recorte por operador e período, sem depender de listas longas.</p>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', backgroundColor: '#6366f1', color: 'white', padding: '4px 12px', borderRadius: '9999px' }}>
              {closedSessions.length} SESSÕES
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
            <select className="input" style={{ width: '200px' }}>
              <option>Todos os operadores</option>
              {[...new Set(closedSessions.map(s => s.operatorName))].map(op => (
                <option key={op}>{op}</option>
              ))}
            </select>
            <input type="date" className="input" style={{ width: '160px' }} />
            <input type="date" className="input" style={{ width: '160px' }} />
            <button className="btn btn-outline" style={{ gap: '6px', fontSize: '0.82rem', backgroundColor: 'white' }}>
              <RefreshCw size={14} /> Limpar filtros
            </button>
          </div>

          {closedSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
              <Clock size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>Nenhum caixa fechado ainda.</p>
              <p style={{ fontSize: '0.78rem' }}>O histórico aparecerá aqui após o primeiro fechamento de caixa.</p>
            </div>
          ) : (
            <table className="table">
              <thead><tr style={{ backgroundColor: 'var(--color-bg)' }}>
                {['ABERTURA','FECHAMENTO','OPERADOR','VALOR INICIAL','ENTRADAS','SAÍDAS','SALDO',''].map(h => (
                  <th key={h} style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {closedSessions.map(s => {
                  const ins  = s.movements.filter((m: any) => m.type === 'SUPRIMENTO' || m.type === 'ENTRADA').reduce((acc: number, m: any) => acc + m.amount, 0)
                  const outs = s.movements.filter((m: any) => m.type === 'SANGRIA' || m.type === 'SAIDA').reduce((acc: number, m: any) => acc + m.amount, 0)
                  return (
                    <tr key={s.id}>
                      <td style={{ fontSize: '0.78rem' }}>{fmtDate(s.openedAt)}</td>
                      <td style={{ fontSize: '0.78rem' }}>{s.closedAt ? fmtDate(s.closedAt) : '—'}</td>
                      <td style={{ fontWeight: '600', fontSize: '0.85rem' }}>{s.operatorName}</td>
                      <td>{fmt(s.initialAmount)}</td>
                      <td style={{ color: '#10b981', fontWeight: '700' }}>+{fmt(ins)}</td>
                      <td style={{ color: '#ef4444', fontWeight: '700' }}>-{fmt(outs)}</td>
                      <td style={{ fontWeight: '800' }}>{fmt(s.initialAmount + ins - outs)}</td>
                      <td>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', backgroundColor: 'rgba(100,116,139,0.1)', color: '#64748b', padding: '3px 10px', borderRadius: '9999px' }}>Fechado</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Modals: Suprimento / Sangria ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: modal === 'suprimento' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: modal === 'suprimento' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {modal === 'suprimento' ? <Plus size={20} /> : <Minus size={20} />}
                </div>
                <div>
                  <h2 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{modal === 'suprimento' ? 'Suprimento' : 'Sangria'}</h2>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{modal === 'suprimento' ? 'Entrada de dinheiro no caixa' : 'Retirada de dinheiro do caixa'}</p>
                </div>
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleMovement} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.67rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>VALOR</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
                  <span style={{ padding: '10px 14px', borderRight: '1px solid var(--color-border)', fontWeight: '700', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)' }}>R$</span>
                  <input type="number" step="0.01" min="0.01" placeholder="Ex: 100,00" required value={movValue} onChange={e => setMovValue(e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 14px', fontSize: '1rem', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.67rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>DESCRIÇÃO (OPCIONAL)</label>
                <input className="input" placeholder="Motivo da movimentação" value={movDesc} onChange={e => setMovDesc(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '4px' }}>
                <button type="button" onClick={() => setModal(null)}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                  Cancelar
                </button>
                <button type="submit"
                  style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ChevronRight size={16} /> Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Timeline entry ── */
function TimelineEntry({ label, badge, text, value, detail }: { label: string; badge: string; text: string; value: string; detail: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 14px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1', marginTop: '6px', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: '700', letterSpacing: '0.07em', color: 'var(--color-text-muted)', textTransform: 'uppercase', border: '1px solid var(--color-border)', padding: '1px 6px', borderRadius: '4px' }}>{label}</span>
          <span style={{ fontSize: '0.62rem', fontWeight: '700', letterSpacing: '0.07em', color: 'var(--color-primary)', backgroundColor: 'rgba(99,102,241,0.1)', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{badge}</span>
          <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{text}</span>
          <span style={{ marginLeft: 'auto', fontWeight: '700', fontSize: '0.9rem' }}>{value}</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{detail}</div>
      </div>
    </div>
  )
}

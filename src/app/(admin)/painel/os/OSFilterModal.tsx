import { X, Calendar, RefreshCcw, Filter } from 'lucide-react'
import { useState } from 'react'

export default function OSFilterModal({ onClose, onApply }: { onClose: () => void, onApply: (filters: any) => void }) {
  const [status, setStatus] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [valMin, setValMin] = useState('')
  const [valMax, setValMax] = useState('')
  
  const toggleStatus = (s: string) => {
    setStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleClear = () => {
    setStatus([])
    setDateFrom('')
    setDateTo('')
    setValMin('')
    setValMax('')
  }

  const handleApply = () => {
    onApply({ status, dateFrom, dateTo, valMin, valMax })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, backdropFilter: 'blur(4px)', padding: '24px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
            <Filter size={18} style={{ color: '#3b82f6' }} /> Filtrar Resultados
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Status */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>STATUS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Recebido', 'Em Análise', 'Aguard. Aprovação', 'Aguard. Peça', 'Em Serviço', 'Pronto', 'Entregue', 'Cancelado'].map(s => (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    border: status.includes(s) ? '1px solid #3b82f6' : '1px solid var(--color-border)',
                    backgroundColor: status.includes(s) ? '#eff6ff' : 'white',
                    color: status.includes(s) ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Data */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>DATA DE ENTRADA</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>DE</div>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
              </div>
              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>ATÉ</div>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: '100%', padding: '10px 12px 10px 42px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>

          {/* Valor */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>VALOR (R$)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="number" placeholder="Mín" value={valMin} onChange={e => setValMin(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
              <div style={{ color: '#94a3b8' }}>-</div>
              <input type="number" placeholder="Máx" value={valMax} onChange={e => setValMax(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
            </div>
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />

          {/* Manutenção & Diagnóstico */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
               MANUTENÇÃO & DIAGNÓSTICO
            </div>
            <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px dashed #fcd34d', backgroundColor: '#fffbeb', color: '#d97706', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <RefreshCcw size={14} /> Verificar Consistência Financeira
            </button>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center' }}>
              Use isso se houver divergências no saldo financeiro ou relacionadas a OSs antigas.
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
          <button onClick={handleClear} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <RefreshCcw size={14} /> Limpar
          </button>
          
          <button onClick={handleApply} style={{ padding: '12px 24px', backgroundColor: '#2563eb', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', width: '200px' }}>
            Aplicar Filtros
          </button>
        </div>

      </div>
    </div>
  )
}

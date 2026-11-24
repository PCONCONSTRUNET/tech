'use client'

import { useEffect, useRef, useState } from 'react'
import { MoreVertical, Receipt, Trash2 } from 'lucide-react'
import { printSaleReceipt, type PrintSale, type StoreInfo } from '@/lib/print-sale'

export default function SaleActionsMenu({
  sale,
  store,
  onDelete
}: {
  sale: PrintSale
  store?: StoreInfo
  onDelete?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('click', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: Math.max(8, r.right - 190) })
    }
    setOpen(o => !o)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label="Mais ações"
        style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: '190px', zIndex: 1000, background: 'var(--color-surface, #fff)', border: '1px solid var(--color-border)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '4px' }}
        >
          <button
            onClick={() => { setOpen(false); printSaleReceipt(sale, store) }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text)', textAlign: 'left' }}
          >
            <Receipt size={16} /> Emitir recibo
          </button>
          {onDelete && (
            <>
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
              <button
                onClick={() => { setOpen(false); onDelete() }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#ef4444', textAlign: 'left', fontWeight: 500 }}
              >
                <Trash2 size={16} /> Excluir venda
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}

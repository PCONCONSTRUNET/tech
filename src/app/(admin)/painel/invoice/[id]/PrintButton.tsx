'use client'

export default function PrintButton() {
  return (
    <button 
      className="btn btn-primary" 
      onClick={() => window.print()} 
      style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer' }}
      id="print-btn"
    >
      Imprimir Recibo
    </button>
  )
}

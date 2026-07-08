'use client'

import { Receipt, Search, Plus, Download, AlertCircle } from 'lucide-react'
import LegoLoader from '@/components/LegoLoader'

export default function InvoicesPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Notas Fiscais</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Gerencie e emita as suas notas fiscais eletrônicas.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: '8px' }} disabled>
          <Plus size={18} /> Emitir NFe
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input type="text" placeholder="Buscar nota fiscal..." className="input" style={{ paddingLeft: '40px', width: '100%' }} disabled />
          </div>
          <select className="input" style={{ width: '200px' }} disabled>
            <option>Todos os Status</option>
            <option>Autorizada</option>
            <option>Cancelada</option>
          </select>
        </div>
      </div>

      {/* Container "Em Breve" / Integração em Andamento */}
      <div className="card" style={{ 
        minHeight: '400px', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px'
      }}>
        
        <div style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Efeito LegoLoader por cima do texto */}
          <div style={{ width: '100%', height: '250px', marginBottom: '-20px', position: 'relative', zIndex: 0 }}>
            <LegoLoader />
          </div>

          <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(255,255,255,0.95)', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'inline-flex', padding: '16px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '50%', marginBottom: '16px' }}>
              <Receipt size={48} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Emissão de Notas Fiscais</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
              Estamos trabalhando na integração completa para emissão de NFe e NFCe. 
              Em breve você poderá gerar notas fiscais diretamente pelos seus orçamentos e vendas de forma automática.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '8px', fontWeight: '600' }}>
              <AlertCircle size={20} />
              Integração em Andamento (Lançamento em Breve)
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

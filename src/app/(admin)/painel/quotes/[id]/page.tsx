import { getQuote } from '@/actions/quote'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function QuotePrintPage({ params }: { params: { id: string } }) {
  const quote = await getQuote(params.id)
  if (!quote) return <div>Orçamento não encontrado.</div>

  const settings = await prisma.settings.findFirst()

  let parsedNotes: any = null
  let plainNotes: string | null = quote.notes

  if (quote.notes && quote.notes.startsWith('{')) {
    try {
      parsedNotes = JSON.parse(quote.notes)
      plainNotes = parsedNotes.originalNotes || null
    } catch (e) {
      // not a json string
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', color: 'black' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>ORÇAMENTO</h1>
          <p>Nº: {quote.id.slice(-6).toUpperCase()}</p>
          <p>Emissão: {new Date(quote.createdAt).toLocaleDateString('pt-BR')}</p>
          <p>Validade: {quote.validity} dias</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#000', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '32px', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{settings?.storeName || 'Digital Tech'}</h2>
          {settings?.fiscalData && <p style={{ fontSize: '14px', color: '#4b5563' }}>CNPJ: {settings.fiscalData}</p>}
          {settings?.whatsapp && <p style={{ fontSize: '14px', color: '#4b5563' }}>WhatsApp: {settings.whatsapp}</p>}
          {(settings?.street) && (
            <p style={{ fontSize: '14px', color: '#4b5563' }}>
              {settings.street}{settings.number ? `, ${settings.number}` : ''}
              {settings.neighborhood ? ` - ${settings.neighborhood}` : ''}
            </p>
          )}
          {(settings?.city || settings?.state) && (
            <p style={{ fontSize: '14px', color: '#4b5563' }}>
              {settings.city}{settings.state ? ` - ${settings.state}` : ''}
              {settings.cep ? ` | CEP: ${settings.cep}` : ''}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }}>Dados do Cliente</h3>
        {quote.customer ? (
          <>
            <p><strong>Nome:</strong> {quote.customer.name}</p>
            {quote.customer.document && <p><strong>Documento:</strong> {quote.customer.document}</p>}
            {quote.customer.phone && <p><strong>Telefone:</strong> {quote.customer.phone}</p>}
          </>
        ) : (
          <p>Consumidor Final</p>
        )}
      </div>

      {parsedNotes && (parsedNotes.device || parsedNotes.brand || parsedNotes.model) && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }}>Dados do Aparelho</h3>
          <p><strong>Aparelho:</strong> {parsedNotes.device || ''} {parsedNotes.brand || ''} {parsedNotes.model || ''}</p>
          {parsedNotes.imei && <p><strong>IMEI:</strong> {parsedNotes.imei}</p>}
          {parsedNotes.defect && <p><strong>Problema Relatado:</strong> {parsedNotes.defect}</p>}
          {parsedNotes.diagnostic && <p><strong>Laudo / Diagnóstico:</strong> {parsedNotes.diagnostic}</p>}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }}>Itens do Orçamento</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Descrição</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>Qtd</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>V. Unit.</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map(item => (
              <tr key={item.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.name}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span>Subtotal:</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.totalAmount + quote.discount)}</span>
          </div>
          {quote.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#ef4444' }}>
              <span>Desconto:</span>
              <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #eee', fontWeight: 'bold', fontSize: '18px' }}>
            <span>Total:</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.totalAmount)}</span>
          </div>
        </div>
      </div>

      {plainNotes && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Observações:</h3>
          <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{plainNotes}</p>
        </div>
      )}

      <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <p>Este documento não possui valor fiscal e tem validade de {quote.validity} dias a partir da data de emissão.</p>
      </div>

      {/* Script to auto-print */}
      <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { window.print(); }' }} />
    </div>
  )
}

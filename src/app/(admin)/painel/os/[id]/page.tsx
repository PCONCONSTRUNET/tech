import { getServiceOrder } from '@/actions/os'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function OSPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const os = await getServiceOrder(resolvedParams.id)
  if (!os) return notFound()

  const settings = await prisma.settings.findFirst()

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', color: 'black' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>ORDEM DE SERVIÇO</h1>
          <p>Nº: {os.id.slice(-6).toUpperCase()}</p>
          <p>Entrada: {new Date(os.createdAt).toLocaleDateString('pt-BR')}</p>
          <p>Status: {os.status.replace(/_/g, ' ')}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {/* Logo adicionada conforme pedido (fundo preto) */}
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
        {os.customer ? (
          <>
            <p><strong>Nome:</strong> {os.customer.name}</p>
            {os.customer.document && <p><strong>Documento:</strong> {os.customer.document}</p>}
            {os.customer.phone && <p><strong>Telefone:</strong> {os.customer.phone}</p>}
          </>
        ) : (
          <p>Consumidor Final</p>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }}>Dados do Aparelho</h3>
        <p><strong>Aparelho:</strong> {os.device || ''} {os.brand || ''} {os.model || ''}</p>
        {os.imei && <p><strong>IMEI:</strong> {os.imei}</p>}
        {os.defect && <p><strong>Problema Relatado:</strong> {os.defect}</p>}
        {os.diagnostic && <p><strong>Laudo / Diagnóstico:</strong> {os.diagnostic}</p>}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }}>Serviços e Valores</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Descrição</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{os.defect || 'Serviço de Manutenção'}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.price || 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #eee', fontWeight: 'bold', fontSize: '18px' }}>
            <span>Total Estimado:</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.price || 0)}</span>
          </div>
        </div>
      </div>

      {os.notes && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Observações:</h3>
          <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{os.notes}</p>
        </div>
      )}

      <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <p>Assinatura do Cliente:</p>
        <div style={{ width: '300px', height: '1px', backgroundColor: '#000', margin: '40px auto 10px' }}></div>
      </div>

      {/* Script to auto-print */}
      <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { window.print(); }' }} />
    </div>
  )
}

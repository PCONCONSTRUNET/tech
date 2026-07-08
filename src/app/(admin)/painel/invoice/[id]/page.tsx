import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PrintButton from './PrintButton'

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const sale = await prisma.sale.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: true
        }
      },
      customer: true
    }
  })

  if (!sale) return notFound()

  // Find settings to get store data
  const settings = await prisma.settings.findFirst()

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', color: 'black', minHeight: '100vh', fontFamily: 'monospace' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>{settings?.storeName || 'MINHA LOJA'}</h1>
        <p style={{ margin: '4px 0' }}>{settings?.street || 'Rua'}, {settings?.number || 'S/N'} - {settings?.city || 'Cidade'} / {settings?.state || 'UF'}</p>
        <p style={{ margin: '4px 0' }}>CNPJ: {settings?.fiscalData || '00.000.000/0001-00'}</p>
        <p style={{ margin: '4px 0' }}>WhatsApp: {settings?.whatsapp || '(00) 00000-0000'}</p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0' }}>RECIBO DE VENDA</h2>
        <p style={{ margin: '0' }}>Nº {sale.id.slice(-6).toUpperCase()}</p>
        <p style={{ margin: '4px 0' }}>Data: {new Date(sale.createdAt).toLocaleString('pt-BR')}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ textAlign: 'left', padding: '8px 0' }}>QTD</th>
            <th style={{ textAlign: 'left', padding: '8px 0' }}>DESCRIÇÃO</th>
            <th style={{ textAlign: 'right', padding: '8px 0' }}>V.UN</th>
            <th style={{ textAlign: 'right', padding: '8px 0' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px dotted #ccc' }}>
              <td style={{ padding: '8px 0' }}>{item.quantity}</td>
              <td style={{ padding: '8px 0' }}>{item.product.name}</td>
              <td style={{ textAlign: 'right', padding: '8px 0' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
              </td>
              <td style={{ textAlign: 'right', padding: '8px 0' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '2px dashed #000', paddingTop: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
        <span>TOTAL</span>
        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.totalAmount)}</span>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <p style={{ margin: '4px 0' }}><strong>Forma de Pagamento:</strong> {sale.paymentMethod === 'PIX' ? 'PIX' : sale.paymentMethod === 'CREDIT' ? 'Cartão de Crédito' : 'Dinheiro'}</p>
      </div>

      <div style={{ textAlign: 'center', fontSize: '14px' }}>
        <p>Obrigado pela preferência!</p>
        <p>Volte Sempre</p>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <PrintButton />
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            #print-btn { display: none !important; }
            body { background: white; margin: 0; padding: 0; }
            .sidebar, .header { display: none !important; }
            .main-content { margin: 0 !important; padding: 0 !important; width: 100% !important; }
            .dashboard-layout { display: block !important; }
          }
        `}} />
      </div>
    </div>
  )
}

/* print-sale.ts – Recibo de venda para impressora térmica 58 mm (POS-5890U) */

export type PrintSale = {
  id: string
  createdAt: string | Date
  totalAmount: number
  discount?: number | null
  paymentMethod: string
  status: string
  customer?: { name: string; phone?: string | null; document?: string | null } | null
  items: { quantity: number; price: number; product?: { name?: string | null } | null }[]
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const money = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

const PAYMENT_LABELS: Record<string, string> = {
  PIX: 'PIX', CREDIT: 'Cartão de Crédito', DEBIT: 'Cartão de Débito', CASH: 'Dinheiro'
}

export function printSaleReceipt(sale: PrintSale, storeName = 'TechFix') {
  const subtotal = sale.items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  const items = sale.items.map(i => {
    const name = esc(i.product?.name || 'Item')
    return `<div class="item">${name}</div>
    <div class="row"><span>${i.quantity} x ${money(i.price)}</span><span>${money(i.price * i.quantity)}</span></div>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Recibo #${sale.id.slice(-6).toUpperCase()}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',monospace;font-size:11px;width:58mm;margin:0 auto;padding:2mm;background:#fff;color:#000}
  @media print{@page{margin:0;size:58mm auto}body{padding:2mm}}
  .center{text-align:center}
  .bold{font-weight:bold}
  .title{font-size:14px;font-weight:bold;text-align:center;margin-bottom:2px}
  .sub{font-size:10px;text-align:center}
  .divider{border:none;border-top:1px dashed #000;margin:5px 0}
  .row{display:flex;justify-content:space-between;gap:4px;margin:2px 0}
  .item{margin-top:3px;word-break:break-word}
  .total{display:flex;justify-content:space-between;font-size:13px;font-weight:bold;margin:4px 0}
</style>
</head>
<body>
  <div class="title">${esc(storeName)}</div>
  <div class="sub">RECIBO DE VENDA</div>
  <hr class="divider">
  <div class="row"><span class="bold">Pedido:</span><span class="bold">#${sale.id.slice(-6).toUpperCase()}</span></div>
  <div>${fmtDate(sale.createdAt)}</div>
  <div>Cliente: ${esc(sale.customer?.name || 'Cliente Avulso')}</div>
  ${sale.customer?.document ? `<div>CPF/CNPJ: ${esc(sale.customer.document)}</div>` : ''}
  <hr class="divider">
  ${items}
  <hr class="divider">
  <div class="row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
  ${sale.discount ? `<div class="row"><span>Desconto</span><span>-${money(sale.discount)}</span></div>` : ''}
  <div class="total"><span>TOTAL</span><span>${money(sale.totalAmount)}</span></div>
  <div class="row"><span>Pagamento</span><span>${esc(PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod)}</span></div>
  <hr class="divider">
  <div class="sub">Obrigado pela preferência!</div>
  <div style="height:12mm"></div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=400,height=700')
  if (!win) { alert('Permita pop-ups para imprimir'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}

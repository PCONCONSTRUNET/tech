/* ─────────────────────────────────────────
   print-os.ts  –  Utilitários de impressão para Ordens de Serviço
   ───────────────────────────────────────── */

export type PrintOS = {
  id: string
  createdAt: string | Date
  device: string
  brand: string
  model: string
  imei?: string | null
  defect: string
  price?: number | null
  notes?: string | null
  status: string
  customer: {
    name: string
    phone?: string | null
    document?: string | null
    email?: string | null
  }
  selectedServices?: { name: string; price: number }[]
}

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

const fmtCurrency = (v?: number | null) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const osCode = (id: string) => id.slice(-6).toUpperCase()

/* ── helper: abre janela, escreve e imprime ── */
function printWindow(html: string, title: string) {
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) { alert('Permite pop-ups para imprimir'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}

/* ══════════════════════════════════════════════
   A4 – PDF completo
══════════════════════════════════════════════ */
export function printA4(os: PrintOS, storeName = 'TechFix') {
  let notesData: Record<string, string> = {}
  try { notesData = JSON.parse(os.notes || '{}') } catch {}

  const services = os.selectedServices?.length
    ? os.selectedServices.map(s => `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9">${s.name}</td><td style="text-align:right;padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:700">${fmtCurrency(s.price)}</td></tr>`).join('')
    : `<tr><td style="padding:8px 0">Serviço</td><td style="text-align:right;font-weight:700">${fmtCurrency(os.price)}</td></tr>`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>OS #${osCode(os.id)} – ${storeName}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;background:white;padding:32px;max-width:210mm;margin:0 auto}
  @media print{body{padding:16px}@page{margin:12mm}}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #6366f1;margin-bottom:24px}
  .logo{font-size:1.6rem;font-weight:900;color:#6366f1}
  .badge{background:#6366f1;color:white;padding:8px 16px;border-radius:8px;font-size:0.9rem;font-weight:700}
  .section{margin-bottom:20px}
  .section-title{font-size:0.65rem;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:.08em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .field label{font-size:0.7rem;font-weight:600;color:#94a3b8;text-transform:uppercase;display:block;margin-bottom:3px}
  .field span{font-size:0.9rem;font-weight:600;color:#0f172a}
  table{width:100%;border-collapse:collapse}
  .defect-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;font-size:0.9rem;color:#991b1b}
  .total-row{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f8fafc;border-radius:8px;margin-top:12px}
  .total-label{font-size:0.85rem;font-weight:700;color:#64748b}
  .total-value{font-size:1.3rem;font-weight:900;color:#0f172a}
  .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:0.7rem;color:#94a3b8}
  .sig-area{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:32px}
  .sig-line{border-top:1px solid #0f172a;padding-top:6px;text-align:center;font-size:0.75rem;color:#64748b}
  .chip{display:inline-block;background:#eef2ff;color:#4f46e5;font-size:0.7rem;font-weight:700;padding:4px 8px;border-radius:20px;margin:2px}
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">🔧 ${storeName}</div>
      <div style="font-size:0.8rem;color:#64748b;margin-top:4px">Ordem de Serviço</div>
    </div>
    <div style="text-align:right">
      <div class="badge">OS #${osCode(os.id)}</div>
      <div style="font-size:0.75rem;color:#64748b;margin-top:8px">${fmtDate(os.createdAt)}</div>
    </div>
  </div>

  <div class="grid2" style="margin-bottom:20px">
    <div class="section">
      <div class="section-title">Dados do Cliente</div>
      <div class="field" style="margin-bottom:8px"><label>Nome</label><span>${os.customer.name}</span></div>
      <div class="field" style="margin-bottom:8px"><label>Telefone</label><span>${os.customer.phone || '—'}</span></div>
      <div class="field"><label>CPF/CNPJ</label><span>${os.customer.document || '—'}</span></div>
    </div>
    <div class="section">
      <div class="section-title">Dados do Aparelho</div>
      <div class="field" style="margin-bottom:8px"><label>Dispositivo</label><span>${os.device} – ${os.brand} ${os.model}</span></div>
      <div class="field" style="margin-bottom:8px"><label>IMEI</label><span style="font-family:monospace">${os.imei || '—'}</span></div>
      <div class="field"><label>Status</label><span>${os.status}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Problema Relatado</div>
    <div class="defect-box">${os.defect}</div>
  </div>

  ${notesData.physicalCondition ? `
  <div class="section">
    <div class="section-title">Estado Físico</div>
    <div>${notesData.physicalCondition.split(', ').map(i => `<span class="chip">${i}</span>`).join('')}</div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Serviços</div>
    <table>${services}</table>
    <div class="total-row">
      <span class="total-label">TOTAL</span>
      <span class="total-value">${fmtCurrency(os.price)}</span>
    </div>
  </div>

  <div class="sig-area">
    <div class="sig-line">Assinatura do Cliente</div>
    <div class="sig-line">Assinatura do Técnico</div>
  </div>

  <div class="footer">
    <span>OS #${osCode(os.id)} – Gerado em ${fmtDate(new Date())}</span>
    <span>${storeName}</span>
  </div>
</body>
</html>`
  printWindow(html, `OS #${osCode(os.id)}`)
}

/* ══════════════════════════════════════════════
   Cupom Térmico – 80 mm
══════════════════════════════════════════════ */
export function printThermal(os: PrintOS, storeName = 'TechFix') {
  const services = os.selectedServices?.length
    ? os.selectedServices.map(s => `<div class="row"><span>${s.name}</span><span>${fmtCurrency(s.price)}</span></div>`).join('')
    : `<div class="row"><span>Serviço</span><span>${fmtCurrency(os.price)}</span></div>`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Cupom OS #${osCode(os.id)}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',monospace;font-size:12px;width:80mm;margin:0 auto;padding:8px;background:white;color:#000}
  @media print{@page{margin:0;size:80mm auto}body{padding:4px}}
  .center{text-align:center}
  .bold{font-weight:bold}
  .divider{border:none;border-top:1px dashed #999;margin:6px 0}
  .row{display:flex;justify-content:space-between;margin:3px 0}
  .title{font-size:16px;font-weight:bold;text-align:center;margin:6px 0}
  .sub{font-size:10px;text-align:center;color:#555}
  .total-row{display:flex;justify-content:space-between;font-size:14px;font-weight:bold;margin:6px 0;padding:6px 0;border-top:2px solid #000;border-bottom:2px solid #000}
  .barcode{font-family:monospace;font-size:10px;text-align:center;letter-spacing:.1em;margin:6px 0}
</style>
</head>
<body>
  <div class="title">🔧 ${storeName}</div>
  <div class="sub">COMPROVANTE DE ENTREGA</div>
  <hr class="divider">

  <div class="row"><span class="bold">OS Nº:</span><span class="bold">#${osCode(os.id)}</span></div>
  <div class="row"><span>Data:</span><span>${fmtDate(os.createdAt)}</span></div>
  <hr class="divider">

  <div class="bold" style="margin-bottom:3px">CLIENTE</div>
  <div>${os.customer.name}</div>
  <div>${os.customer.phone || ''}</div>
  <hr class="divider">

  <div class="bold" style="margin-bottom:3px">APARELHO</div>
  <div>${os.brand} ${os.model}</div>
  ${os.imei ? `<div style="font-size:10px">IMEI: ${os.imei}</div>` : ''}
  <hr class="divider">

  <div class="bold" style="margin-bottom:3px">PROBLEMA</div>
  <div style="font-size:11px">${os.defect}</div>
  <hr class="divider">

  <div class="bold" style="margin-bottom:3px">SERVIÇOS</div>
  ${services}
  <div class="total-row">
    <span>TOTAL</span>
    <span>${fmtCurrency(os.price)}</span>
  </div>

  <div class="barcode">||| ${osCode(os.id)} |||</div>
  <div class="sub" style="margin-top:8px">Obrigado pela preferência!</div>
  <div class="sub">Guarde este comprovante.</div>
  <div style="height:16px"></div>
</body>
</html>`
  printWindow(html, `Cupom #${osCode(os.id)}`)
}

/* ══════════════════════════════════════════════
   Etiqueta Adesiva – 62 × 29 mm
══════════════════════════════════════════════ */
export function printLabel(os: PrintOS, storeName = 'TechFix') {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Etiqueta OS #${osCode(os.id)}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#e2e8f0}
  @media print{body{background:white;display:block;min-height:auto}@page{margin:0;size:62mm 40mm}}
  .label{width:62mm;min-height:29mm;background:white;border:1px solid #000;border-radius:3px;padding:4px 6px;display:flex;flex-direction:column;justify-content:space-between}
  .top{display:flex;justify-content:space-between;align-items:center}
  .store{font-size:7px;font-weight:bold;color:#6366f1}
  .os-num{font-size:14px;font-weight:900;color:#000;letter-spacing:.05em}
  .device{font-size:9px;font-weight:bold;color:#000;margin:2px 0}
  .customer{font-size:8px;color:#333}
  .footer{display:flex;justify-content:space-between;align-items:flex-end}
  .date{font-size:7px;color:#888}
  .barcode{font-family:'Courier New',monospace;font-size:6px;letter-spacing:.15em;color:#333}
</style>
</head>
<body>
  <div class="label">
    <div class="top">
      <div class="store">🔧 ${storeName}</div>
      <div class="os-num">#${osCode(os.id)}</div>
    </div>
    <div class="device">${os.brand} ${os.model}</div>
    <div class="customer">${os.customer.name}</div>
    <div class="footer">
      <div class="date">${new Date(os.createdAt).toLocaleDateString('pt-BR')}</div>
      <div class="barcode">||| ${osCode(os.id)} |||</div>
    </div>
  </div>
</body>
</html>`
  printWindow(html, `Etiqueta #${osCode(os.id)}`)
}

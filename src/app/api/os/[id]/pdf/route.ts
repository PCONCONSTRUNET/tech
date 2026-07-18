import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const os = await prisma.serviceOrder.findUnique({
    where: { id: resolvedParams.id },
    include: { customer: true }
  })

  if (!os) return NextResponse.json({ error: 'OS não encontrada' }, { status: 404 })

  const fmt = (v?: number | null) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  const fmtDate = (d: Date | string) =>
    new Date(d).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

  let notesData: Record<string, string> = {}
  try { notesData = JSON.parse(os.notes || '{}') } catch {}

  const osCode = os.id.slice(-6).toUpperCase()

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>OS #${osCode}</title>
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
      <div class="logo">🔧 TechFix</div>
      <div style="font-size:0.8rem;color:#64748b;margin-top:4px">Ordem de Serviço</div>
    </div>
    <div style="text-align:right">
      <div class="badge">OS #${osCode}</div>
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
    <div>${notesData.physicalCondition.split(', ').map((i: string) => `<span class="chip">${i}</span>`).join('')}</div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Serviços</div>
    <table>
      <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9">Serviço de reparo</td><td style="text-align:right;padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:700">${fmt(os.price)}</td></tr>
    </table>
    <div class="total-row">
      <span class="total-label">TOTAL</span>
      <span class="total-value">${fmt(os.price)}</span>
    </div>
  </div>

  <div class="sig-area">
    <div class="sig-line">Assinatura do Cliente</div>
    <div class="sig-line">Assinatura do Técnico</div>
  </div>

  <div class="footer">
    <span>OS #${osCode} – Gerado em ${fmtDate(new Date())}</span>
    <span>TechFix</span>
  </div>

  <script>window.onload = () => window.print()</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    }
  })
}

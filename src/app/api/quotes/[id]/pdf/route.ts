import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const [quote, settings] = await Promise.all([
    prisma.quote.findUnique({
      where: { id: resolvedParams.id },
      include: { customer: true, items: true }
    }),
    prisma.settings.findFirst()
  ])

  if (!quote) return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })

  const storeName = settings?.storeName || 'Digital Tech'
  let logoUrl = settings?.logoUrl || null
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || _req.nextUrl.origin
  if (logoUrl && logoUrl.startsWith('/')) {
    logoUrl = `${baseUrl}${logoUrl}`
  }

  const fmt = (v?: number | null) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  const fmtDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })

  // Parse notes JSON 
  let notesData: any = {}
  try { notesData = JSON.parse(quote.notes || '{}') } catch {}

  const device = notesData.device || 'Não informado'
  const brand = notesData.brand || ''
  const model = notesData.model || ''
  const imei = notesData.imei || ''
  const defect = notesData.defect || 'Não informado'
  const password = notesData.password || ''
  const physicalCondition = notesData.physicalCondition || ''
  const warranty = notesData.warranty || '90 dias'

  const quoteCode = quote.id.slice(-6).toUpperCase()

  const STATUS_MAP: Record<string, string> = {
    RECEBIDO: 'Recebido',
    EM_ANALISE: 'Em Análise',
    AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
    AGUARDANDO_PECA: 'Aguardando Peça',
    EM_CONSERTO: 'Em Serviço',
    PRONTO: 'Pronto',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
  }

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${storeName}" style="height:60px;max-width:180px;object-fit:contain;" />`
    : `<div style="font-size:1.4rem;font-weight:900;color:#6366f1">🔧 ${storeName}</div>`

  const physicalConditionHtml = physicalCondition
    ? physicalCondition.split(',').map((i: string) =>
        `<span style="display:inline-block;background:#eef2ff;color:#4f46e5;font-size:0.72rem;font-weight:700;padding:3px 8px;border-radius:20px;margin:2px">${i.trim()}</span>`
      ).join('')
    : null

  const passwordHtml = password
    ? `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:0.85rem">Senha / Desbloqueio</td>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;font-family:monospace">${password}</td>
       </tr>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Orçamento #${quoteCode} – ${storeName}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;background:white;padding:32px;max-width:210mm;margin:0 auto}
  @media print{body{padding:16px}@page{margin:12mm}}
  .header{display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;border-bottom:3px solid #6366f1;margin-bottom:24px}
  .badge{background:#6366f1;color:white;padding:8px 16px;border-radius:8px;font-size:0.9rem;font-weight:700}
  .section{margin-bottom:20px}
  .section-title{font-size:0.65rem;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:.08em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
  .field{margin-bottom:8px}
  .field label{font-size:0.7rem;font-weight:600;color:#94a3b8;text-transform:uppercase;display:block;margin-bottom:2px}
  .field span{font-size:0.88rem;font-weight:600;color:#0f172a}
  table{width:100%;border-collapse:collapse}
  .defect-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;font-size:0.9rem;color:#991b1b}
  .total-row{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f8fafc;border-radius:8px;margin-top:12px}
  .total-label{font-size:0.85rem;font-weight:700;color:#64748b}
  .total-value{font-size:1.3rem;font-weight:900;color:#0f172a}
  .sig-area{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:32px}
  .sig-line{border-top:1px solid #0f172a;padding-top:6px;text-align:center;font-size:0.75rem;color:#64748b}
  .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:0.7rem;color:#94a3b8}
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div>
      ${logoHtml}
      <div style="font-size:0.75rem;color:#64748b;margin-top:4px">${storeName}</div>
    </div>
    <div style="text-align:right">
      <div class="badge">ORÇAMENTO</div>
      <div style="font-size:1.2rem;font-weight:900;margin-top:6px">Nº: ${quoteCode}</div>
      <div style="font-size:0.75rem;color:#64748b;margin-top:4px">Data: ${fmtDate(quote.createdAt)}</div>
      <div style="font-size:0.75rem;color:#64748b">Status: ${STATUS_MAP[quote.status] || quote.status}</div>
    </div>
  </div>

  <!-- DADOS CLIENTE + APARELHO -->
  <div class="grid2">
    <div class="section">
      <div class="section-title">Dados do Cliente</div>
      <div class="field"><label>Nome</label><span>${quote.customer?.name || 'Não informado'}</span></div>
      ${quote.customer?.document ? `<div class="field"><label>Documento</label><span>${quote.customer.document}</span></div>` : ''}
      ${quote.customer?.phone ? `<div class="field"><label>Telefone</label><span>${quote.customer.phone}</span></div>` : ''}
      ${quote.customer?.email ? `<div class="field"><label>E-mail</label><span>${quote.customer.email}</span></div>` : ''}
    </div>
    <div class="section">
      <div class="section-title">Dados do Aparelho</div>
      <div class="field"><label>Aparelho</label><span>${device} ${brand} ${model}</span></div>
      ${imei ? `<div class="field"><label>IMEI</label><span style="font-family:monospace">${imei}</span></div>` : ''}
      ${passwordHtml}
    </div>
  </div>

  <!-- PROBLEMA RELATADO -->
  <div class="section">
    <div class="section-title">Problema Relatado / Serviço</div>
    <div class="defect-box">${defect}</div>
  </div>

  ${physicalConditionHtml ? `
  <div class="section">
    <div class="section-title">Estado Físico do Aparelho</div>
    <div>${physicalConditionHtml}</div>
  </div>` : ''}

  <!-- SERVIÇOS E VALORES -->
  <div class="section">
    <div class="section-title">Serviços e Valores</div>
    <table>
      <thead>
        <tr style="background:#f8fafc">
          <th style="padding:8px 12px;text-align:left;font-size:0.78rem;color:#64748b;font-weight:600">Descrição</th>
          <th style="padding:8px 12px;text-align:right;font-size:0.78rem;color:#64748b;font-weight:600">Total</th>
        </tr>
      </thead>
      <tbody>
        ${quote.items && quote.items.length > 0 ? quote.items.map((item: any) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9">${item.name} (x${item.quantity})</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700">${fmt(item.price)}</td>
        </tr>`).join('') : `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9">${defect}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700">${fmt(quote.totalAmount)}</td>
        </tr>`}
      </tbody>
    </table>
    <div class="total-row">
      <span class="total-label">Valor Total do Orçamento:</span>
      <span class="total-value">${fmt(quote.totalAmount)}</span>
    </div>
  </div>

  ${warranty === 'Sem Garantia' ? `
  <div class="section" style="background:#fef2f2;border-radius:8px;padding:12px 16px;font-size:0.78rem;color:#991b1b">
    <div style="font-weight:700;margin-bottom:4px;font-size:0.72rem;text-transform:uppercase;letter-spacing:.06em">Termos de Garantia</div>
    <div>Este orçamento não possui garantia.</div>
  </div>` : `
  <div class="section" style="background:#f8fafc;border-radius:8px;padding:12px 16px;font-size:0.78rem;color:#64748b">
    <div style="font-weight:700;margin-bottom:4px;font-size:0.72rem;text-transform:uppercase;letter-spacing:.06em">Termos de Garantia - ${warranty}</div>
    <div>${settings?.warrantyTerm || 'Garantia legal aplicável para serviços e peças.'}</div>
  </div>`}

  <!-- ASSINATURAS -->
  <div class="sig-area">
    <div class="sig-line">Assinatura do Cliente</div>
    <div class="sig-line">Assinatura do Técnico</div>
  </div>

  <div class="footer">
    <span>Orçamento #${quoteCode} – Gerado em ${fmtDate(new Date())}</span>
    <span>${storeName}</span>
  </div>

  <script>window.onload = () => window.print()</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}

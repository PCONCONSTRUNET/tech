import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import prisma from '@/lib/prisma';
import DashboardTabs from './DashboardTabs';

export const dynamic = 'force-dynamic';

const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

function getDayName(date: Date) {
  const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  return days[date.getDay()];
}

function getMonthName(date: Date) {
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return months[date.getMonth()];
}

export default async function AdminDashboard() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Today revenue & expense
  const [todayRev, todayExp] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'RECEITA', status: 'PAGO', date: { gte: startOfDay, lte: endOfDay } }
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'DESPESA', status: 'PAGO', date: { gte: startOfDay, lte: endOfDay } }
    }),
  ]);
  const todayRevTotal = todayRev._sum.amount || 0;
  const todayProfit = todayRevTotal - (todayExp._sum.amount || 0);
  const margin = todayRevTotal > 0 ? Math.round((todayProfit / todayRevTotal) * 100) : 0;

  // OS status counts
  const [emAnalise, aguardPeca, emServico, concluidos] = await Promise.all([
    prisma.serviceOrder.count({ where: { status: 'EM_ANALISE' } }),
    prisma.serviceOrder.count({ where: { status: 'AGUARDANDO_PECA' } }),
    prisma.serviceOrder.count({ where: { status: 'EM_CONSERTO' } }),
    prisma.serviceOrder.count({ where: { status: { in: ['PRONTO', 'ENTREGUE'] } } }),
  ]);

  // Recent quotes
  const recentQuotes = await prisma.quote.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Pending payments
  const [rawReceive, rawPay] = await Promise.all([
    prisma.payment.findMany({
      where: { type: 'RECEBER', status: 'PENDENTE' },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { customer: true },
    }),
    prisma.payment.findMany({
      where: { type: 'PAGAR', status: 'PENDENTE' },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
  ]);

  // Serialize for client component (no Date objects)
  const paymentsToReceive = rawReceive.map((p) => ({
    id: p.id,
    description: p.description,
    amount: p.amount,
    dueDate: p.dueDate.toISOString(),
    customerName: p.customer?.name ?? null,
  }));
  const paymentsToPay = rawPay.map((p) => ({
    id: p.id,
    description: p.description,
    amount: p.amount,
    dueDate: p.dueDate.toISOString(),
    customerName: null,
  }));

  const dayName = getDayName(now);
  const monthName = getMonthName(now);
  const dateStr = `${dayName}, ${now.getDate()} de ${monthName}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text)', lineHeight: 1.2 }}>
            Visão Geral
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Resumo operacional de {dateStr}
          </p>
        </div>
        <Link
          href="/painel/os"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'var(--color-primary)', color: 'white',
            padding: '10px 20px', borderRadius: 'var(--radius-md)',
            fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem',
          }}
        >
          + Nova OS
        </Link>
      </div>



      {/* ── Faturamento Card ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px',
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        {/* Watermark $ */}
        <div style={{
          position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '130px', fontWeight: '900', color: 'rgba(255,255,255,0.05)',
          lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
        }}>
          $
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: '600', letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: '6px',
            }}>
              FATURAMENTO HOJE
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              {formatCurrency(todayRevTotal)}
            </div>

            {/* Progress bar */}
            <div style={{ margin: '14px 0 6px', maxWidth: '380px' }}>
              <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '9999px' }}>
                <div style={{ height: '100%', width: '0%', backgroundColor: '#22c55e', borderRadius: '9999px' }} />
              </div>
            </div>
            <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.45)' }}>
              Meta batida! Parabéns 🎉
            </div>

            <div style={{ marginTop: '18px' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '4px' }}>
                LUCRO LÍQUIDO HOJE →
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: '700', color: '#4ade80' }}>
                  {formatCurrency(todayProfit)}
                </span>
                <span style={{
                  backgroundColor: margin >= 0 ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)',
                  color: margin >= 0 ? '#4ade80' : '#f87171',
                  padding: '3px 12px', borderRadius: '9999px',
                  fontSize: '0.72rem', fontWeight: '700',
                }}>
                  MARGEM {margin}%
                </span>
              </div>
            </div>
          </div>

          {/* Meta Diária */}
          <div style={{ textAlign: 'right', minWidth: '110px' }}>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Meta Diária
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '6px' }}>R$ 0,00</div>
          </div>
        </div>
      </div>

      {/* ── OS Status Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <OSStatusCard
          iconColor="#3b82f6"
          iconBg="rgba(59,130,246,0.1)"
          icon={<ClipboardSVG />}
          count={emAnalise}
          label="EM ANÁLISE"
          href="/painel/mesa"
        />
        <OSStatusCard
          iconColor="#f59e0b"
          iconBg="rgba(245,158,11,0.1)"
          icon={<BoxSVG />}
          count={aguardPeca}
          label="AGUARD. PEÇA"
          href="/painel/mesa"
        />
        <OSStatusCard
          iconColor="#a855f7"
          iconBg="rgba(168,85,247,0.1)"
          icon={<WrenchSVG />}
          count={emServico}
          label="EM SERVIÇO"
          href="/painel/mesa"
        />
        <OSStatusCard
          iconColor="#10b981"
          iconBg="rgba(16,185,129,0.1)"
          icon={<CheckSVG />}
          count={concluidos}
          label="CONCLUÍDOS"
          href="/painel/mesa"
        />
      </div>

      {/* ── Bottom 2 cols ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Orçamentos Recentes */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
              💰 ORÇAMENTOS RECENTES
            </span>
            <Link href="/painel/quotes" style={{
              fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none',
              fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              Ver Todos <ArrowRight size={13} />
            </Link>
          </div>

          {recentQuotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
              <p style={{ fontSize: '0.875rem' }}>Nenhum orçamento recente.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentQuotes.map((q, i) => (
                <div key={q.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < recentQuotes.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                      {q.customer?.name || 'Sem cliente'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      {new Date(q.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                      {formatCurrency(q.totalAmount)}
                    </div>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: '600', padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor:
                        q.status === 'APROVADO' ? 'rgba(16,185,129,0.1)' :
                        q.status === 'REJEITADO' ? 'rgba(239,68,68,0.1)' :
                        'rgba(245,158,11,0.1)',
                      color:
                        q.status === 'APROVADO' ? '#10b981' :
                        q.status === 'REJEITADO' ? '#ef4444' :
                        '#f59e0b',
                    }}>
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lembretes e Pendências */}
        <DashboardTabs paymentsToReceive={paymentsToReceive} paymentsToPay={paymentsToPay} />
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function OSStatusCard({
  icon, iconBg, iconColor, count, label, href
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string; count: number; label: string; href?: string;
}) {
  const content = (
    <div className="card hover:shadow-md transition-shadow" style={{
      padding: '20px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '10px', textAlign: 'center',
      cursor: href ? 'pointer' : 'default', height: '100%'
    }}>
      <div style={{
        width: '50px', height: '50px', borderRadius: '50%',
        backgroundColor: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-text)', lineHeight: 1 }}>
        {count}
      </div>
      <div style={{
        fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.09em',
        color: 'var(--color-text-muted)', textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </div>
  );

  return href ? <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</Link> : content;
}

function ClipboardSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/>
    </svg>
  );
}
function BoxSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  );
}
function WrenchSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}
function CheckSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import MesaBoard from './MesaBoard';

import { Suspense } from 'react';



const MESA_STATUSES = ['RECEBIDO', 'EM_ANALISE', 'AGUARDANDO_PECA', 'EM_CONSERTO', 'PRONTO', 'ENTREGUE'];

export default function MesaPage() {
  return (
    <Suspense fallback={<MesaSkeleton />}>
      <MesaData />
    </Suspense>
  );
}

function MesaSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ height: '50px', width: '300px', backgroundColor: 'var(--color-border)', borderRadius: '8px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', flex: 1 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ minWidth: '280px', width: '280px', backgroundColor: 'rgba(30,41,59,0.3)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <div style={{ height: '30px', backgroundColor: 'var(--color-border)', borderRadius: '8px', opacity: 0.5, marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '100px', backgroundColor: 'var(--color-border)', borderRadius: '8px', opacity: 0.5, marginBottom: '8px', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '100px', backgroundColor: 'var(--color-border)', borderRadius: '8px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

async function MesaData() {
  const [orders, allOrders] = await Promise.all([
    prisma.serviceOrder.findMany({
      where: { status: { in: MESA_STATUSES } },
      include: { customer: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.serviceOrder.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
  ]);
  const numberMap: Record<string, number> = {};
  allOrders.forEach((o, i) => { numberMap[o.id] = i + 1; });

  const cards = orders.map((o) => ({
    id: o.id,
    number: numberMap[o.id] ?? 0,
    customerName: o.customer?.name ?? 'Sem cliente',
    customerPhone: o.customer?.phone ?? '',
    device: o.device,
    brand: o.brand,
    model: o.model,
    defect: o.defect,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  }));

  return <MesaBoard cards={cards} />;
}


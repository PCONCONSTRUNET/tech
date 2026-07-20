import prisma from '@/lib/prisma';
import MesaBoard from './MesaBoard';

export const dynamic = 'force-dynamic';

const MESA_STATUSES = ['RECEBIDO', 'EM_ANALISE', 'AGUARDANDO_PECA', 'EM_CONSERTO', 'PRONTO', 'ENTREGUE'];

export default async function MesaPage() {
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

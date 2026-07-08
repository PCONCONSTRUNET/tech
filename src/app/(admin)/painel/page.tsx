import { TrendingUp, ShoppingBag, Wrench, DollarSign, MoreHorizontal, PackageOpen } from 'lucide-react';
import DashboardOSList from './DashboardOSList';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

export default async function AdminDashboard() {
  const allOS = await prisma.serviceOrder.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'asc' }
  });

  const osListWithNumber = allOS.map((os, index) => ({
    ...os,
    number: index + 1
  })).reverse().slice(0, 5);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sales = await prisma.sale.aggregate({
    _sum: { totalAmount: true },
    where: {
      createdAt: { gte: startOfMonth },
      status: 'CONCLUIDO'
    }
  });
  const salesTotal = sales._sum.totalAmount || 0;

  const osCompleted = await prisma.serviceOrder.count({
    where: { status: 'ENTREGUE' }
  });

  const income = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { type: 'RECEITA', status: 'PAGO' }
  });
  const expense = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { type: 'DESPESA', status: 'PAGO' }
  });
  const grossProfit = (income._sum.amount || 0) - (expense._sum.amount || 0);

  const toReceive = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { type: 'RECEBER', status: 'PENDENTE' }
  });
  const toReceiveTotal = toReceive._sum.amount || 0;

  const topSold = await prisma.saleItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 4
  });

  const productIds = topSold.map(t => t.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });

  const topProductsFormatted = topSold.map(sold => {
    const p = products.find(prod => prod.id === sold.productId);
    return {
      name: p?.name || 'Produto Excluído',
      sales: `${sold._sum.quantity} un`,
      price: formatCurrency(p?.salePrice || 0),
      image: '📦'
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Painel</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" style={{ backgroundColor: 'white' }}>Últimos 30 dias</button>
          <button className="btn btn-primary">+ Nova OS</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard icon={<ShoppingBag size={24} color="#4f46e5" />} title="Vendas do Mês" value={formatCurrency(salesTotal)} trend="0%" />
        <StatCard icon={<Wrench size={24} color="#f59e0b" />} title="OS Concluídas" value={String(osCompleted)} trend="0%" />
        <StatCard icon={<TrendingUp size={24} color="#10b981" />} title="Lucro Bruto" value={formatCurrency(grossProfit)} trend="0%" />
        <StatCard icon={<DollarSign size={24} color="#ef4444" />} title="A Receber" value={formatCurrency(toReceiveTotal)} trend="0%" />
      </div>

      <div className="grid-responsive-2-1" style={{ gap: '24px' }}>
        {/* Recent OS */}
        <DashboardOSList osList={osListWithNumber} />

        {/* Top Products */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Produtos Mais Vendidos</h2>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><MoreHorizontal size={20} color="var(--color-text-muted)" /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topProductsFormatted.length > 0 ? (
              topProductsFormatted.map((prod, idx) => (
                <ProductItem key={idx} name={prod.name} sales={prod.sales} price={prod.price} image={prod.image} />
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
                <PackageOpen size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>Nenhuma venda registrada</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, trend }: { icon: React.ReactNode; title: string; value: string; trend: string }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: isPositive ? 'var(--color-success)' : 'var(--color-error)', backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '99px' }}>
          {trend}
        </span>
      </div>
      <div>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: '500' }}>{title}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text)' }}>{value}</div>
      </div>
    </div>
  );
}



function ProductItem({ name, sales, price, image }: { name: string, sales: string, price: string, image: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
        {image}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{name}</div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{sales} vendidas</div>
      </div>
      <div style={{ fontWeight: '600' }}>{price}</div>
    </div>
  );
}

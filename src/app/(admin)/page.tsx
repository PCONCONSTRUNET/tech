import { TrendingUp, ShoppingBag, Wrench, DollarSign, MoreHorizontal } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" style={{ backgroundColor: 'white' }}>Últimos 30 dias</button>
          <button className="btn btn-primary">+ Nova OS</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard icon={<ShoppingBag size={24} color="#4f46e5" />} title="Vendas do Mês" value="R$ 15.430" trend="+12%" />
        <StatCard icon={<Wrench size={24} color="#f59e0b" />} title="OS Concluídas" value="142" trend="+5%" />
        <StatCard icon={<TrendingUp size={24} color="#10b981" />} title="Lucro Bruto" value="R$ 6.210" trend="+18%" />
        <StatCard icon={<DollarSign size={24} color="#ef4444" />} title="A Receber" value="R$ 1.850" trend="-2%" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent OS */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Últimas Ordens de Serviço</h2>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><MoreHorizontal size={20} color="var(--color-text-muted)" /></button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>OS</th>
                  <th>Cliente</th>
                  <th>Aparelho</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <TableRow os="#1042" customer="João Silva" device="iPhone 13 Pro" status="Pronto" statusColor="var(--color-success)" value="R$ 450,00" />
                <TableRow os="#1043" customer="Maria Oliveira" device="Samsung S22" status="Em Conserto" statusColor="var(--color-warning)" value="R$ 280,00" />
                <TableRow os="#1044" customer="Carlos Souza" device="Motorola Edge" status="Aguardando Peça" statusColor="var(--color-info)" value="R$ 150,00" />
                <TableRow os="#1045" customer="Ana Paula" device="Xiaomi 12" status="Recebido" statusColor="var(--color-text-muted)" value="A orçar" />
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Produtos Mais Vendidos</h2>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><MoreHorizontal size={20} color="var(--color-text-muted)" /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ProductItem name="Película de Vidro 3D" sales="84 un" price="R$ 25,00" image="📱" />
            <ProductItem name="Carregador Turbo 20W" sales="45 un" price="R$ 80,00" image="🔌" />
            <ProductItem name="Capa Anti-Impacto" sales="32 un" price="R$ 45,00" image="🛡️" />
            <ProductItem name="Fone Bluetooth TWS" sales="18 un" price="R$ 120,00" image="🎧" />
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

function TableRow({ os, customer, device, status, statusColor, value }: { os: string, customer: string, device: string, status: string, statusColor: string, value: string }) {
  return (
    <tr>
      <td style={{ fontWeight: '600' }}>{os}</td>
      <td>{customer}</td>
      <td style={{ color: 'var(--color-text-muted)' }}>{device}</td>
      <td>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: statusColor, backgroundColor: `${statusColor}22`, padding: '4px 8px', borderRadius: '4px' }}>
          {status}
        </span>
      </td>
      <td style={{ fontWeight: '500' }}>{value}</td>
    </tr>
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

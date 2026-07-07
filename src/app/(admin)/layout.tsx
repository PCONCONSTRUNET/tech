import { LayoutDashboard, Users, Wrench, Package, ShoppingCart, DollarSign, Settings, Bell, Search, Menu } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
          <img src="/logo.png" alt="Digital Tech" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }} />
        </div>
        
        <nav style={{ padding: '0 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavItem href="/" icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem href="/customers" icon={<Users size={20} />} label="Clientes" />
          <NavItem href="/os" icon={<Wrench size={20} />} label="Ordens de Serviço" />
          <NavItem href="/products" icon={<Package size={20} />} label="Estoque" />
          <NavItem href="/pos" icon={<ShoppingCart size={20} />} label="PDV" />
          <NavItem href="/finance" icon={<DollarSign size={20} />} label="Financeiro" />
        </nav>

        <div style={{ padding: '24px 12px' }}>
          <NavItem href="/settings" icon={<Settings size={20} />} label="Configurações" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Menu size={24} style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }} />
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="Buscar..." className="input" style={{ paddingLeft: '40px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg)', border: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: 'var(--color-error)', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AD</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Admin</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>admin@digitaltech.com</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content-scrollable">
          <div className="container" style={{ maxWidth: '1400px' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      textDecoration: 'none',
      color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
      backgroundColor: active ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
      fontWeight: active ? '600' : '500',
      transition: 'all 0.2s'
    }}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

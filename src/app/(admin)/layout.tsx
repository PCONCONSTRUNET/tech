'use client';

import { LayoutDashboard, Users, Wrench, Package, ShoppingCart, DollarSign, Settings, Bell, Search, Menu, Truck, CreditCard, FileText, Receipt, Tag, ShoppingBag, Columns2, Landmark, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';

const iconMap = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  Columns2: <Columns2 size={20} />,
  Users: <Users size={20} />,
  Truck: <Truck size={20} />,
  Wrench: <Wrench size={20} />,
  FileText: <FileText size={20} />,
  Package: <Package size={20} />,
  ShoppingCart: <ShoppingCart size={20} />,
  DollarSign: <DollarSign size={20} />,
  CreditCard: <CreditCard size={20} />,
  Receipt: <Receipt size={20} />,
  Tag: <Tag size={20} />,
  ShoppingBag: <ShoppingBag size={20} />,
  Landmark: <Landmark size={20} />
};

const defaultNavItems = [
  { id: 'dashboard', href: '/painel', iconName: 'LayoutDashboard', label: 'Painel' },
  { id: 'mesa', href: '/painel/mesa', iconName: 'Columns2', label: 'Mesa / Fluxo' },
  { id: 'sales', href: '/painel/sales', iconName: 'ShoppingBag', label: 'Vendas' },
  { id: 'pos', href: '/painel/pos', iconName: 'ShoppingCart', label: 'PDV Físico' },
  { id: 'caixa', href: '/painel/caixa', iconName: 'Landmark', label: 'Caixa' },
  { id: 'parts', href: '/painel/parts', iconName: 'Package', label: 'Peças' },
  { id: 'products', href: '/painel/products', iconName: 'ShoppingBag', label: 'Produtos' },
  { id: 'customers', href: '/painel/customers', iconName: 'Users', label: 'Clientes' },
  { id: 'suppliers', href: '/painel/suppliers', iconName: 'Truck', label: 'Fornecedores' },
  { id: 'os', href: '/painel/os', iconName: 'Wrench', label: 'Ordens de Serviço' },
  { id: 'quotes', href: '/painel/quotes', iconName: 'FileText', label: 'Orçamentos' },
  { id: 'finance', href: '/painel/finance', iconName: 'DollarSign', label: 'Financeiro' },
  { id: 'payments', href: '/painel/payments', iconName: 'CreditCard', label: 'Pagamentos' },
  // { id: 'invoices', href: '/painel/invoices', iconName: 'Receipt', label: 'Notas Fiscais' },
  { id: 'coupons', href: '/painel/coupons', iconName: 'Tag', label: 'Cupons' },
  { id: 'integrations', href: '/painel/integrations', iconName: 'Settings', label: 'Integrações' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [navOrder, setNavOrder] = useState<string[]>(defaultNavItems.map(item => item.id));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarOrder');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        const defaultIds = defaultNavItems.map(i => i.id);
        const missing = defaultIds.filter(id => !parsed.includes(id));
        if (missing.length > 0) {
          parsed = [...parsed, ...missing];
          localStorage.setItem('sidebarOrder', JSON.stringify(parsed));
        }
        parsed = parsed.filter((id: string) => defaultIds.includes(id));
        setNavOrder(parsed);
      } catch (e) {
        console.error("Failed to parse sidebarOrder", e);
      }
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId === targetId) return;

    const newOrder = [...navOrder];
    const draggedIndex = newOrder.indexOf(draggedId);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);

    setNavOrder(newOrder);
    localStorage.setItem('sidebarOrder', JSON.stringify(newOrder));
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div style={{ padding: isSidebarCollapsed ? '16px' : '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '80px' }}>
          {!isSidebarCollapsed && (
            <img src="/logo.png" alt="Digital Tech" className="sidebar-logo" style={{ width: '100%', maxHeight: '60px', objectFit: 'contain' }} />
          )}
          {isSidebarCollapsed && (
            <div className="sidebar-logo-small">DT</div>
          )}
          <button 
            className="hide-on-mobile"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: isSidebarCollapsed ? '0' : '4px',
              marginLeft: isSidebarCollapsed ? 'auto' : '8px',
              marginRight: isSidebarCollapsed ? 'auto' : '0'
            }}
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <nav style={{ padding: '0 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navOrder.map(id => {
            const item = defaultNavItems.find(i => i.id === id);
            if (!item) return null;
            
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const handleClick = () => {};

            return (
              <div 
                key={id}
                draggable
                onDragStart={(e) => handleDragStart(e, id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, id)}
                style={{ cursor: 'grab' }}
                title="Arraste para reordenar"
              >
                <NavItem 
                  href={item.href} 
                  icon={iconMap[item.iconName as keyof typeof iconMap]} 
                  label={item.label} 
                  active={isActive} 
                  onClick={handleClick} 
                />
              </div>
            )
          })}
        </nav>

        <div style={{ padding: '24px 12px' }}>
          <NavItem href="/painel/settings" icon={<Settings size={20} />} label="Configurações" active={pathname.startsWith('/painel/settings')} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Menu 
              size={24} 
              style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }} 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div style={{ position: 'relative', width: '300px' }} className="hide-on-mobile">
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="Buscar..." className="input" style={{ paddingLeft: '40px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg)', border: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <NotificationDropdown />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AD</div>
              <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Admin</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>admin@digitaltech.com</span>
              </div>
            </div>
            <button 
              onClick={async () => {
                const { logout } = await import('@/actions/auth');
                await logout();
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Sair"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
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

function NavItem({ href, icon, label, active = false, onClick }: { href: string; icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} draggable={false} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      textDecoration: 'none',
      color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
      backgroundColor: active ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
      fontWeight: active ? '600' : '500',
      transition: 'all 0.2s',
      justifyContent: 'flex-start'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
        {icon}
      </div>
      <span className="nav-item-label">{label}</span>
    </Link>
  );
}

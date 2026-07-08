'use client';

import { LayoutDashboard, Users, Wrench, Package, ShoppingCart, DollarSign, Settings, Bell, Search, Menu, Truck, CreditCard, FileText, Receipt } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const iconMap = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  Users: <Users size={20} />,
  Truck: <Truck size={20} />,
  Wrench: <Wrench size={20} />,
  FileText: <FileText size={20} />,
  Package: <Package size={20} />,
  ShoppingCart: <ShoppingCart size={20} />,
  DollarSign: <DollarSign size={20} />,
  CreditCard: <CreditCard size={20} />,
  Receipt: <Receipt size={20} />
};

const defaultNavItems = [
  { id: 'dashboard', href: '/', iconName: 'LayoutDashboard', label: 'Painel' },
  { id: 'customers', href: '/customers', iconName: 'Users', label: 'Clientes' },
  { id: 'suppliers', href: '/suppliers', iconName: 'Truck', label: 'Fornecedores' },
  { id: 'os', href: '/os', iconName: 'Wrench', label: 'Ordens de Serviço' },
  { id: 'quotes', href: '/quotes', iconName: 'FileText', label: 'Orçamentos' },
  { id: 'products', href: '/products', iconName: 'Package', label: 'Estoque' },
  { id: 'pos', href: '/pos', iconName: 'ShoppingCart', label: 'PDV' },
  { id: 'finance', href: '/finance', iconName: 'DollarSign', label: 'Financeiro' },
  { id: 'payments', href: '/payments', iconName: 'CreditCard', label: 'Pagamentos' },
  { id: 'invoices', href: '/invoices', iconName: 'Receipt', label: 'Notas Fiscais' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navOrder, setNavOrder] = useState<string[]>(defaultNavItems.map(item => item.id));

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

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
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
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
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '8px 24px', display: 'flex', justifyContent: 'center' }}>
          <img src="/logo.png" alt="Digital Tech" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }} />
        </div>
        
        <nav style={{ padding: '0 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navOrder.map(id => {
            const item = defaultNavItems.find(i => i.id === id);
            if (!item) return null;
            
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const handleClick = () => {
              if (item.href === '/' ? pathname !== '/' : !pathname.startsWith(item.href)) {
                setIsNavigating(true);
              }
            };

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
          <NavItem href="/settings" icon={<Settings size={20} />} label="Configurações" active={pathname.startsWith('/settings')} onClick={() => { if (!pathname.startsWith('/settings')) setIsNavigating(true) }} />
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
            {isNavigating ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', width: '100%' }}>
                <div className="custom-loader" />
                <style>{`
                  .custom-loader {
                    display: block;
                    --height-of-loader: 4px;
                    --loader-color: var(--color-primary, #4f46e5);
                    width: 130px;
                    height: var(--height-of-loader);
                    border-radius: 30px;
                    background-color: rgba(0,0,0,0.1);
                    position: relative;
                  }
                  .custom-loader::before {
                    content: "";
                    position: absolute;
                    background: var(--loader-color);
                    top: 0;
                    left: 0;
                    width: 0%;
                    height: 100%;
                    border-radius: 30px;
                    animation: moving 1s ease-in-out infinite;
                  }
                  @keyframes moving {
                    50% { width: 100%; }
                    100% { width: 0; right: 0; left: unset; }
                  }
                `}</style>
              </div>
            ) : (
              children
            )}
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
      transition: 'all 0.2s'
    }}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

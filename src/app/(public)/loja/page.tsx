import Link from 'next/link';
import { Search, ShoppingBag, Smartphone, Battery, MonitorPlay, MessageCircle, Wrench } from 'lucide-react';
import prisma from '@/lib/prisma';
import { CartProvider } from '@/components/loja/CartContext';
import CartSidebar from '@/components/loja/CartSidebar';
import StoreProductCard from '@/components/loja/StoreProductCard';

export const dynamic = 'force-dynamic';

export default async function StorePage() {
  const settings = await prisma.settings.findFirst();
  const products = await prisma.product.findMany({
    where: { active: true, showOnVitrine: true },
    include: { category: true }
  });

  return (
    <CartProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>{settings?.storeName || 'Digital Tech'}</h1>
              )}
            </div>
            
            <div style={{ display: 'none', gap: '24px', '@media (min-width: 768px)': { display: 'flex' } } as any}>
              <Link href="#" style={{ color: 'var(--color-text)', textDecoration: 'none', fontWeight: '500' }}>Smartphones</Link>
              <Link href="#" style={{ color: 'var(--color-text)', textDecoration: 'none', fontWeight: '500' }}>Acessórios</Link>
              <Link href="#" style={{ color: 'var(--color-text)', textDecoration: 'none', fontWeight: '500' }}>Assistência</Link>
              <Link href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600' }}>Acesso Restrito</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', display: 'none', '@media (min-width: 768px)': { display: 'block' } } as any}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input type="text" placeholder="Buscar..." className="input" style={{ paddingLeft: '36px', width: '200px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg)', border: 'none' }} />
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section style={{ backgroundColor: 'var(--color-bg)', padding: '64px 0', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '24px', lineHeight: 1.2, color: 'var(--color-text)' }}>
              A melhor assistência técnica para o seu <span style={{ color: 'var(--color-primary)' }}>dispositivo</span>.
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
              {settings?.warrantyTerm || 'Consertos rápidos, acessórios originais e atendimento de excelência. Tudo o que seu celular precisa em um só lugar.'}
            </p>
          </div>
        </section>

        {/* Categories */}
        <section style={{ padding: '64px 0', backgroundColor: 'var(--color-surface)' }}>
          <div className="container">
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Nossas Categorias</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px' }}>
              <CategoryCard icon={<Smartphone size={32} />} title="Smartphones" />
              <CategoryCard icon={<Battery size={32} />} title="Carregadores" />
              <CategoryCard icon={<MonitorPlay size={32} />} title="Eletrônicos" />
              <CategoryCard icon={<ShoppingBag size={32} />} title="Acessórios" />
              <CategoryCard icon={<Wrench size={32} />} title="Peças" />
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section style={{ padding: '64px 0', backgroundColor: 'var(--color-bg)', flex: 1 }}>
          <div className="container">
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '32px' }}>Destaques</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '32px' }}>
              {products.length > 0 ? products.map(product => {
                let firstPhoto = '📱';
                try {
                  if (product.photos) {
                    const parsed = JSON.parse(product.photos);
                    if (parsed.length > 0) firstPhoto = parsed[0];
                  }
                } catch (e) {}

                return (
                  <StoreProductCard 
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.salePrice,
                      category: product.category?.name || 'Geral',
                      image: product.photoUrl || firstPhoto
                    }}
                  />
                )
              }) : (
                <p style={{ color: 'var(--color-text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>Nenhum produto em destaque no momento.</p>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ backgroundColor: 'var(--color-surface)', padding: '32px 0', borderTop: '1px solid var(--color-border)' }}>
          <div className="container" style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            &copy; {new Date().getFullYear()} {settings?.storeName || 'Digital Tech'}. Todos os direitos reservados.
          </div>
        </footer>

        {/* Cart Sidebar components */}
        <CartSidebar />
      </div>
    </CartProvider>
  );
}

function CategoryCard({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--color-border)' }}>
      <div style={{ color: 'var(--color-primary)' }}>{icon}</div>
      <span style={{ fontWeight: '600' }}>{title}</span>
    </div>
  );
}

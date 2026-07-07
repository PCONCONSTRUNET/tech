import Link from 'next/link';
import { Search, ShoppingBag, Smartphone, Battery, MonitorPlay, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Digital Tech Logo" style={{ height: '100px', width: 'auto', objectFit: 'contain' }} />
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
            <button className="btn btn-primary" style={{ gap: '8px' }}>
              <MessageCircle size={18} />
              <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'inline' } } as any}>WhatsApp</span>
            </button>
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
            Consertos rápidos, acessórios originais e atendimento de excelência. Tudo o que seu celular precisa em um só lugar.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.125rem' }}>Ver Produtos</button>
            <button className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.125rem', backgroundColor: 'white' }}>Solicitar Orçamento</button>
          </div>
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
            <ProductCard name="iPhone 13 Pro Max - 128GB" price="R$ 4.299,00" category="Smartphones" image="📱" />
            <ProductCard name="Carregador Turbo 20W Original" price="R$ 149,90" category="Carregadores" image="🔌" />
            <ProductCard name="Fone Bluetooth TWS Pro" price="R$ 199,00" category="Eletrônicos" image="🎧" />
            <ProductCard name="Capa MagSafe Transparente" price="R$ 89,90" category="Acessórios" image="🛡️" />
            <ProductCard name="Película de Vidro 3D Privacidade" price="R$ 45,00" category="Acessórios" image="✨" />
            <ProductCard name="Cabo Lightning 1m Original" price="R$ 79,90" category="Acessórios" image="🔋" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--color-surface)', padding: '32px 0', borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} Digital Tech. Todos os direitos reservados.
        </div>
      </footer>
    </div>
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

function ProductCard({ name, price, category, image }: { name: string, price: string, category: string, image: string }) {
  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: 'var(--color-bg)', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', borderBottom: '1px solid var(--color-border)' }}>
        {image}
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600', textTransform: 'uppercase' }}>{category}</span>
        <h4 style={{ fontWeight: '600', margin: 0, fontSize: '1rem', lineHeight: 1.4 }}>{name}</h4>
        <div style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '8px' }}>{price}</div>
        <button className="btn btn-outline" style={{ width: '100%', marginTop: '8px', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
          Tenho Interesse
        </button>
      </div>
    </div>
  );
}

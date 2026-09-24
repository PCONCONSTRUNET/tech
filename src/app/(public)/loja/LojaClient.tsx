'use client';

import React, { useState } from 'react';
import { Search, MoreVertical, ShoppingBag, Plus, Minus, ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/components/loja/CartContext';

export default function LojaClient({ initialProducts, initialSettings }: { initialProducts: any[], initialSettings: any }) {
  const { addItem, items, setSidebarOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const CATEGORIAS = ['Todos', 'Barbeadores', 'Carregador Powerbank', 'Cabo Auxiliar'];
  const CNPJ = "58.645.937/0001-02";
  const WHATSAPP = "5519995885715";

  const handleWhatsApp = (prod: any, qtd: number) => {
    const priceToUse = prod.price || prod.salePrice || 0;
    const total = (priceToUse * qtd).toFixed(2).replace('.', ',');
    const msg = encodeURIComponent(`Olá! Gostaria de comprar ${qtd}x *${prod.name}* por R$ ${total}.`);
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
  };

  const parsePhoto = (photoStr: string, fallback: string) => {
    try {
      if (photoStr) {
        const arr = JSON.parse(photoStr);
        if (arr.length > 0) return arr[0];
      }
    } catch(e) {}
    return fallback;
  };


  const MOCK_PRODUCTS = [
    { id: 'm1', name: 'Smartphone DigiTech X Pro', price: 1599.99, oldPrice: 1999.99, discount: '-20%', photoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80', description: 'Cor: Preto\nArmazenamento: 256GB\nAcompanha carregador turbo e capa.' },
    { id: 'm2', name: 'Fone Bluetooth Noise Cancelling', price: 299.90, photoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', description: 'Bateria de até 30 horas.\nCancelamento ativo de ruído.' },
    { id: 'm3', name: 'Carregador Turbo 30W', price: 89.90, oldPrice: 120.00, discount: '-25%', photoUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80' },
    { id: 'm4', name: 'Cabo USB-C Reforçado 2m', price: 35.00, photoUrl: 'https://images.unsplash.com/photo-1620247526978-29ee5ff2d7ef?w=500&q=80' },
    { id: 'm5', name: 'Smartwatch Esportivo 5', price: 450.00, oldPrice: 500.00, discount: '-10%', photoUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80' },
  ];

  const baseProducts = initialProducts && initialProducts.length > 0 ? initialProducts : MOCK_PRODUCTS;

  const displayProducts = baseProducts.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Se o produto tiver categoria, filtra. Se não tiver, ignora o filtro de categoria por enquanto
    const matchesCategory = activeCategory === 'Todos' || !p.category || p.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#141414', color: '#fff', fontFamily: 'sans-serif', paddingBottom: 100 }}>
      {/* Banner */}
      <div style={{ position: 'relative', height: 160, width: '100%', overflow: 'hidden', backgroundColor: '#000' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${initialSettings?.logoUrl || '/logo.png'})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #141414, transparent)' }} />
      </div>

      {/* Perfil */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 16px', marginTop: -40, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid #141414', overflow: 'hidden', backgroundColor: '#222' }}>
            <img src={initialSettings?.logoUrl || '/logo.png'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
          </div>
          <div style={{ paddingBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{initialSettings?.storeName || '$digitechmobiles'}</h1>
            <p style={{ margin: 0, fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
              DIEGO HENRIQUE LAVORENTI
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, paddingBottom: 12 }}>
          <Link href="/painel" title="Painel Administrativo" style={{ color: '#ccc', display: 'flex', alignItems: 'center' }}>
            <LayoutDashboard size={22} />
          </Link>
          <div onClick={() => setIsSearching(!isSearching)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Search size={22} color={isSearching ? "#fff" : "#ccc"} />
          </div>
          <div 
            style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => setSidebarOpen(true)}
          >
            <ShoppingBag size={22} color="#ccc" />
            {items.length > 0 && (
              <div style={{
                position: 'absolute', top: '-6px', right: '-8px',
                backgroundColor: 'var(--color-primary)', color: 'white',
                borderRadius: '50%', width: '16px', height: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 'bold'
              }}>
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      {isSearching && (
        <div style={{ padding: '16px', backgroundColor: '#1a1a1a', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
            <Search size={18} color="#999" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              autoFocus
              placeholder="O que você está procurando?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                borderRadius: '24px',
                border: '1px solid #333',
                backgroundColor: '#222',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* CNPJ */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px', backgroundColor: '#1a1a1a', marginTop: 16, borderTop: '1px solid #333', borderBottom: '1px solid #333', fontSize: '0.75rem', color: '#999', paddingRight: '5%' }}>
        <span>CNPJ {CNPJ}</span>
      </div>

      {selectedProduct ? (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 5%' }}>
          <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', color: '#ccc', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 24, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Voltar para a loja
          </button>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48 }}>
            {/* Left Column: Image */}
            <div style={{ flex: '1 1 400px', maxWidth: '500px' }}>
              <div style={{ aspectRatio: '1/1', backgroundColor: '#222', borderRadius: 16, overflow: 'hidden' }}>
                <img src={parsePhoto(selectedProduct.photos, selectedProduct.photoUrl)} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Right Column: Details */}
            <div style={{ flex: '1 1 400px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 16 }}>{selectedProduct.name}</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>R$ {(selectedProduct.price || selectedProduct.salePrice || 0).toFixed(2).replace('.', ',')}</span>
                {(selectedProduct.discount) && (
                  <span style={{ padding: '2px 8px', backgroundColor: '#2a1b3d', color: '#b388ff', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: 6 }}>
                    {selectedProduct.discount}
                  </span>
                )}
              </div>
              
              {(selectedProduct.oldPrice) && (
                <div style={{ fontSize: '0.9rem', color: '#666', textDecoration: 'line-through', marginBottom: 32 }}>
                  De: R$ {selectedProduct.oldPrice.toFixed(2).replace('.', ',')}
                </div>
              )}

              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: 8 }}>Quantidade</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, backgroundColor: 'transparent', border: '1px solid #333', borderRadius: 24, padding: '8px 16px' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex' }}><Minus size={16} /></button>
                  <span style={{ fontWeight: 600, width: 20, textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex' }}><Plus size={16} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
                <button 
                  onClick={() => {
                    addItem({
                      id: String(selectedProduct.id),
                      name: selectedProduct.name,
                      price: selectedProduct.price || selectedProduct.salePrice || 0,
                      image: parsePhoto(selectedProduct.photos, selectedProduct.photoUrl)
                    }, quantity);
                  }}
                  style={{ flex: 1, minWidth: 200, padding: '16px', backgroundColor: '#333', color: '#fff', borderRadius: 30, fontSize: '0.9rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                  Adicionar ao carrinho
                </button>
                <button 
                  onClick={() => handleWhatsApp(selectedProduct, quantity)}
                  style={{ flex: 1, minWidth: 200, padding: '16px', backgroundColor: '#fff', color: '#000', borderRadius: 30, fontSize: '0.9rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                  Comprar agora
                </button>
              </div>

              <hr style={{ borderColor: '#333', borderBottom: 'none', marginBottom: 32 }} />

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Descrição</h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {selectedProduct.description || "Nenhuma descrição fornecida para este produto."}
                </p>
              </div>

              <button onClick={() => window.open(`https://wa.me/${WHATSAPP}`, '_blank')} style={{ background: 'none', border: 'none', color: '#ccc', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Falar com o vendedor
            </button>
          </div>
        </div>

        <hr style={{ borderColor: '#222', borderBottom: 'none', margin: '48px 0' }} />
        
        {/* Mais produtos dessa loja */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Mais produtos dessa loja</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '24px 16px' }}>
          {displayProducts.filter((p: any) => p.id !== selectedProduct.id).slice(0, 8).map((p: any) => (
            <div key={p.id} onClick={() => { setSelectedProduct(p); setQuantity(1); window.scrollTo(0,0); }} style={{ cursor: 'pointer' }}>
              <div style={{ aspectRatio: '1/1', backgroundColor: '#222', position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                {p.photoUrl || p.photos ? (
                  <img src={parsePhoto(p.photos, p.photoUrl)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag color="#555" size={32} />
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '0.85rem', color: '#ccc', margin: '0 0 6px 0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: 'normal' }}>
                  {p.name}
                </h3>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>
                  R$ {(p.price || p.salePrice || 0).toFixed(2).replace('.', ',')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      ) : (
        <>
          {/* Categorias */}
          <div style={{ padding: '20px 5% 8px 5%', overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 20,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    border: activeCategory === cat ? 'none' : '1px solid #444',
                    backgroundColor: activeCategory === cat ? '#fff' : 'transparent',
                    color: activeCategory === cat ? '#000' : '#ccc',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>


          {/* Produtos */}
          <div style={{ marginTop: 32, padding: '0 5%' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 16px 0' }}>Produtos</h2>
            
            {displayProducts.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '24px 16px' }}>
                {displayProducts.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => { setSelectedProduct(p); setQuantity(1); window.scrollTo(0,0); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ aspectRatio: '1/1', backgroundColor: '#222', position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                      {p.discount && (
                        <div style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#2a1b3d', color: '#b388ff', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: 4, zIndex: 2 }}>
                          {p.discount}
                        </div>
                      )}
                      {p.photoUrl || p.photos ? (
                        <img src={parsePhoto(p.photos, p.photoUrl)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag color="#555" size={32} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.85rem', color: '#ccc', margin: '0 0 6px 0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: 'normal' }}>
                        {p.name}
                      </h3>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>
                        R$ {(p.price || p.salePrice || 0).toFixed(2).replace('.', ',')}
                      </div>
                      {p.oldPrice && (
                        <div style={{ fontSize: '0.7rem', color: '#666', textDecoration: 'line-through', marginTop: 2 }}>
                          R$ {p.oldPrice.toFixed(2).replace('.', ',')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999' }}>Nenhum produto encontrado.</p>
            )}
          </div>
        </>
      )}

      {/* WhatsApp flutuante */}
      {!selectedProduct && (
        <div style={{ position: 'fixed', bottom: 24, right: 16, zIndex: 50 }}>
          <button 
            onClick={() => window.open(`https://wa.me/${WHATSAPP}`, '_blank')}
            style={{ width: 56, height: 56, backgroundColor: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}

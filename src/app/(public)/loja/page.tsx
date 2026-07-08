import React from 'react';
import prisma from '@/lib/prisma';
import LojaClient from './LojaClient';
import { CartProvider } from '@/components/loja/CartContext';
import CartSidebar from '@/components/loja/CartSidebar';

export const dynamic = 'force-dynamic';

export default async function LojaPage() {
  const settings = await prisma.settings.findFirst();
  
  // Note: we fetch products so we can pass them to the client
  const products = await prisma.product.findMany({
    where: { active: true, showOnVitrine: true },
    include: { category: true }
  });

  return (
    <CartProvider>
      <LojaClient 
        initialProducts={products} 
        initialSettings={settings} 
      />
      <CartSidebar />
    </CartProvider>
  );
}

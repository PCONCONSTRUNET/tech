import React from 'react';
import prisma from '@/lib/prisma';
import LojaClient from './LojaClient';
import { CartProvider } from '@/components/loja/CartContext';
import CartSidebar from '@/components/loja/CartSidebar';

export const dynamic = 'force-dynamic';

export default async function LojaPage() {
  const settings = await prisma.settings.findFirst();
  
  const products = await prisma.product.findMany({
    where: { active: true, showOnVitrine: true },
    include: { category: true }
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <CartProvider>
      <LojaClient 
        initialProducts={products} 
        initialSettings={settings}
        initialCategories={categories}
      />
      <CartSidebar />
    </CartProvider>
  );
}

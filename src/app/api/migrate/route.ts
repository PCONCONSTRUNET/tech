import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const results = [];

  // SaleItem - manter o nome do produto gravado no histórico, mas permitir deletar produto
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "SaleItem" DROP CONSTRAINT IF EXISTS "SaleItem_productId_fkey"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "SaleItem" ALTER COLUMN "productId" DROP NOT NULL`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    results.push('SaleItem OK');
  } catch(e: any) { results.push('SaleItem ERR: ' + e.message); }

  return NextResponse.json({ success: true, results });
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const results = [];
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "QuoteItem" DROP CONSTRAINT "QuoteItem_productId_fkey"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    results.push('QuoteItem OK');
  } catch(e: any) { results.push('QuoteItem ERR: ' + e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "ServiceOrderItem" DROP CONSTRAINT "ServiceOrderItem_productId_fkey"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "ServiceOrderItem" ADD CONSTRAINT "ServiceOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    results.push('ServiceOrderItem OK');
  } catch(e: any) { results.push('ServiceOrderItem ERR: ' + e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_productId_fkey"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    results.push('StockMovement OK');
  } catch(e: any) { results.push('StockMovement ERR: ' + e.message); }

  return NextResponse.json({ success: true, results });
}

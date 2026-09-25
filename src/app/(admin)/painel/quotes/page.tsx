export const dynamic = 'force-dynamic';
import { getQuotes } from '@/actions/quote'
import prisma from '@/lib/prisma'
import QuotesClient from './QuotesClient'



export default async function QuotesPage() {
  const quotes = await getQuotes()
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } })
  const products = await prisma.product.findMany({ 
    where: { active: true },
    orderBy: { name: 'asc' } 
  })

  return <QuotesClient quotes={quotes} customers={customers} products={products} />
}


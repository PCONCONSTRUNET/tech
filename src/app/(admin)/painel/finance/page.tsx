import { getTransactions, getTransactionCategories } from '@/actions/finance'
import FinanceClient from './FinanceClient'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const transactions = await getTransactions()
  const categories = await getTransactionCategories()
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } })

  return (
    <FinanceClient 
      transactions={transactions} 
      categories={categories} 
      customers={customers}
    />
  )
}

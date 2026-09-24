import { getTransactions, getTransactionCategories } from '@/actions/finance'
import PaymentsClient from './PaymentsClient'
import prisma from '@/lib/prisma'



export default async function PaymentsPage() {
  const transactions = await getTransactions()
  const categories = await getTransactionCategories()
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } })

  return (
    <PaymentsClient 
      transactions={transactions} 
      categories={categories} 
      customers={customers}
    />
  )
}

import FinanceClient from './FinanceClient'
import { getTransactions } from '@/actions/finance'

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const transactions = await getTransactions()
  
  return <FinanceClient transactions={transactions} />
}

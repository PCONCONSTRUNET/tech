import { getTransactions, getTransactionCategories } from '@/actions/finance'
import FinanceClient from './FinanceClient'
import prisma from '@/lib/prisma'

import { Suspense } from 'react';



export default function FinancePage() {
  return (
    <Suspense fallback={<FinanceSkeleton />}>
      <FinanceData />
    </Suspense>
  )
}

function FinanceSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ height: '40px', width: '200px', backgroundColor: 'var(--color-border)', borderRadius: '8px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '40px', width: '150px', backgroundColor: 'var(--color-border)', borderRadius: '8px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
      </div>
      <div className="grid-responsive-3">
        {[1, 2, 3].map(i => <div key={i} style={{ height: '140px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />)}
      </div>
      <div style={{ height: '400px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
    </div>
  )
}

async function FinanceData() {
  const [transactions, categories, customers] = await Promise.all([
    getTransactions(),
    getTransactionCategories(),
    prisma.customer.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <FinanceClient 
      transactions={transactions} 
      categories={categories} 
      customers={customers}
    />
  )
}

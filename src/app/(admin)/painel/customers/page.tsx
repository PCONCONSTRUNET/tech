import CustomerClient from './CustomerClient'
import { getCustomers } from '@/actions/customer'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const customers = await getCustomers()
  
  return <CustomerClient customers={customers} />
}

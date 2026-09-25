export const dynamic = 'force-dynamic';
import CustomerClient from './CustomerClient'
import { getCustomers } from '@/actions/customer'



export default async function CustomersPage() {
  const customers = await getCustomers()
  
  return <CustomerClient customers={customers} />
}


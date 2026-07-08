import OSClient from './OSClient'
import { getServiceOrders } from '@/actions/os'
import { getCustomers } from '@/actions/customer'

export const dynamic = 'force-dynamic'

export default async function OSPage() {
  const [serviceOrders, customers] = await Promise.all([
    getServiceOrders(),
    getCustomers()
  ])
  
  return <OSClient serviceOrders={serviceOrders} customers={customers} />
}

export const dynamic = 'force-dynamic';
import OSClient from './OSClient'
import { getServiceOrders } from '@/actions/os'
import { getCustomers } from '@/actions/customer'
import { getProducts } from '@/actions/product'

export default async function OSPage() {
  const [serviceOrders, customers, services] = await Promise.all([
    getServiceOrders(),
    getCustomers(),
    getProducts('SERVICE')
  ])
  
  return <OSClient serviceOrders={serviceOrders} customers={customers} services={services} />
}


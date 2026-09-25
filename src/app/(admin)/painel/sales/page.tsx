export const dynamic = 'force-dynamic';
import SalesClient from './SalesClient'
import { getSales } from '@/actions/sale'



export default async function SalesPage() {
  const sales = await getSales()
  return <SalesClient sales={sales} />
}


import SalesClient from './SalesClient'
import { getSales } from '@/actions/sale'

export const dynamic = 'force-dynamic'

export default async function SalesPage() {
  const sales = await getSales()
  return <SalesClient sales={sales} />
}

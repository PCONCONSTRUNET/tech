export const dynamic = 'force-dynamic';
import SalesClient from './SalesClient'
import { getSales } from '@/actions/sale'
import { getSettings } from '@/actions/settings'



export default async function SalesPage() {
  const [sales, settings] = await Promise.all([getSales(), getSettings()])
  return <SalesClient sales={sales} store={{ name: settings?.storeName, whatsapp: settings?.whatsapp, fiscalData: settings?.fiscalData }} />
}


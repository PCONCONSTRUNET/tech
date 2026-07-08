import { getSuppliers } from '@/actions/supplier'
import SupplierClient from './SupplierClient'

export const dynamic = 'force-dynamic'

export default async function SuppliersPage() {
  const suppliers = await getSuppliers()

  return <SupplierClient suppliers={suppliers} />
}

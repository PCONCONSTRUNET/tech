import ProductClient from './ProductClient'
import { getProducts } from '@/actions/product'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const products = await getProducts()
  
  return <ProductClient products={products} />
}

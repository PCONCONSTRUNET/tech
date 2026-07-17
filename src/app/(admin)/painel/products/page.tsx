import ProductClient from './ProductClient'
import { getProducts, getCategories } from '@/actions/product'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const products = await getProducts('PRODUCT')
  const categories = await getCategories()
  
  return <ProductClient products={products} categories={categories} title="Vitrine / Loja" type="PRODUCT" />
}

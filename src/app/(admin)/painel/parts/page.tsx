import ProductClient from './ProductClient'
import { getProducts, getCategories } from '@/actions/product'

export const dynamic = 'force-dynamic';

export default async function PartsPage() {
  const products = await getProducts('PART')
  const categories = await getCategories()
  
  return <ProductClient products={products} categories={categories} title="Peças / Estoque" type="PART" />
}

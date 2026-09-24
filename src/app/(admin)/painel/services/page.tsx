import ProductClient from '../products/ProductClient'
import { getProducts, getCategories } from '@/actions/product'

export default async function ServicesPage() {
  const products = await getProducts('SERVICE')
  const categories = await getCategories()
  
  return <ProductClient products={products} categories={categories} title="Serviços" type="SERVICE" />
}

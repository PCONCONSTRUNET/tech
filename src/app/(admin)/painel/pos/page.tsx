import POSClient from './POSClient'
import { getProducts } from '@/actions/product'



export default async function POSPage() {
  const products = await getProducts()
  
  return <POSClient products={products} />
}

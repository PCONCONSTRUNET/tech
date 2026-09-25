import ProductClient from './ProductClient'
import { getProducts, getCategories } from '@/actions/product'

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  try {
    const products = await getProducts('PRODUCT')
    const categories = await getCategories()
    return <ProductClient products={products} categories={categories} title="Vitrine / Loja" type="PRODUCT" />
  } catch (error: any) {
    return (
      <div style={{ padding: '24px', color: 'red' }}>
        <h2>Erro Fatal no Servidor (Prisma)</h2>
        <p>A mensagem que o banco de dados retornou foi:</p>
        <pre style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '8px', overflowX: 'auto', color: '#991b1b', fontSize: '0.85rem' }}>
          {error?.message || String(error)}
        </pre>
      </div>
    )
  }
}

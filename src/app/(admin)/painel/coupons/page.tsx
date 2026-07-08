import CouponClient from './CouponClient'
import { getCoupons } from '@/actions/coupon'

export const dynamic = 'force-dynamic'

export default async function CouponsPage() {
  const coupons = await getCoupons()
  
  return <CouponClient coupons={coupons} />
}

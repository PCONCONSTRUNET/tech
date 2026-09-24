import CouponClient from './CouponClient'
import { getCoupons } from '@/actions/coupon'



export default async function CouponsPage() {
  const coupons = await getCoupons()
  
  return <CouponClient coupons={coupons} />
}

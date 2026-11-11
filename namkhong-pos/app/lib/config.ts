import { BrandConfig } from './types'

export const brandConfig: BrandConfig = {
  name: process.env.BRAND_NAME || 'Namkhong Riverside Restaurant',
  address: process.env.BRAND_ADDRESS || '123/45 ถนนตัวอย่าง อ.เมือง จ.เชียงใหม่ 50000',
  phone: process.env.BRAND_PHONE || '081-234-5678',
  logoUrl: process.env.BRAND_LOGO_URL || '/logo.png',
  serviceRate: Number(process.env.SERVICE_RATE) || 10,
  vatRate: Number(process.env.VAT_RATE) || 7,
}
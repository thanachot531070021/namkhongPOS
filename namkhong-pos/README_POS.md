# Namkhong Riverside Restaurant POS System

ระบบ POS สำหรับร้านอาหารไทย พัฒนาด้วย Next.js 15, TypeScript, Prisma และ PostgreSQL

## ✨ คุณสมบัติหลัก

- 🔐 **ระบบล็อกอินและจัดการผู้ใช้** - รองรับ 4 บทบาท (Admin, Cashier, Waiter, Kitchen)
- 🍽️ **การจัดการโต๊ะ** - ดูสถานะโต๊ะและเลือกโต๊ะสำหรับรับออเดอร์
- 📝 **ระบบสั่งอาหาร** - UI 2 คอลัมน์ ค้นหาเมนู จัดการรายการอาหาร
- 👨‍🍳 **KDS (Kitchen Display System)** - หน้าจอแสดงคิวงานสำหรับครัว
- 📊 **แดชบอร์ดแอดมิน** - สถิติยอดขาย กราฟ การจัดการระบบ
- 🧾 **ใบเสร็จ** - รองรับการพิมพ์ Thermal, HTML และ PDF
- 📈 **รายงานยอดขาย** - ฟิลเตอร์ช่วงเวลา ส่งออก Excel/PDF

## 🎭 บทบาทผู้ใช้งาน (RBAC)

| บทบาท | สิทธิ์การเข้าถึง | หน้าที่ |
|--------|----------------|---------|
| **Admin** | เข้าทุกหน้า + ทุก API | จัดการระบบ, ดูรายงาน, จัดการเมนู/ผู้ใช้ |
| **Cashier** | tables/order/receipt/reports | รับออเดอร์, ปิดบิล, ดูรายงานพื้นฐาน |
| **Waiter** | tables/order (ไม่ปิดบิล) | รับออเดอร์, จัดการรายการอาหาร |
| **Kitchen** | KDS เท่านั้น | ดูคิวงาน, อัปเดตสถานะอาหาร |

## 🛠️ การติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่าฐานข้อมูล

1. สร้างฐานข้อมูล PostgreSQL:
```sql
CREATE DATABASE namkhongPOS_db;
```

2. อัปเดตไฟล์ `.env` (มีข้อมูลตัวอย่างอยู่แล้ว):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/namkhongPOS_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Migration และ Seed ข้อมูล

```bash
# Push schema to database
npm run db:push

# Seed ข้อมูลตัวอย่าง
npm run db:seed
```

### 4. รันโปรเจค

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

เข้าใช้งานได้ที่: http://localhost:3000

## 👥 บัญชีทดสอบ

| Username | Password | Role | เข้าถึงหน้า |
|----------|----------|------|------------|
| `admin` | `admin123` | Admin | /admin |
| `cashier` | `cashier123` | Cashier | /tables |
| `waiter` | `waiter123` | Waiter | /tables |
| `kitchen` | `kitchen123` | Kitchen | /kds |

## 📁 โครงสร้างโปรเจค

```
namkhong-pos/
├── app/
│   ├── api/                 # API Routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── tables/          # จัดการโต๊ะ
│   │   ├── orders/          # จัดการออเดอร์
│   │   ├── menu/            # เมนูอาหาร
│   │   ├── categories/      # หมวดหมู่
│   │   └── kds/            # Kitchen Display System
│   ├── login/              # หน้าล็อกอิน
│   ├── tables/             # จัดการโต๊ะ (Waiter/Cashier)
│   ├── order/[tableId]/    # หน้าสั่งอาหาร
│   ├── kds/               # Kitchen Display System
│   ├── admin/             # Admin Dashboard (TODO)
│   ├── lib/               # Utilities
│   │   ├── auth.ts        # NextAuth config
│   │   ├── config.ts      # Brand configuration
│   │   └── types.ts       # TypeScript types
│   └── providers/         # React Providers
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Seed data script
├── middleware.ts          # Route protection
└── package.json
```

## 🍽️ ข้อมูลตัวอย่าง

### โต๊ะ
- T01 ถึง T10 (สถานะเริ่มต้น: ปิด)

### หมวดหมู่เมนู
1. อาหารจานเดียว
2. ต้ม/แกง  
3. เครื่องดื่ม

### เมนูตัวอย่าง
1. ข้าวผัดกุ้ง - ฿120
2. ผัดไทย - ฿80
3. ต้มยำกุ้ง - ฿150
4. แกงเขียวหวาน - ฿140
5. น้ำมะนาวโซดา - ฿45

## 🔧 คำสั่งที่มีประโยชน์

```bash
# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Run seed script

# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint            # Run ESLint
```

## 🎯 Flow การใช้งาน

1. **Login** → Redirect ตาม role
   - Admin → `/admin`
   - Kitchen → `/kds` 
   - Cashier/Waiter → `/tables`

2. **Tables** → เลือกโต๊ะ → ไป `/order/[tableId]`

3. **Order** → เพิ่มเมนู (status: queued) → เห็นใน KDS ทันที

4. **KDS** → เริ่มทำ (cooking) → เสิร์ฟแล้ว (served)

5. **Order** → ปิดบิล (Cashier เท่านั้น) → พิมพ์ใบเสร็จ

## 🏢 การตั้งค่าร้าน

แก้ไขได้ในไฟล์ `.env`:

```env
BRAND_NAME="Namkhong Riverside Restaurant"
BRAND_ADDRESS="123/45 ถนนตัวอย่าง อ.เมือง จ.เชียงใหม่ 50000"
BRAND_PHONE="081-234-5678" 
BRAND_LOGO_URL="/logo.png"
SERVICE_RATE=10  # ค่าบริการ 10%
VAT_RATE=7       # ภาษี 7%
```

## ⚡ สถานะการพัฒนา

### ✅ เสร็จแล้ว
- [x] ระบบ Authentication + RBAC
- [x] การจัดการโต๊ะ
- [x] ระบบสั่งอาหาร (2-column UI)
- [x] KDS (Kitchen Display System)
- [x] Database Schema + Seed Data
- [x] API Endpoints พื้นฐาน

### 🚧 กำลังพัฒนา
- [ ] Admin Dashboard + Analytics
- [ ] การจัดการเมนู/ผู้ใช้
- [ ] ระบบใบเสร็จ (Thermal/HTML/PDF)
- [ ] รายงานยอดขาย + Export
- [ ] การปิดบิล + Payment Methods

## 🐛 การแก้ปัญหา

### ปัญหาที่พบบ่อย

1. **Database Connection Error**
   - ตรวจสอบ PostgreSQL ทำงาน
   - ตรวจสอบ DATABASE_URL ในไฟล์ `.env`

2. **Prisma Client Error**  
   - รัน `npm run db:push` และ `npx prisma generate`

3. **NextAuth Session Error**
   - ตรวจสอบ NEXTAUTH_SECRET ในไฟล์ `.env`

4. **Font/Thai Display Issue**
   - ตรวจสอบ Noto Sans Thai font loading

## 📞 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- เปิด Issue ใน GitHub Repository
- ตรวจสอบ Console Logs สำหรับข้อผิดพลาด
- ดู Network Tab ใน DevTools สำหรับ API errors
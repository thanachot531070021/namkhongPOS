import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create users
  const hashedPassword = {
    admin: await bcrypt.hash('admin123', 12),
    cashier: await bcrypt.hash('cashier123', 12),
    waiter: await bcrypt.hash('waiter123', 12),
    kitchen: await bcrypt.hash('kitchen123', 12),
  }

  const users = await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        password: hashedPassword.admin,
        role: 'admin',
      },
      {
        username: 'cashier',
        password: hashedPassword.cashier,
        role: 'cashier',
      },
      {
        username: 'waiter',
        password: hashedPassword.waiter,
        role: 'waiter',
      },
      {
        username: 'kitchen',
        password: hashedPassword.kitchen,
        role: 'kitchen',
      },
    ],
    skipDuplicates: true,
  })
  console.log('Created users:', users.count)

  // Create tables
  const tables = await prisma.table.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      number: `T${(i + 1).toString().padStart(2, '0')}`,
      status: 'closed' as const,
    })),
    skipDuplicates: true,
  })
  console.log('Created tables:', tables.count)

  // Create categories
  const categoryData = [
    { name: 'อาหารจานเดียว' },
    { name: 'ต้ม/แกง' },
    { name: 'เครื่องดื่ม' },
  ]

  const categories = []
  for (const cat of categoryData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
    categories.push(category)
  }
  console.log('Created categories:', categories.length)

  // Create menu items
  const menuItems = [
    {
      name: 'ข้าวผัดกุ้ง',
      price: 120,
      description: 'ข้าวผัดกุ้งสดใส่ไข่',
      imageUrl: '/menu/khao-pad-kung.jpg',
      categoryId: categories[0].id,
    },
    {
      name: 'ผัดไทย',
      price: 80,
      description: 'ผัดไทยรสชาติต้นตำรับ',
      imageUrl: '/menu/pad-thai.jpg',
      categoryId: categories[0].id,
    },
    {
      name: 'ต้มยำกุ้ง',
      price: 150,
      description: 'ต้มยำกุ้งน้ำใส รสเปรี้ยวเผ็ด',
      imageUrl: '/menu/tom-yam-kung.jpg',
      categoryId: categories[1].id,
    },
    {
      name: 'แกงเขียวหวาน',
      price: 140,
      description: 'แกงเขียวหวานไก่ใส่มะเขือ',
      imageUrl: '/menu/gaeng-keow-wan.jpg',
      categoryId: categories[1].id,
    },
    {
      name: 'น้ำมะนาวโซดา',
      price: 45,
      description: 'น้ำมะนาวโซดาเย็นๆ',
      imageUrl: '/menu/nam-manao-soda.jpg',
      categoryId: categories[2].id,
    },
  ]

  const createdMenuItems = []
  for (const item of menuItems) {
    const menuItem = await prisma.menuItem.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    })
    createdMenuItems.push(menuItem)
  }
  console.log('Created menu items:', createdMenuItems.length)

  console.log('Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
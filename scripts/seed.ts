import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Alimentation' },
      update: {},
      create: { name: 'Alimentation', description: 'Produits alimentaires de base' },
    }),
    prisma.category.upsert({
      where: { name: 'Boulangerie' },
      update: {},
      create: { name: 'Boulangerie', description: 'Pain et viennoiseries' },
    }),
    prisma.category.upsert({
      where: { name: 'Fruits' },
      update: {},
      create: { name: 'Fruits', description: 'Fruits frais' },
    }),
    prisma.category.upsert({
      where: { name: 'Boissons' },
      update: {},
      create: { name: 'Boissons', description: 'Boissons et jus' },
    }),
    prisma.category.upsert({
      where: { name: 'Snacks' },
      update: {},
      create: { name: 'Snacks', description: 'Snacks et grignotages' },
    }),
    prisma.category.upsert({
      where: { name: 'Confiserie' },
      update: {},
      create: { name: 'Confiserie', description: 'Bonbons et chocolats' },
    }),
  ])

  console.log('✅ Categories created')

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { barcode: '3017620422003' },
      update: {},
      create: {
        name: 'Lait 1L',
        price: 786, // 1.20 EUR * 655 = 786 FCFA
        costPrice: 524, // 0.80 EUR * 655 = 524 FCFA
        stock: 50,
        minStock: 10,
        barcode: '3017620422003',
        sku: 'LAIT001',
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { barcode: '3017620422004' },
      update: {},
      create: {
        name: 'Pain baguette',
        price: 557, // 0.85 EUR * 655 = 557 FCFA
        costPrice: 328, // 0.50 EUR * 655 = 328 FCFA
        stock: 30,
        minStock: 5,
        barcode: '3017620422004',
        sku: 'PAIN001',
        categoryId: categories[1].id,
      },
    }),
    prisma.product.upsert({
      where: { barcode: '3017620422005' },
      update: {},
      create: {
        name: 'Yaourt nature',
        price: 426, // 0.65 EUR * 655 = 426 FCFA
        costPrice: 262, // 0.40 EUR * 655 = 262 FCFA
        stock: 100,
        minStock: 20,
        barcode: '3017620422005',
        sku: 'YAOURT001',
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { barcode: '3017620422006' },
      update: {},
      create: {
        name: 'Pommes Golden',
        price: 1638, // 2.50 EUR * 655 = 1638 FCFA
        costPrice: 1179, // 1.80 EUR * 655 = 1179 FCFA
        stock: 25,
        minStock: 5,
        barcode: '3017620422006',
        sku: 'POMMES001',
        categoryId: categories[2].id,
      },
    }),
    prisma.product.upsert({
      where: { barcode: '3017620422007' },
      update: {},
      create: {
        name: 'Eau minérale 1.5L',
        price: 590, // 0.90 EUR * 655 = 590 FCFA
        costPrice: 393, // 0.60 EUR * 655 = 393 FCFA
        stock: 80,
        minStock: 15,
        barcode: '3017620422007',
        sku: 'EAU001',
        categoryId: categories[3].id,
      },
    }),
    prisma.product.upsert({
      where: { barcode: '3017620422008' },
      update: {},
      create: {
        name: 'Chips nature',
        price: 721, // 1.10 EUR * 655 = 721 FCFA
        costPrice: 459, // 0.70 EUR * 655 = 459 FCFA
        stock: 45,
        minStock: 10,
        barcode: '3017620422008',
        sku: 'CHIPS001',
        categoryId: categories[4].id,
      },
    }),
    prisma.product.upsert({
      where: { barcode: '3017620422009' },
      update: {},
      create: {
        name: 'Café moulu 250g',
        price: 2293, // 3.50 EUR * 655 = 2293 FCFA
        costPrice: 1638, // 2.50 EUR * 655 = 1638 FCFA
        stock: 20,
        minStock: 5,
        barcode: '3017620422009',
        sku: 'CAFE001',
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { barcode: '3017620422010' },
      update: {},
      create: {
        name: 'Bananes 1kg',
        price: 1179, // 1.80 EUR * 655 = 1179 FCFA
        costPrice: 786, // 1.20 EUR * 655 = 786 FCFA
        stock: 35,
        minStock: 8,
        barcode: '3017620422010',
        sku: 'BANANES001',
        categoryId: categories[2].id,
      },
    }),
    prisma.product.upsert({
      where: { barcode: '3017620422011' },
      update: {},
      create: {
        name: 'Jus d\'orange 1L',
        price: 1277, // 1.95 EUR * 655 = 1277 FCFA
        costPrice: 852, // 1.30 EUR * 655 = 852 FCFA
        stock: 40,
        minStock: 10,
        barcode: '3017620422011',
        sku: 'JUS001',
        categoryId: categories[3].id,
      },
    }),
    prisma.product.upsert({
      where: { barcode: '3017620422012' },
      update: {},
      create: {
        name: 'Chocolat noir',
        price: 1441, // 2.20 EUR * 655 = 1441 FCFA
        costPrice: 983, // 1.50 EUR * 655 = 983 FCFA
        stock: 60,
        minStock: 15,
        barcode: '3017620422012',
        sku: 'CHOCO001',
        categoryId: categories[5].id,
      },
    }),
  ])

  console.log('✅ Products created')

  // Create promo codes
  const promoCodes = await Promise.all([
    prisma.promoCode.upsert({
      where: { code: 'WELCOME10' },
      update: {},
      create: {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minAmount: 50,
        maxUses: 100,
        usedCount: 45,
        validUntil: new Date('2025-12-31'),
        description: '10% de réduction pour nouveaux clients',
        isActive: true,
      },
    }),
    prisma.promoCode.upsert({
      where: { code: 'SUMMER20' },
      update: {},
      create: {
        code: 'SUMMER20',
        type: 'percentage',
        value: 20,
        minAmount: 65500, // 100 EUR * 655 = 65500 FCFA
        maxUses: 50,
        usedCount: 23,
        validUntil: new Date('2025-08-31'),
        description: '20% de réduction été',
        isActive: true,
      },
    }),
    prisma.promoCode.upsert({
      where: { code: 'FREESHIP' },
      update: {},
      create: {
        code: 'FREESHIP',
        type: 'fixed',
        value: 9825, // 15 EUR * 655 = 9825 FCFA
        minAmount: 49125, // 75 EUR * 655 = 49125 FCFA
        maxUses: 200,
        usedCount: 89,
        validUntil: new Date('2025-12-31'),
        description: 'Livraison gratuite (9825 FCFA)',
        isActive: true,
      },
    }),
    prisma.promoCode.upsert({
      where: { code: 'FLASH50' },
      update: {},
      create: {
        code: 'FLASH50',
        type: 'percentage',
        value: 50,
        minAmount: 131000, // 200 EUR * 655 = 131000 FCFA
        maxUses: 10,
        usedCount: 8,
        validUntil: new Date('2025-12-31'),
        description: '50% de réduction flash',
        isActive: true,
      },
    }),
    prisma.promoCode.upsert({
      where: { code: 'LOYALTY5' },
      update: {},
      create: {
        code: 'LOYALTY5',
        type: 'percentage',
        value: 5,
        minAmount: 16375, // 25 EUR * 655 = 16375 FCFA
        maxUses: 500,
        usedCount: 156,
        validUntil: new Date('2025-12-31'),
        description: '5% fidélité',
        isActive: true,
      },
    }),
  ])

  console.log('✅ Promo codes created')

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { loyaltyCard: 'LOY001' },
      update: {},
      create: {
        name: 'Kossi Adjo',
        phone: '+22890123456',
        email: 'kossi.adjo@email.com',
        address: '123 Rue du Commerce, Lomé',
        loyaltyCard: 'LOY001',
        totalSpent: 819078, // 1250.50 EUR * 655 = 819078 FCFA
        visitCount: 15,
      },
    }),
    prisma.customer.upsert({
      where: { loyaltyCard: 'LOY002' },
      update: {},
      create: {
        name: 'Awa Mensah',
        phone: '+22898765432',
        email: 'awa.mensah@email.com',
        address: '456 Avenue de la Paix, Kara',
        loyaltyCard: 'LOY002',
        totalSpent: 583441, // 890.75 EUR * 655 = 583441 FCFA
        visitCount: 12,
      },
    }),
  ])

  console.log('✅ Customers created')

  // Create sample settings
  const settings = await Promise.all([
    prisma.setting.upsert({
      where: { key: 'store_name' },
      update: {},
      create: {
        key: 'store_name',
        value: 'Magasin StockFlow',
        description: 'Nom du magasin',
      },
    }),
    prisma.setting.upsert({
      where: { key: 'tax_rate' },
      update: {},
      create: {
        key: 'tax_rate',
        value: '18',
        description: 'Taux de TVA (%)',
      },
    }),
    prisma.setting.upsert({
      where: { key: 'currency' },
      update: {},
      create: {
        key: 'currency',
        value: 'XOF',
        description: 'Devise du magasin',
      },
    }),
  ])

  console.log('✅ Settings created')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
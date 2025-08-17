import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.inventoryMovement.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.category.deleteMany()
  await prisma.promoCode.deleteMany()
  await prisma.taxRate.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Create tax rates for Togo
  console.log('💰 Creating tax rates...')
  const taxRates = await Promise.all([
    prisma.taxRate.create({
      data: {
        name: 'TVA 18%',
        rate: 18.0,
        isDefault: true,
        description: 'Taux de TVA standard au Togo'
      }
    }),
    prisma.taxRate.create({
      data: {
        name: 'TVA 10%',
        rate: 10.0,
        isDefault: false,
        description: 'Taux de TVA réduit'
      }
    }),
    prisma.taxRate.create({
      data: {
        name: 'TVA 5%',
        rate: 5.0,
        isDefault: false,
        description: 'Taux de TVA super réduit'
      }
    }),
    prisma.taxRate.create({
      data: {
        name: 'Exonéré',
        rate: 0.0,
        isDefault: false,
        description: 'Produits exonérés de TVA'
      }
    })
  ])

  console.log(`✅ Created ${taxRates.length} tax rates`)

  // Create categories
  console.log('📂 Creating categories...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Boissons',
        description: 'Boissons et rafraîchissements'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Alimentation',
        description: 'Produits alimentaires'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Hygiène',
        description: 'Produits d\'hygiène et de beauté'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Électronique',
        description: 'Produits électroniques et accessoires'
      }
    })
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Create products with tax rates
  console.log('📦 Creating products...')
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'KOLIKO55',
        description: 'Boisson énergisante KOLIKO55',
        price: 40000, // 40000 FCFA
        costPrice: 30000,
        stock: 50,
        minStock: 10,
        barcode: '1234567890123',
        sku: 'KOL55-001',
        categoryId: categories[0].id,
        taxRateId: taxRates[0].id, // 18% TVA
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Eau minérale 1L',
        description: 'Eau minérale naturelle 1 litre',
        price: 15000, // 15000 FCFA
        costPrice: 10000,
        stock: 100,
        minStock: 20,
        barcode: '1234567890124',
        sku: 'EAU-001',
        categoryId: categories[0].id,
        taxRateId: taxRates[1].id, // 10% TVA
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Pain de mie',
        description: 'Pain de mie frais',
        price: 5000, // 5000 FCFA
        costPrice: 3500,
        stock: 30,
        minStock: 5,
        barcode: '1234567890125',
        sku: 'PAIN-001',
        categoryId: categories[1].id,
        taxRateId: taxRates[2].id, // 5% TVA
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Savon de toilette',
        description: 'Savon de toilette parfumé',
        price: 25000, // 25000 FCFA
        costPrice: 18000,
        stock: 40,
        minStock: 8,
        barcode: '1234567890126',
        sku: 'SAVON-001',
        categoryId: categories[2].id,
        taxRateId: taxRates[0].id, // 18% TVA
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Chargeur USB',
        description: 'Chargeur USB universel',
        price: 150000, // 150000 FCFA
        costPrice: 120000,
        stock: 15,
        minStock: 3,
        barcode: '1234567890127',
        sku: 'CHARGE-001',
        categoryId: categories[3].id,
        taxRateId: taxRates[0].id, // 18% TVA
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Livre scolaire',
        description: 'Livre scolaire pour enfants',
        price: 80000, // 80000 FCFA
        costPrice: 60000,
        stock: 25,
        minStock: 5,
        barcode: '1234567890128',
        sku: 'LIVRE-001',
        categoryId: categories[1].id,
        taxRateId: taxRates[3].id, // Exonéré
        isActive: true
      }
    })
  ])

  console.log(`✅ Created ${products.length} products`)

  // Create promo codes
  console.log('🎫 Creating promo codes...')
  const promoCodes = await Promise.all([
    prisma.promoCode.create({
      data: {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minAmount: 50000, // 50000 FCFA
        maxUses: 100,
        usedCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        description: '10% de réduction pour les nouveaux clients',
        isActive: true
      }
    }),
    prisma.promoCode.create({
      data: {
        code: 'FIDELITE20',
        type: 'percentage',
        value: 20,
        minAmount: 100000, // 100000 FCFA
        maxUses: 50,
        usedCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        description: '20% de réduction pour les clients fidèles',
        isActive: true
      }
    }),
    prisma.promoCode.create({
      data: {
        code: 'FLAT5000',
        type: 'fixed',
        value: 50000, // 50000 FCFA
        minAmount: 200000, // 200000 FCFA
        maxUses: 25,
        usedCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        description: '50000 FCFA de réduction sur commande de 200000 FCFA',
        isActive: true
      }
    })
  ])

  console.log(`✅ Created ${promoCodes.length} promo codes`)

  // Create customers
  console.log('👥 Creating customers...')
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Kossi Adjo',
        email: 'kossi.adjo@email.com',
        phone: '+22890123456',
        address: '123 Rue du Marché, Lomé, Togo',
        loyaltyCard: 'LOY001',
        totalSpent: 1500000, // 1500000 FCFA
        visitCount: 15,
        isActive: true
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Awa Mensah',
        email: 'awa.mensah@email.com',
        phone: '+22898765432',
        address: '456 Avenue de la Paix, Kara, Togo',
        loyaltyCard: 'LOY002',
        totalSpent: 800000, // 800000 FCFA
        visitCount: 8,
        isActive: true
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Komlan Doe',
        email: 'komlan.doe@email.com',
        phone: '+22855556666',
        address: '789 Boulevard des Étoiles, Sokodé, Togo',
        loyaltyCard: 'LOY003',
        totalSpent: 1200000, // 1200000 FCFA
        visitCount: 12,
        isActive: true
      }
    })
  ])

  console.log(`✅ Created ${customers.length} customers`)

  // Create sample sales
  console.log('🛒 Creating sample sales...')
  const sales = await Promise.all([
    prisma.sale.create({
      data: {
        customerId: customers[0].id,
        totalAmount: 120000, // 120000 FCFA
        discountAmount: 12000, // 12000 FCFA (10% promo)
        taxAmount: 19440, // 19440 FCFA (18% TVA on 108000)
        finalAmount: 127440, // 127440 FCFA
        paymentMethod: 'cash',
        paymentStatus: 'completed',
        saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        notes: 'Vente avec promo WELCOME10'
      }
    }),
    prisma.sale.create({
      data: {
        customerId: customers[1].id,
        totalAmount: 85000, // 85000 FCFA
        discountAmount: 0,
        taxAmount: 15300, // 15300 FCFA (18% TVA)
        finalAmount: 100300, // 100300 FCFA
        paymentMethod: 'card',
        paymentStatus: 'completed',
        saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: 'Paiement par carte'
      }
    })
  ])

  console.log(`✅ Created ${sales.length} sales`)

  // Create sale items
  console.log('📋 Creating sale items...')
  const saleItems = await Promise.all([
    // Sale 1 items
    prisma.saleItem.create({
      data: {
        saleId: sales[0].id,
        productId: products[0].id, // KOLIKO55
        quantity: 2,
        unitPrice: 40000, // 40000 FCFA
        discount: 0,
        totalPrice: 80000 // 80000 FCFA
      }
    }),
    prisma.saleItem.create({
      data: {
        saleId: sales[0].id,
        productId: products[1].id, // Eau minérale
        quantity: 1,
        unitPrice: 15000, // 15000 FCFA
        discount: 0,
        totalPrice: 15000 // 15000 FCFA
      }
    }),
    prisma.saleItem.create({
      data: {
        saleId: sales[0].id,
        productId: products[2].id, // Pain de mie
        quantity: 1,
        unitPrice: 5000, // 5000 FCFA
        discount: 0,
        totalPrice: 5000 // 5000 FCFA
      }
    }),
    // Sale 2 items
    prisma.saleItem.create({
      data: {
        saleId: sales[1].id,
        productId: products[3].id, // Savon
        quantity: 2,
        unitPrice: 25000, // 25000 FCFA
        discount: 0,
        totalPrice: 50000 // 50000 FCFA
      }
    }),
    prisma.saleItem.create({
      data: {
        saleId: sales[1].id,
        productId: products[4].id, // Chargeur
        quantity: 1,
        unitPrice: 150000, // 150000 FCFA
        discount: 0,
        totalPrice: 150000 // 150000 FCFA
      }
    })
  ])

  console.log(`✅ Created ${saleItems.length} sale items`)

  // Create inventory movements
  console.log('📦 Creating inventory movements...')
  const inventoryMovements = await Promise.all([
    prisma.inventoryMovement.create({
      data: {
        productId: products[0].id,
        type: 'purchase',
        quantity: 50,
        previousStock: 0,
        newStock: 50,
        reason: 'Achat initial',
        reference: 'PO-001',
        notes: 'Premier achat de KOLIKO55'
      }
    }),
    prisma.inventoryMovement.create({
      data: {
        productId: products[0].id,
        type: 'sale',
        quantity: -2,
        previousStock: 50,
        newStock: 48,
        reason: 'Vente',
        reference: sales[0].id,
        notes: 'Vente de 2 unités'
      }
    })
  ])

  console.log(`✅ Created ${inventoryMovements.length} inventory movements`)

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- ${taxRates.length} tax rates`)
  console.log(`- ${categories.length} categories`)
  console.log(`- ${products.length} products`)
  console.log(`- ${promoCodes.length} promo codes`)
  console.log(`- ${customers.length} customers`)
  console.log(`- ${sales.length} sales`)
  console.log(`- ${saleItems.length} sale items`)
  console.log(`- ${inventoryMovements.length} inventory movements`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
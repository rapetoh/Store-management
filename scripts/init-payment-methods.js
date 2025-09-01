const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initPaymentMethods() {
  try {
    console.log('🚀 Initializing payment methods...')
    
    // Default payment methods
    const defaultPaymentMethods = [
      {
        name: 'Espèces',
        code: 'cash',
        icon: 'DollarSign',
        isActive: true,
        requiresReceipt: true,
        sortOrder: 1,
        description: 'Paiement en espèces'
      },
      {
        name: 'Carte bancaire',
        code: 'card',
        icon: 'CreditCard',
        isActive: true,
        requiresReceipt: true,
        sortOrder: 2,
        description: 'Paiement par carte bancaire'
      },
      {
        name: 'Chèque',
        code: 'check',
        icon: 'DollarSign',
        isActive: true,
        requiresReceipt: true,
        sortOrder: 3,
        description: 'Paiement par chèque'
      },
      {
        name: 'Virement',
        code: 'transfer',
        icon: 'CreditCard',
        isActive: true,
        requiresReceipt: false,
        sortOrder: 4,
        description: 'Paiement par virement bancaire'
      },
      {
        name: 'PayPal',
        code: 'paypal',
        icon: 'CreditCard',
        isActive: false,
        requiresReceipt: true,
        sortOrder: 5,
        description: 'Paiement via PayPal'
      }
    ]

    // Create payment methods
    for (const method of defaultPaymentMethods) {
      const existing = await prisma.paymentMethod.findUnique({
        where: { code: method.code }
      })
      
      if (!existing) {
        await prisma.paymentMethod.create({
          data: method
        })
        console.log(`✅ Created payment method: ${method.name} (${method.code})`)
      } else {
        console.log(`⏭️  Payment method already exists: ${method.name} (${method.code})`)
      }
    }

    console.log('🎉 Payment methods initialization completed!')
    
    // Display all payment methods
    const allMethods = await prisma.paymentMethod.findMany({
      orderBy: { sortOrder: 'asc' }
    })
    
    console.log('\n📋 Current payment methods:')
    allMethods.forEach(method => {
      console.log(`  - ${method.name} (${method.code}) - ${method.isActive ? 'Active' : 'Inactive'}`)
    })

  } catch (error) {
    console.error('❌ Error initializing payment methods:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
initPaymentMethods()


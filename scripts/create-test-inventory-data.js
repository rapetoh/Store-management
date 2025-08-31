const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestInventoryData() {
  try {
    console.log('🔧 Création de données d\'inventaire de test...')
    
    // Get all active products
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true
      }
    })

    console.log(`📦 ${products.length} produits trouvés`)

    if (products.length === 0) {
      console.log('❌ Aucun produit trouvé pour créer des données d\'inventaire')
      return
    }

    // Create test inventory data for different dates
    const testDates = [
      { date: new Date('2025-01-15'), count: 4, status: 'OK' },
      { date: new Date('2025-01-20'), count: 6, status: 'ADJUSTED' },
      { date: new Date('2025-01-25'), count: 3, status: 'OK' },
      { date: new Date('2025-01-30'), count: 8, status: 'ADJUSTED' }
    ]

    let updatedCount = 0

    for (const testData of testDates) {
      // Select random products for this date
      const shuffled = [...products].sort(() => 0.5 - Math.random())
      const selectedProducts = shuffled.slice(0, testData.count)

      // Update products with inventory data
      for (const product of selectedProducts) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            lastInventoryDate: testData.date,
            lastInventoryStatus: testData.status
          }
        })
        updatedCount++
      }

      console.log(`📅 ${testData.date.toLocaleDateString('fr-FR')}: ${testData.count} produits marqués comme ${testData.status}`)
    }

    console.log(`✅ ${updatedCount} produits mis à jour avec des données d'inventaire`)

    // Show summary
    const totalInventoried = await prisma.product.count({
      where: {
        isActive: true,
        lastInventoryDate: {
          not: null
        }
      }
    })

    const totalProducts = await prisma.product.count({
      where: {
        isActive: true
      }
    })

    console.log(`\n📊 Résumé:`)
    console.log(`- Total produits: ${totalProducts}`)
    console.log(`- Produits inventoriés: ${totalInventoried}`)
    console.log(`- Pourcentage: ${Math.round((totalInventoried / totalProducts) * 100)}%`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createTestInventoryData() 
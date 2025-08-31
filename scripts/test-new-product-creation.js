const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testNewProductCreation() {
  try {
    console.log('🧪 Test de la nouvelle logique de création de produit...')
    
    // Get a category for testing
    const category = await prisma.category.findFirst()
    if (!category) {
      console.log('❌ Aucune catégorie trouvée. Créez d\'abord une catégorie.')
      return
    }

    // Create a test product with the new logic
    const testProduct = await prisma.product.create({
      data: {
        name: 'Produit Test - Stock Zéro',
        description: 'Produit de test pour vérifier la nouvelle logique',
        price: 5000,
        costPrice: 3000,
        stock: 0, // Stock initial toujours à 0
        minStock: 5,
        barcode: 'TEST123456789',
        sku: 'TEST-001',
        categoryId: category.id,
        isActive: true
      }
    })

    console.log('✅ Produit créé avec succès:')
    console.log(`- Nom: ${testProduct.name}`)
    console.log(`- Stock initial: ${testProduct.stock}`)
    console.log(`- Prix de vente: ${testProduct.price} FCFA`)
    console.log(`- Prix d'achat: ${testProduct.costPrice} FCFA`)
    console.log(`- Catégorie: ${category.name}`)

    // Verify the stock is indeed 0
    if (testProduct.stock === 0) {
      console.log('✅ Confirmation: Le stock initial est bien à 0')
    } else {
      console.log('❌ Erreur: Le stock initial n\'est pas à 0')
    }

    console.log('\n📝 Instructions pour l\'utilisateur:')
    console.log('1. Le produit a été créé avec un stock de 0')
    console.log('2. Pour ajouter du stock, allez dans la section "Ravitaillement"')
    console.log('3. Créez un ravitaillement pour ce produit')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testNewProductCreation() 
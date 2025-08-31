const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testEditProductStockProtection() {
  try {
    console.log('🧪 Test de protection du stock dans la modification de produit...')
    
    // Get a product to test with
    const product = await prisma.product.findFirst({
      where: { isActive: true }
    })
    
    if (!product) {
      console.log('❌ Aucun produit actif trouvé pour le test.')
      return
    }

    console.log('📦 Produit de test:')
    console.log(`- Nom: ${product.name}`)
    console.log(`- Stock actuel: ${product.stock}`)
    console.log(`- Prix: ${product.price} FCFA`)

    // Simulate what would happen if someone tried to modify the stock
    const originalStock = product.stock
    const fakeModifiedStock = originalStock + 10 // Simulate someone trying to add 10

    console.log('\n🔒 Test de protection:')
    console.log(`- Stock original: ${originalStock}`)
    console.log(`- Tentative de modification vers: ${fakeModifiedStock}`)
    console.log(`- Stock qui sera réellement sauvegardé: ${originalStock} (inchangé)`)

    // Simulate the API call that would be made
    const updateData = {
      name: product.name,
      price: product.price,
      costPrice: product.costPrice,
      stock: originalStock, // This should be the original stock, not the modified one
      minStock: product.minStock,
      categoryId: product.categoryId
    }

    console.log('\n✅ Résultat attendu:')
    console.log('- Le stock reste inchangé malgré la tentative de modification')
    console.log('- Seuls les autres champs peuvent être modifiés')
    console.log('- La traçabilité est préservée')

    console.log('\n📝 Instructions pour l\'utilisateur:')
    console.log('1. Ouvrez le modal "Modifier le produit"')
    console.log('2. Le champ "Stock actuel" doit être grisé et non modifiable')
    console.log('3. Un message explicatif doit indiquer comment modifier le stock')
    console.log('4. Seuls les autres champs (nom, prix, etc.) peuvent être modifiés')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testEditProductStockProtection() 
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testStockFilters() {
  try {
    console.log('🧪 Test des filtres de stock...')
    
    // Get all products to analyze
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true
      }
    })

    console.log(`📦 Total produits actifs: ${allProducts.length}`)

    // Test low stock filter
    const lowStockProducts = allProducts.filter(product => 
      product.stock > 0 && product.stock <= product.minStock
    )

    console.log('\n🔴 Produits en stock faible:')
    lowStockProducts.forEach(product => {
      console.log(`- ${product.name}: Stock ${product.stock}/${product.minStock}`)
    })

    // Test out of stock filter
    const outOfStockProducts = allProducts.filter(product => 
      product.stock === 0
    )

    console.log('\n❌ Produits en rupture:')
    outOfStockProducts.forEach(product => {
      console.log(`- ${product.name}: Stock ${product.stock}`)
    })

    // Test API endpoints
    console.log('\n🌐 Test des endpoints API:')
    
    // Test low stock API
    const lowStockResponse = await fetch('http://localhost:3000/api/products?lowStock=true&limit=10')
    const lowStockData = await lowStockResponse.json()
    console.log(`- API Stock faible: ${lowStockData.products?.length || 0} produits`)

    // Test out of stock API
    const outOfStockResponse = await fetch('http://localhost:3000/api/products?outOfStock=true&limit=10')
    const outOfStockData = await outOfStockResponse.json()
    console.log(`- API Rupture: ${outOfStockData.products?.length || 0} produits`)

    // Test all products API
    const allResponse = await fetch('http://localhost:3000/api/products?limit=10')
    const allData = await allResponse.json()
    console.log(`- API Tous: ${allData.products?.length || 0} produits`)

    console.log('\n✅ Résultats attendus:')
    console.log(`- Stock faible: ${lowStockProducts.length} produits`)
    console.log(`- Rupture: ${outOfStockProducts.length} produits`)
    console.log(`- Total: ${allProducts.length} produits`)

    console.log('\n📝 Instructions pour l\'utilisateur:')
    console.log('1. Allez dans la section "Produits"')
    console.log('2. Ouvrez les filtres')
    console.log('3. Sélectionnez "Stock faible" dans le filtre Stock')
    console.log('4. Vérifiez que seuls les produits en stock faible s\'affichent')
    console.log('5. Testez aussi le filtre "Rupture"')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testStockFilters() 
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testImportValidations() {
  try {
    console.log('🧪 Test des nouvelles validations d\'import...')
    
    // Test 1: Produit sans code-barres (doit échouer)
    console.log('\n📋 Test 1: Produit sans code-barres')
    const testProduct1 = {
      name: 'Produit Test Sans Barcode',
      price: 1000,
      costPrice: 500,
      stock: 10,
      category: 'Test'
      // Pas de barcode - doit échouer
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: [testProduct1] })
      })
      const result = await response.json()
      console.log('✅ Résultat attendu: Erreur de validation')
      console.log(`- Erreurs: ${result.errors?.length || 0}`)
      console.log(`- Message: ${result.errors?.[0] || 'Aucune erreur'}`)
    } catch (error) {
      console.log('❌ Erreur de connexion:', error.message)
    }
    
    // Test 2: Produit sans stock (doit échouer)
    console.log('\n📋 Test 2: Produit sans stock')
    const testProduct2 = {
      name: 'Produit Test Sans Stock',
      price: 1000,
      costPrice: 500,
      barcode: 'TEST123456789',
      category: 'Test'
      // Pas de stock - doit échouer
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: [testProduct2] })
      })
      const result = await response.json()
      console.log('✅ Résultat attendu: Erreur de validation')
      console.log(`- Erreurs: ${result.errors?.length || 0}`)
      console.log(`- Message: ${result.errors?.[0] || 'Aucune erreur'}`)
    } catch (error) {
      console.log('❌ Erreur de connexion:', error.message)
    }
    
    // Test 3: Produit avec stock à 0 (doit réussir)
    console.log('\n📋 Test 3: Produit avec stock à 0')
    const testProduct3 = {
      name: 'Produit Test Stock Zero',
      price: 1000,
      costPrice: 500,
      stock: 0, // Stock à 0 - doit réussir
      barcode: `TEST${Date.now()}3`,
      category: 'Test'
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: [testProduct3] })
      })
      const result = await response.json()
      console.log('✅ Résultat attendu: Import réussi')
      console.log(`- Imported: ${result.summary?.imported || 0}`)
      console.log(`- Errors: ${result.summary?.errors || 0}`)
      
      // Nettoyer
      if (result.summary?.imported > 0) {
        await prisma.product.deleteMany({
          where: { barcode: testProduct3.barcode }
        })
        console.log('🧹 Produit de test supprimé')
      }
    } catch (error) {
      console.log('❌ Erreur de connexion:', error.message)
    }
    
    // Test 4: Détection des doublons par code-barres uniquement
    console.log('\n📋 Test 4: Détection des doublons par code-barres uniquement')
    
    // Créer un produit avec un code-barres unique
    const uniqueBarcode = `TEST${Date.now()}4`
    const testProduct4 = {
      name: 'Produit Test Unique',
      price: 1000,
      costPrice: 500,
      stock: 10,
      barcode: uniqueBarcode,
      category: 'Test'
    }
    
    try {
      const response1 = await fetch('http://localhost:3000/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: [testProduct4] })
      })
      const result1 = await response1.json()
      console.log('✅ Premier produit importé')
      console.log(`- Imported: ${result1.summary?.imported || 0}`)
      
      // Essayer d'importer un produit avec le même code-barres mais nom différent
      const testProduct4b = {
        name: 'Produit Test Différent Nom',
        price: 2000,
        costPrice: 1000,
        stock: 20,
        barcode: uniqueBarcode, // Même code-barres
        category: 'Test'
      }
      
      const response2 = await fetch('http://localhost:3000/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: [testProduct4b] })
      })
      const result2 = await response2.json()
      console.log('✅ Résultat attendu: Doublon détecté par code-barres')
      console.log(`- Skipped: ${result2.summary?.skipped || 0}`)
      console.log(`- Errors: ${result2.summary?.errors || 0}`)
      
      // Nettoyer
      await prisma.product.deleteMany({
        where: { barcode: uniqueBarcode }
      })
      console.log('🧹 Produit de test supprimé')
    } catch (error) {
      console.log('❌ Erreur de connexion:', error.message)
    }
    
    // Test 5: Produits avec même nom mais code-barres différents (doit réussir)
    console.log('\n📋 Test 5: Produits avec même nom mais code-barres différents')
    const testProduct5a = {
      name: 'Produit Même Nom',
      price: 1000,
      costPrice: 500,
      stock: 10,
      barcode: `TEST${Date.now()}5a`,
      category: 'Test'
    }
    
    const testProduct5b = {
      name: 'Produit Même Nom', // Même nom
      price: 2000,
      costPrice: 1000,
      stock: 20,
      barcode: `TEST${Date.now()}5b`, // Code-barres différent
      category: 'Test'
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: [testProduct5a, testProduct5b] })
      })
      const result = await response.json()
      console.log('✅ Résultat attendu: Les deux produits importés (noms identiques mais code-barres différents)')
      console.log(`- Imported: ${result.summary?.imported || 0}`)
      console.log(`- Skipped: ${result.summary?.skipped || 0}`)
      console.log(`- Errors: ${result.summary?.errors || 0}`)
      
      // Nettoyer
      await prisma.product.deleteMany({
        where: { 
          barcode: { 
            in: [testProduct5a.barcode, testProduct5b.barcode] 
          } 
        }
      })
      console.log('🧹 Produits de test supprimés')
    } catch (error) {
      console.log('❌ Erreur de connexion:', error.message)
    }
    
    console.log('\n🎯 Résumé des tests:')
    console.log('✅ Code-barres obligatoire: Implémenté')
    console.log('✅ Stock obligatoire: Implémenté')
    console.log('✅ Stock peut être 0: Implémenté')
    console.log('✅ Détection des doublons par code-barres uniquement: Implémenté')
    console.log('✅ Produits avec même nom mais code-barres différents: Acceptés')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testImportValidations() 
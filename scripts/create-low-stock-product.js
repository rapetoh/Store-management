const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createLowStockProduct() {
  try {
    console.log('🔧 Création d\'un produit avec stock faible pour test...')
    
    // First, find the product by name
    const productToUpdate = await prisma.product.findFirst({
      where: {
        name: 'Produit pas cher'
      }
    })
    
    if (!productToUpdate) {
      console.log('❌ Produit "Produit pas cher" non trouvé')
      return
    }
    
    // Update the product to have low stock
    const product = await prisma.product.update({
      where: {
        id: productToUpdate.id
      },
      data: {
        stock: 2, // Now it's below minStock
        minStock: 15
      }
    })
    
    console.log(`✅ Produit mis à jour: ${product.name}`)
    console.log(`📊 Nouveau stock: ${product.stock}/${product.minStock}`)
    
    // Now check stock levels to create notification
    console.log('\n🔍 Vérification des niveaux de stock...')
    
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true,
        sku: true
      }
    })

    for (const prod of products) {
      console.log(`- ${prod.name}: Stock=${prod.stock}, MinStock=${prod.minStock}`)
      
      // Check for low stock
      if (prod.stock <= prod.minStock && prod.stock > 0) {
        await createStockNotification('stock_low', prod)
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function createStockNotification(type, product) {
  const existingNotification = await prisma.notification.findFirst({
    where: {
      productId: product.id,
      type: type,
      isRead: false
    }
  })

  if (!existingNotification) {
    const title = 'Stock faible'
    const message = `Le produit "${product.name}" est en stock faible (${product.stock} unités restantes)`
    const priority = 'normal'

    await prisma.notification.create({
      data: {
        type,
        title,
        message,
        priority,
        productId: product.id,
        metadata: JSON.stringify({
          productName: product.name,
          sku: product.sku,
          stock: product.stock,
          minStock: product.minStock
        })
      }
    })

    console.log(`📢 Notification créée: ${title} - ${product.name}`)
  } else {
    console.log(`ℹ️ Notification déjà existante pour ${product.name}`)
  }
}

// Run the script
createLowStockProduct() 
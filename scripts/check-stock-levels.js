const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkStockLevels() {
  try {
    console.log('🔍 Vérification des niveaux de stock...')
    
    // Get all active products
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

    console.log(`📦 ${products.length} produits trouvés`)
    console.log('\n📊 Niveaux de stock actuels:')
    
    let stockNotifications = 0

    for (const product of products) {
      console.log(`- ${product.name}: Stock=${product.stock}, MinStock=${product.minStock}`)
      
      // Check for out of stock
      if (product.stock === 0) {
        await createStockNotification('stock_out', product)
        stockNotifications++
      }
      // Check for critical stock (less than 25% of min stock)
      else if (product.stock <= Math.max(1, Math.floor(product.minStock * 0.25))) {
        await createStockNotification('stock_critical', product)
        stockNotifications++
      }
      // Check for low stock (less than or equal to min stock)
      else if (product.stock <= product.minStock) {
        await createStockNotification('stock_low', product)
        stockNotifications++
      }
    }

    console.log(`\n📢 ${stockNotifications} notifications de stock créées`)
    
    if (stockNotifications === 0) {
      console.log('✅ Tous les produits ont un stock suffisant')
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
    let title, message, priority

    switch (type) {
      case 'stock_out':
        title = 'Rupture de stock'
        message = `Le produit "${product.name}" est en rupture de stock`
        priority = 'critical'
        break
      case 'stock_critical':
        title = 'Stock critique'
        message = `Le produit "${product.name}" est en stock critique (${product.stock} unités restantes)`
        priority = 'high'
        break
      case 'stock_low':
        title = 'Stock faible'
        message = `Le produit "${product.name}" est en stock faible (${product.stock} unités restantes)`
        priority = 'normal'
        break
    }

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
    console.log(`ℹ️ Notification déjà existante pour ${product.name} (${type})`)
  }
}

// Run the script
checkStockLevels() 
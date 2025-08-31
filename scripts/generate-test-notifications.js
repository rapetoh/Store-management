const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function generateTestNotifications() {
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

    // Check each product and create notifications
    for (const product of products) {
      // Check for out of stock
      if (product.stock === 0) {
        await createNotification('stock_out', product)
      }
      // Check for critical stock (less than 25% of min stock)
      else if (product.stock <= Math.max(1, Math.floor(product.minStock * 0.25))) {
        await createNotification('stock_critical', product)
      }
      // Check for low stock (less than or equal to min stock)
      else if (product.stock <= product.minStock) {
        await createNotification('stock_low', product)
      }
    }

    // Create some sample system notifications
    await createSystemNotification('sale', {
      title: 'Nouvelle vente',
      message: 'Vente effectuée pour 45 000 FCFA',
      priority: 'normal'
    })

    await createSystemNotification('replenishment', {
      title: 'Ravitaillement effectué',
      message: 'Ravitaillement de 50 unités de "Chargeur USB" pour 350 000 FCFA',
      priority: 'normal'
    })

    console.log('✅ Notifications de test générées avec succès!')
  } catch (error) {
    console.error('❌ Erreur lors de la génération des notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function createNotification(type, product) {
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
  }
}

async function createSystemNotification(type, data) {
  await prisma.notification.create({
    data: {
      type,
      title: data.title,
      message: data.message,
      priority: data.priority,
      metadata: JSON.stringify({
        timestamp: new Date().toISOString()
      })
    }
  })

  console.log(`📢 Notification système créée: ${data.title}`)
}

// Run the script
generateTestNotifications() 
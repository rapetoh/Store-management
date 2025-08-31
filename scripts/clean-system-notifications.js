const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanSystemNotifications() {
  try {
    console.log('🧹 Nettoyage des notifications système...')
    
    // Delete all system notifications (sale and replenishment)
    const result = await prisma.notification.deleteMany({
      where: {
        type: {
          in: ['sale', 'replenishment']
        }
      }
    })
    
    console.log(`✅ ${result.count} notifications système supprimées`)
    
    // Check remaining notifications
    const remainingNotifications = await prisma.notification.findMany({
      select: {
        id: true,
        type: true,
        title: true,
        isRead: true
      }
    })
    
    console.log('\n📋 Notifications restantes:')
    remainingNotifications.forEach(notification => {
      console.log(`- ${notification.type}: ${notification.title} (${notification.isRead ? 'lue' : 'non lue'})`)
    })
    
    console.log(`\n📊 Total: ${remainingNotifications.length} notifications`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
cleanSystemNotifications() 
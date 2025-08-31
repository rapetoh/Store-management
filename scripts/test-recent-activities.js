const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRecentActivities() {
  try {
    console.log('🧪 Test des activités récentes...')
    
    // Get recent activities from database
    const dbActivities = await prisma.activityLog.findMany({
      take: 5,
      orderBy: {
        timestamp: 'desc'
      },
      select: {
        id: true,
        action: true,
        details: true,
        user: true,
        financialImpact: true,
        category: true,
        timestamp: true
      }
    })

    console.log(`📊 Activités récentes dans la DB: ${dbActivities.length}`)
    
    dbActivities.forEach((activity, index) => {
      console.log(`\n${index + 1}. ${activity.action.toUpperCase()}`)
      console.log(`   Détails: ${activity.details}`)
      console.log(`   Utilisateur: ${activity.user}`)
      console.log(`   Catégorie: ${activity.category}`)
      console.log(`   Impact financier: ${activity.financialImpact || 'N/A'}`)
      console.log(`   Date: ${activity.timestamp}`)
    })

    // Test API endpoint
    console.log('\n🌐 Test de l\'endpoint API:')
    const response = await fetch('http://localhost:3000/api/dashboard/recent-activities')
    const apiActivities = await response.json()
    
    console.log(`- API retourne: ${apiActivities.length} activités`)
    
    if (apiActivities.length > 0) {
      console.log('\n📋 Exemple d\'activité formatée:')
      const firstActivity = apiActivities[0]
      console.log(`- Action: ${firstActivity.action}`)
      console.log(`- Détails: ${firstActivity.details}`)
      console.log(`- Impact financier: ${firstActivity.financialDisplay}`)
      console.log(`- Temps: ${firstActivity.timeDisplay}`)
      console.log(`- Icône: ${firstActivity.icon}`)
      console.log(`- Couleur: ${firstActivity.color}`)
    }

    console.log('\n✅ Résultats attendus:')
    console.log('- Les 5 activités les plus récentes sont récupérées')
    console.log('- L\'impact financier est formaté correctement')
    console.log('- Le temps est affiché de manière relative')
    console.log('- Les icônes et couleurs sont assignées selon le type d\'action')

    console.log('\n📝 Instructions pour l\'utilisateur:')
    console.log('1. Allez sur le tableau de bord')
    console.log('2. Vérifiez que la section "Activités Récentes" s\'affiche')
    console.log('3. Vérifiez que les 5 activités les plus récentes sont listées')
    console.log('4. Vérifiez que l\'impact financier est affiché avec les bonnes couleurs')
    console.log('5. Vérifiez que le temps est affiché de manière relative')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testRecentActivities() 
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestActivities() {
  try {
    console.log('🧪 Création d\'activités de test avec impact financier...')
    
    // Create test activities with different types and financial impacts
    const testActivities = [
      {
        action: 'vente',
        details: 'Vente: Chargeur USB - Quantité: 2 - Total: 300 000 FCFA',
        user: 'Admin',
        financialImpact: 300000,
        category: 'Ventes'
      },
      {
        action: 'ravitaillement',
        details: 'Ravitaillement: Eau minérale 1L - Quantité: 50 - Coût: 500 000 FCFA',
        user: 'Admin',
        financialImpact: -500000,
        category: 'Ravitaillement'
      },
      {
        action: 'ajustement',
        details: 'Ajustement de stock: Coussin tesla - Différence: -3 unités',
        user: 'Admin',
        financialImpact: -540000, // 3 * 180000 (prix de vente)
        category: 'Inventaire'
      },
      {
        action: 'modification',
        details: 'Modification produit: KOLIKO55 - Prix mis à jour',
        user: 'Admin',
        financialImpact: null,
        category: 'Produits'
      },
      {
        action: 'vente',
        details: 'Vente: Pain de mie - Quantité: 1 - Total: 2 500 FCFA',
        user: 'Admin',
        financialImpact: 2500,
        category: 'Ventes'
      }
    ]

    for (const activity of testActivities) {
      await prisma.activityLog.create({
        data: {
          action: activity.action,
          details: activity.details,
          user: activity.user,
          financialImpact: activity.financialImpact,
          category: activity.category,
          timestamp: new Date() // Use current time
        }
      })
      console.log(`✅ Activité créée: ${activity.action} - ${activity.details}`)
    }

    console.log('\n🎯 Activités de test créées avec succès!')
    console.log('📊 Types d\'activités créées:')
    console.log('- Ventes (impact positif)')
    console.log('- Ravitaillement (impact négatif)')
    console.log('- Ajustement d\'inventaire (impact négatif)')
    console.log('- Modification (pas d\'impact)')
    
    console.log('\n📝 Instructions:')
    console.log('1. Rafraîchissez le tableau de bord')
    console.log('2. Vérifiez que les nouvelles activités apparaissent')
    console.log('3. Vérifiez que les impacts financiers sont colorés correctement')
    console.log('4. Vérifiez que les icônes correspondent au type d\'action')

  } catch (error) {
    console.error('❌ Erreur lors de la création des activités:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createTestActivities() 
#!/usr/bin/env node

/**
 * Test script to verify centralized API logging functionality
 * Run this after making some API calls to see if logs are being generated automatically
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCentralizedLogging() {
  try {
    console.log('🔍 Testing centralized API logging...\n')
    
    // Get recent activity logs
    const recentLogs = await prisma.activityLog.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    })

    console.log(`📊 Found ${recentLogs.length} recent logs (last hour):\n`)

    if (recentLogs.length === 0) {
      console.log('❌ No recent logs found. Try making some API calls first:')
      console.log('   - Create a product via the UI')
      console.log('   - Make a sale')
      console.log('   - Adjust inventory')
      console.log('   Then run this script again.\n')
    } else {
      recentLogs.forEach((log, index) => {
        console.log(`${index + 1}. [${log.timestamp.toLocaleString('fr-FR')}]`)
        console.log(`   Action: ${log.action}`)
        console.log(`   Category: ${log.category}`)
        console.log(`   👤 User: ${log.user}`)
        console.log(`   Details: ${log.details}`)
        if (log.financialImpact !== null) {
          console.log(`   💰 Financial Impact: ${log.financialImpact.toLocaleString('fr-FR')} FCFA`)
        }
        if (log.metadata) {
          try {
            const metadata = JSON.parse(log.metadata)
            if (metadata.method) {
              console.log(`   🔧 API: ${metadata.method} | Status: ${metadata.statusCode} | Duration: ${metadata.duration}ms`)
              console.log(`   🔐 User Resolved: ${metadata.userResolved ? '✅ Yes' : '❌ No'}`)
            }
          } catch (e) {
            // Metadata might not be JSON
          }
        }
        console.log('')
      })
    }

    // Check for centralized vs manual logging
    const centralizedLogs = await prisma.activityLog.count({
      where: {
        metadata: {
          contains: '"method"'
        }
      }
    })

    const totalLogs = await prisma.activityLog.count()

    console.log(`📈 Logging Statistics:`)
    console.log(`   Total logs: ${totalLogs}`)
    console.log(`   Centralized logs (with API metadata): ${centralizedLogs}`)
    console.log(`   Manual logs: ${totalLogs - centralizedLogs}`)
    
    if (centralizedLogs > 0) {
      console.log('\n✅ Centralized logging is working!')
      console.log('   API calls are being automatically logged with metadata.')
    } else {
      console.log('\n⚠️  No centralized logs detected yet.')
      console.log('   Make sure to make API calls through the wrapped routes.')
    }

    console.log('\n💡 Next steps:')
    console.log('   1. Test more API endpoints')
    console.log('   2. Gradually remove manual logging from components')
    console.log('   3. Monitor for any missing logs')

  } catch (error) {
    console.error('❌ Error testing logging:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCentralizedLogging()

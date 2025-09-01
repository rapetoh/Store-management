import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET - Get all settings
export async function GET() {
  try {
    const settings = await prisma.userSettings.findMany()
    
    // Convert to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)
    
    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST - Update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Update or create each setting
    for (const [key, value] of Object.entries(body)) {
      await prisma.userSettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          description: getSettingDescription(key)
        }
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

function getSettingDescription(key: string): string {
  switch (key) {
    case 'notWorkedOnHours':
      return 'Heures pour considérer un produit comme travaillé'
    default:
      return 'Paramètre utilisateur'
  }
} 
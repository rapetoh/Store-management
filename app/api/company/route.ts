import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET - Get company information
export async function GET() {
  try {
    // Get company info from UserSettings table
    const companySettings = await prisma.userSettings.findMany({
      where: {
        key: {
          in: ['companyName', 'companyAddress', 'companyPhone', 'companyEmail', 'companySiret', 'companyVatNumber', 'companyLogo']
        }
      }
    })

    // Convert to object
    const companyInfo = companySettings.reduce((acc, setting) => {
      acc[setting.key.replace('company', '').toLowerCase()] = setting.value
      return acc
    }, {} as Record<string, string>)

    // Return with default values if not set
    return NextResponse.json({
      name: companyInfo.name || 'StockFlow',
      address: companyInfo.address || '123 Rue du Commerce\nLomé, Togo',
      phone: companyInfo.phone || '+228 91 234 567',
      email: companyInfo.email || 'contact@stockflow.tg',
      siret: companyInfo.siret || 'TG123456789',
      vatNumber: companyInfo.vatnumber || 'TG123456789',
      logo: companyInfo.logo || ''
    })
  } catch (error) {
    console.error('Error fetching company info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company information' },
      { status: 500 }
    )
  }
}

// PUT - Update company information
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, phone, email, siret, vatNumber, logo } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom de l\'entreprise est requis' },
        { status: 400 }
      )
    }

    // Update or create each setting
    const settingsToUpdate = [
      { key: 'companyName', value: name.trim(), description: 'Nom de l\'entreprise' },
      { key: 'companyAddress', value: address?.trim() || '', description: 'Adresse de l\'entreprise' },
      { key: 'companyPhone', value: phone?.trim() || '', description: 'Téléphone de l\'entreprise' },
      { key: 'companyEmail', value: email?.trim() || '', description: 'Email de l\'entreprise' },
      { key: 'companySiret', value: siret?.trim() || '', description: 'Numéro d\'immatriculation de l\'entreprise' },
      { key: 'companyVatNumber', value: vatNumber?.trim() || '', description: 'Numéro fiscal de l\'entreprise' },
      { key: 'companyLogo', value: logo?.trim() || '', description: 'Logo de l\'entreprise' }
    ]

    for (const setting of settingsToUpdate) {
      await prisma.userSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          description: setting.description
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating company info:', error)
    return NextResponse.json(
      { error: 'Failed to update company information' },
      { status: 500 }
    )
  }
} 
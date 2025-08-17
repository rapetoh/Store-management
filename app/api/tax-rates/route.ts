import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get all tax rates
export async function GET() {
  try {
    const taxRates = await prisma.taxRate.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    })
    
    return NextResponse.json(taxRates)
  } catch (error) {
    console.error('Error fetching tax rates:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des taux de TVA' },
      { status: 500 }
    )
  }
}

// POST - Create a new tax rate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, rate, isDefault, description } = body

    // Validate required fields
    if (!name || rate === undefined) {
      return NextResponse.json(
        { error: 'Le nom et le taux sont requis' },
        { status: 400 }
      )
    }

    // If this is the new default, unset the current default
    if (isDefault) {
      await prisma.taxRate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }

    const taxRate = await prisma.taxRate.create({
      data: {
        name,
        rate: parseFloat(rate),
        isDefault: isDefault || false,
        description
      }
    })

    return NextResponse.json(taxRate, { status: 201 })
  } catch (error) {
    console.error('Error creating tax rate:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du taux de TVA' },
      { status: 500 }
    )
  }
}

// PUT - Update a tax rate
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, rate, isDefault, description, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID du taux de TVA requis' },
        { status: 400 }
      )
    }

    // If this is the new default, unset the current default
    if (isDefault) {
      await prisma.taxRate.updateMany({
        where: { 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    const taxRate = await prisma.taxRate.update({
      where: { id },
      data: {
        name,
        rate: rate !== undefined ? parseFloat(rate) : undefined,
        isDefault,
        description,
        isActive
      }
    })

    return NextResponse.json(taxRate)
  } catch (error) {
    console.error('Error updating tax rate:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du taux de TVA' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a tax rate
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID du taux de TVA requis' },
        { status: 400 }
      )
    }

    // Check if tax rate is used by any products
    const productsUsingTaxRate = await prisma.product.count({
      where: { taxRateId: id }
    })

    if (productsUsingTaxRate > 0) {
      return NextResponse.json(
        { error: `Ce taux de TVA est utilisé par ${productsUsingTaxRate} produit(s) et ne peut pas être supprimé` },
        { status: 400 }
      )
    }

    await prisma.taxRate.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Taux de TVA supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting tax rate:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du taux de TVA' },
      { status: 500 }
    )
  }
} 
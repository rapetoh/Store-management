import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// PUT - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom de la catégorie est requis' },
        { status: 400 }
      )
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      )
    }

    // Check if name is already taken by another category
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    })

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la catégorie' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      )
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une catégorie qui contient des produits' },
        { status: 400 }
      )
    }

    // Delete the category
    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    )
  }
} 
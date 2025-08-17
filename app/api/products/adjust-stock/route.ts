import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adjustments } = body

    if (!adjustments || !Array.isArray(adjustments)) {
      return NextResponse.json(
        { error: 'Ajustements invalides' },
        { status: 400 }
      )
    }

    const results = []

    for (const adjustment of adjustments) {
      const { productId, adjustment: quantity, type, reason } = adjustment

      // Get current product
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        results.push({
          productId,
          success: false,
          error: 'Produit non trouvé'
        })
        continue
      }

      // Calculate new stock based on adjustment type
      let newStock: number
      if (type === 'add') {
        newStock = product.stock + quantity
      } else if (type === 'remove') {
        newStock = Math.max(0, product.stock - quantity)
      } else if (type === 'set') {
        newStock = Math.max(0, quantity)
      } else {
        results.push({
          productId,
          success: false,
          error: 'Type d\'ajustement invalide'
        })
        continue
      }

      // Update product stock
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { stock: newStock }
      })

      // Note: Stock movement tracking can be added later with a StockMovement model
      // For now, we just update the product stock

      results.push({
        productId,
        success: true,
        previousStock: product.stock,
        newStock,
        adjustment: quantity
      })
    }

    return NextResponse.json({
      message: 'Ajustements de stock effectués',
      results
    })

  } catch (error) {
    console.error('Error adjusting stock:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajustement du stock' },
      { status: 500 }
    )
  }
} 
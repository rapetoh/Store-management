import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sale = await DatabaseService.getSaleById(params.id)
    
    if (!sale) {
      return NextResponse.json(
        { error: 'Vente non trouvée' },
        { status: 404 }
      )
    }

    // Transform the sale data to match the frontend interface
    const transformedSale = {
      ...sale,
      customer: sale.customer?.name || 'Client anonyme',
      items: sale.items?.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || 'Produit inconnu',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        totalPrice: item.totalPrice
      })) || []
    }

    return NextResponse.json(transformedSale)
  } catch (error) {
    console.error('Error fetching sale:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la vente' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { notes, paymentMethod, items, totalAmount, taxAmount, finalAmount } = body

    // Update sale with new data
    const updatedSale = await DatabaseService.updateSale(params.id, {
      notes,
      paymentMethod,
      items,
      totalAmount,
      taxAmount,
      finalAmount
    })

    // Transform the updated sale data to match the frontend interface
    const transformedSale = {
      ...updatedSale,
      customer: updatedSale.customer?.name || 'Client anonyme',
      items: updatedSale.items?.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || 'Produit inconnu',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        totalPrice: item.totalPrice
      })) || []
    }

    return NextResponse.json(transformedSale)
  } catch (error) {
    console.error('Error updating sale:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la vente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if sale exists and is within 24 hours
    const sale = await DatabaseService.getSaleById(params.id)
    
    if (!sale) {
      return NextResponse.json(
        { error: 'Vente non trouvée' },
        { status: 404 }
      )
    }

    const saleDate = new Date(sale.saleDate)
    const now = new Date()
    const hoursDiff = (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60)
    
    if (hoursDiff > 24) {
      return NextResponse.json(
        { error: 'La vente ne peut pas être annulée après 24 heures' },
        { status: 400 }
      )
    }

    // Cancel the sale (restore stock and mark as cancelled)
    await DatabaseService.cancelSale(params.id)

    return NextResponse.json({ message: 'Vente annulée avec succès' })
  } catch (error) {
    console.error('Error cancelling sale:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de la vente' },
      { status: 500 }
    )
  }
} 
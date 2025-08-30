import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let sales
    if (startDate && endDate) {
      // Filter sales by date range
      sales = await DatabaseService.getSalesByDateRange(startDate, endDate)
    } else {
      // Get all sales
      sales = await DatabaseService.getAllSales()
    }
    
    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create the sale
    const sale = await DatabaseService.createSale(body)
    
    // Update stock for each product in the sale
    for (const item of body.items) {
      const product = await DatabaseService.getProductById(item.productId)
      if (product) {
        const newStock = product.stock - item.quantity
        await DatabaseService.updateStock(
          item.productId,
          newStock,
          'Vente',
          'vente',
          sale.id
        )
      }
    }
    
    // Update cash session if payment method is cash
    if (body.paymentMethod === 'cash' || body.paymentMethod === 'Espèces') {
      try {
        const currentSession = await DatabaseService.getCurrentCashSession()
        if (currentSession) {
          // Update the cash session with the sale amount
          await DatabaseService.updateCashSessionSales(currentSession.id, body.finalAmount)
        }
      } catch (cashError) {
        console.error('Error updating cash session:', cashError)
        // Don't fail the sale if cash session update fails
      }
    }
    
    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
} 
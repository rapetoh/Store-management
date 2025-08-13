import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function GET() {
  try {
    const sales = await DatabaseService.getAllSales()
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
          'Sale',
          'out',
          sale.id
        )
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
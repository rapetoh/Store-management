import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { productId, newStock, reason, notes } = await request.json()
    
    if (!productId || newStock === undefined || !reason) {
      return NextResponse.json(
        { error: 'Product ID, new stock, and reason are required' },
        { status: 400 }
      )
    }

    const updatedProduct = await DatabaseService.adjustProductStock(productId, newStock, reason, notes)
    
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error adjusting product stock:', error)
    return NextResponse.json(
      { error: 'Failed to adjust product stock' },
      { status: 500 }
    )
  }
} 
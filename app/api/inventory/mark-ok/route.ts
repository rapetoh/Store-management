import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const updatedProduct = await DatabaseService.markProductAsOK(productId)
    
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error marking product as OK:', error)
    return NextResponse.json(
      { error: 'Failed to mark product as OK' },
      { status: 500 }
    )
  }
} 
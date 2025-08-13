import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { barcode: string } }
) {
  try {
    const product = await DatabaseService.getProductByBarcode(params.barcode)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product by barcode:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
} 
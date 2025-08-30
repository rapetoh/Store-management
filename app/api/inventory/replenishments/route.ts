import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const supplierId = searchParams.get('supplierId') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const receiptNumber = searchParams.get('receiptNumber') || undefined

    const replenishments = await DatabaseService.getReplenishments({
      search,
      supplierId,
      startDate,
      endDate,
      receiptNumber
    })

    return NextResponse.json(replenishments)
  } catch (error) {
    console.error('Error fetching replenishments:', error)
    return NextResponse.json({ error: 'Failed to fetch replenishments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      productId,
      supplierId,
      quantity,
      unitPrice,
      deliveryCost,
      receiptNumber,
      notes,
      userId
    } = body

    if (!productId || !quantity || unitPrice === undefined) {
      return NextResponse.json(
        { error: 'Product ID, quantity, and unit price are required' },
        { status: 400 }
      )
    }

    const replenishment = await DatabaseService.createReplenishment({
      productId,
      supplierId,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(unitPrice),
      deliveryCost: parseFloat(deliveryCost || 0),
      receiptNumber,
      notes,
      userId
    })

    return NextResponse.json(replenishment, { status: 201 })
  } catch (error) {
    console.error('Error creating replenishment:', error)
    return NextResponse.json(
      { error: 'Failed to create replenishment' },
      { status: 500 }
    )
  }
} 
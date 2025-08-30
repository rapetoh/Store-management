import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const type = searchParams.get('type') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const reason = searchParams.get('reason') || undefined
    const financialImpact = searchParams.get('financialImpact') || undefined

    const movements = await DatabaseService.getInventoryMovements({
      search,
      type,
      startDate,
      endDate,
      reason,
      financialImpact: financialImpact as 'positive' | 'negative' | undefined
    })

    return NextResponse.json(movements)
  } catch (error) {
    console.error('Error fetching inventory movements:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory movements' }, { status: 500 })
  }
} 
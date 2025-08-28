import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const categoryProfitData = await DatabaseService.getCategoryProfitData()
    
    return NextResponse.json(categoryProfitData)
  } catch (error) {
    console.error('Error fetching category profit data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category profit data' },
      { status: 500 }
    )
  }
} 
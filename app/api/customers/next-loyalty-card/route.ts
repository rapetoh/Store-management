import { NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function GET() {
  try {
    const nextLoyaltyCard = await DatabaseService.generateNextLoyaltyCard()
    return NextResponse.json({ loyaltyCard: nextLoyaltyCard })
  } catch (error) {
    console.error('Error generating next loyalty card:', error)
    return NextResponse.json(
      { error: 'Failed to generate loyalty card' },
      { status: 500 }
    )
  }
}

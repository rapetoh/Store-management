import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const loyaltyCard = searchParams.get('loyaltyCard')
    
    if (!phone && !loyaltyCard) {
      return NextResponse.json(
        { error: 'Phone or loyaltyCard parameter is required' },
        { status: 400 }
      )
    }

    let customer = null
    
    // Search by phone first
    if (phone) {
      customer = await DatabaseService.getCustomerByPhone(phone)
    }
    
    // If not found by phone, search by loyalty card
    if (!customer && loyaltyCard) {
      customer = await DatabaseService.getCustomerByLoyaltyCard(loyaltyCard)
    }
    
    if (!customer) {
      return NextResponse.json(null, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error searching customer:', error)
    return NextResponse.json(
      { error: 'Failed to search customer' },
      { status: 500 }
    )
  }
} 
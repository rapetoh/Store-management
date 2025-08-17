import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function GET() {
  try {
    const promoCodes = await DatabaseService.getAllPromoCodes()
    return NextResponse.json(promoCodes)
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const action = searchParams.get('action')
    
    if (action === 'validate') {
      // Handle validation
      const body = await request.json()
      const { code, amount } = body
      
      console.log('🔍 Promo code validation endpoint hit')
      console.log('📝 Received request:', { code, amount })
      
      if (!code) {
        console.log('❌ No code provided')
        return NextResponse.json(
          { error: 'Promo code is required' },
          { status: 400 }
        )
      }
      
      console.log('🔍 Looking for promo code:', code.toUpperCase())
      
      // First, try to find the promo code without expiration filter
      const allPromoCodes = await DatabaseService.getAllPromoCodesIncludingExpired()
      const promoCodeWithoutFilter = allPromoCodes.find(p => p.code === code.toUpperCase())
      
      if (!promoCodeWithoutFilter) {
        console.log('❌ Promo code not found')
        return NextResponse.json(
          { error: 'Code promo invalide' },
          { status: 404 }
        )
      }
      
      // Now check if it's expired
      const promoCode = await DatabaseService.getPromoCodeByCode(code.toUpperCase())
      console.log('📋 Found promo code:', promoCode)
      
      if (!promoCode) {
        console.log('❌ Promo code expired')
        return NextResponse.json(
          { error: 'Code promo expiré' },
          { status: 400 }
        )
      }
      
      // Check if minimum amount requirement is met
      if (amount < promoCode.minAmount) {
        console.log('❌ Minimum amount not met:', amount, '<', promoCode.minAmount)
        return NextResponse.json(
          { 
            error: `Montant minimum requis: ${promoCode.minAmount.toLocaleString('fr-FR')} FCFA`,
            minAmount: promoCode.minAmount 
          },
          { status: 400 }
        )
      }
      
      // Check if max uses limit is reached
      if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
        console.log('❌ Usage limit reached:', promoCode.usedCount, '>=', promoCode.maxUses)
        return NextResponse.json(
          { error: 'Promo code usage limit reached' },
          { status: 400 }
        )
      }
      
      // Calculate discount
      let discountAmount = 0
      if (promoCode.type === 'percentage') {
        discountAmount = (amount * promoCode.value) / 100
      } else if (promoCode.type === 'fixed') {
        discountAmount = promoCode.value
      }
      
      console.log('✅ Promo code validated successfully:', {
        code: promoCode.code,
        discountAmount,
        finalAmount: amount - discountAmount
      })
      
      return NextResponse.json({
        success: true,
        promoCode,
        discountAmount,
        finalAmount: amount - discountAmount
      })
    } else {
      // Handle creation
      const body = await request.json()
      const promoCode = await DatabaseService.createPromoCode(body)
      return NextResponse.json(promoCode, { status: 201 })
    }
  } catch (error) {
    console.error('Error in promo codes API:', error)
    return NextResponse.json(
      { error: 'Failed to process promo code request' },
      { status: 500 }
    )
  }
} 
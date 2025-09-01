import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET - Get all payment methods
export async function GET() {
  try {
    // Get payment methods from the PaymentMethod table
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(paymentMethods)
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}

// POST - Create or update payment methods
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentMethods } = body

    if (!Array.isArray(paymentMethods)) {
      return NextResponse.json(
        { error: 'Invalid payment methods data' },
        { status: 400 }
      )
    }

    // Validate payment methods
    for (const method of paymentMethods) {
      if (!method.name || !method.code) {
        return NextResponse.json(
          { error: 'Missing required fields for payment method' },
          { status: 400 }
        )
      }
    }

    // Update or create each payment method
    const updatedMethods = []
    for (const method of paymentMethods) {
      const updatedMethod = await prisma.paymentMethod.upsert({
        where: { code: method.code },
        update: {
          name: method.name,
          icon: method.icon || 'DollarSign',
          isActive: method.isActive,
          requiresReceipt: method.requiresReceipt,
          sortOrder: method.sortOrder || 0,
          description: method.description
        },
        create: {
          name: method.name,
          code: method.code,
          icon: method.icon || 'DollarSign',
          isActive: method.isActive,
          requiresReceipt: method.requiresReceipt,
          sortOrder: method.sortOrder || 0,
          description: method.description
        }
      })
      updatedMethods.push(updatedMethod)
    }

    return NextResponse.json(updatedMethods)
  } catch (error) {
    console.error('Error updating payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to update payment methods' },
      { status: 500 }
    )
  }
}


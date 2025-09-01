import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const supplierId = searchParams.get('supplierId') || undefined
    const period = searchParams.get('period') || '30'
    const status = searchParams.get('status') || undefined

    const where: any = {
      isActive: true,
      currentQuantity: { gt: 0 }
    }

    if (period !== 'all') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (period === 'expired') {
        where.expirationDate = { lt: today }
      } else {
        const days = parseInt(period)
        const futureDate = new Date()
        futureDate.setDate(today.getDate() + days)
        futureDate.setHours(23, 59, 59, 999)
        where.expirationDate = { gte: today, lte: futureDate }
      }
    }

    if (supplierId) where.supplierId = supplierId
    if (search) {
      where.product = { name: { contains: search } }
    }

    const alerts = await prisma.expirationAlert.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true, stock: true } },
        supplier: { select: { id: true, name: true } },
        replenishment: { select: { receiptNumber: true, createdAt: true } }
      },
      orderBy: { expirationDate: 'asc' }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching expiration alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch expiration alerts' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, currentQuantity } = await request.json()

    if (!id || currentQuantity === undefined) {
      return NextResponse.json({ error: 'Alert ID and current quantity are required' }, { status: 400 })
    }

    // Récupérer l'alerte actuelle pour vérifier la quantité originale
    const currentAlert = await prisma.expirationAlert.findUnique({
      where: { id },
      include: { product: true }
    })

    if (!currentAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    const newQuantity = parseInt(currentQuantity)
    
    // Empêcher TOUTE augmentation de la quantité
    if (newQuantity > currentAlert.currentQuantity) {
      return NextResponse.json({ 
        error: `La quantité ne peut pas être augmentée. Vous pouvez seulement la diminuer.` 
      }, { status: 400 })
    }

    const updatedAlert = await prisma.expirationAlert.update({
      where: { id },
      data: {
        currentQuantity: newQuantity,
        isActive: newQuantity > 0,
        updatedAt: new Date()
      },
      include: {
        product: { select: { id: true, name: true, sku: true, stock: true } },
        supplier: { select: { id: true, name: true } },
        replenishment: { select: { receiptNumber: true, createdAt: true } }
      }
    })

    return NextResponse.json(updatedAlert)
  } catch (error) {
    console.error('Error updating expiration alert:', error)
    return NextResponse.json({ error: 'Failed to update expiration alert' }, { status: 500 })
  }
} 
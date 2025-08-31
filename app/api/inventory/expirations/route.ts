import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const supplierId = searchParams.get('supplierId') || undefined
    const period = searchParams.get('period') || '30'
    const status = searchParams.get('status') || undefined

    // Construire les conditions de filtrage
    const where: any = {
      expirationDate: {
        not: null
      }
    }

    // Filtre par période
    if (period !== 'all') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (period === 'expired') {
        where.expirationDate = {
          lt: today
        }
      } else {
        const days = parseInt(period)
        const futureDate = new Date()
        futureDate.setDate(today.getDate() + days)
        futureDate.setHours(23, 59, 59, 999)

        where.expirationDate = {
          gte: today,
          lte: futureDate
        }
      }
    }

    // Filtre par fournisseur
    if (supplierId) {
      where.supplierId = supplierId
    }

    // Filtre par statut
    if (status) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      switch (status) {
        case 'expired':
          where.expirationDate = {
            lt: today
          }
          break
        case 'critical':
          const criticalDate = new Date()
          criticalDate.setDate(today.getDate() + 7)
          criticalDate.setHours(23, 59, 59, 999)
          where.expirationDate = {
            gte: today,
            lte: criticalDate
          }
          break
        case 'close':
          const closeDate = new Date()
          closeDate.setDate(today.getDate() + 30)
          closeDate.setHours(23, 59, 59, 999)
          where.expirationDate = {
            gte: today,
            lte: closeDate
          }
          break
        case 'ok':
          const okDate = new Date()
          okDate.setDate(today.getDate() + 30)
          okDate.setHours(0, 0, 0, 0)
          where.expirationDate = {
            gt: okDate
          }
          break
      }
    }

    // Recherche par nom de produit
    if (search) {
      where.product = {
        name: {
          contains: search
        }
      }
    }

    const expirations = await prisma.replenishment.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        expirationDate: 'asc'
      }
    })

    return NextResponse.json(expirations)
  } catch (error) {
    console.error('Error fetching expirations:', error)
    return NextResponse.json({ error: 'Failed to fetch expirations' }, { status: 500 })
  }
} 
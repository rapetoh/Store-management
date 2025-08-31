import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get notifications with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    
    // Filter parameters
    const isRead = searchParams.get('isRead')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    
    // Build where clause
    const where: any = {}
    
    if (isRead !== null && isRead !== undefined && isRead !== '') {
      where.isRead = isRead === 'true'
    }
    
    if (type) {
      where.type = type
    }
    
    if (priority) {
      where.priority = priority
    }
    
    // Get notifications with pagination
    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              stock: true,
              minStock: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ])
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    )
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, priority = 'normal', productId, metadata } = body
    
    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Type, titre et message sont requis' },
        { status: 400 }
      )
    }
    
    // Create notification
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        priority,
        productId,
        metadata: metadata ? JSON.stringify(metadata) : null
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            stock: true,
            minStock: true
          }
        }
      }
    })
    
    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la notification' },
      { status: 500 }
    )
  }
} 
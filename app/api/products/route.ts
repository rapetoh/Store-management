import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get products with pagination, search, and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    
    // Search and filter parameters
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const isActive = searchParams.get('isActive')
    const lowStock = searchParams.get('lowStock') === 'true'
    const outOfStock = searchParams.get('outOfStock') === 'true'
    
    // Build where clause
    const where: any = {}
    
    if (search && search.trim() !== '') {
      const searchTerm = search.trim()
      where.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { barcode: { contains: searchTerm } },
        { sku: { contains: searchTerm } }
      ]
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    // Handle isActive filter
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }
    // If isActive is empty string (''), show all products (both active and inactive)
    // No where clause added for isActive in this case
    
    if (outOfStock) {
      where.stock = 0
    }
    
    // Get products with pagination
    const [allProducts, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          taxRate: {
            select: {
              id: true,
              name: true,
              rate: true
            }
          }
        },
        orderBy: [
          { name: 'asc' }
        ]
      }),
      prisma.product.count({ where })
    ])

    // Apply low stock filter after fetching
    let filteredProducts = allProducts
    if (lowStock) {
      filteredProducts = allProducts.filter(product => 
        product.stock > 0 && product.stock <= product.minStock
      )
    }

    // Apply pagination to filtered results
    const startIndex = skip
    const endIndex = startIndex + limit
    const products = filteredProducts.slice(startIndex, endIndex)
    
    // Recalculate pagination for filtered results
    const filteredTotalCount = filteredProducts.length
    const totalPages = Math.ceil(filteredTotalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount: filteredTotalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      price, 
      costPrice, 
      stock, 
      minStock, 
      barcode, 
      sku, 
      categoryId, 
      taxRateId, 
      image 
    } = body

    // Validate required fields
    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Le nom et le prix sont requis' },
        { status: 400 }
      )
    }

    // Check for duplicate barcode
    if (barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode }
      })
      if (existingBarcode) {
        return NextResponse.json(
          { error: 'Ce code-barres existe déjà' },
          { status: 400 }
        )
      }
    }

    // Auto-generate SKU if not provided
    let finalSku = sku
    if (!sku) {
      // Get category prefix
      let categoryPrefix = 'PROD'
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId }
        })
        if (category) {
          // Create prefix from category name (first 4 letters, uppercase)
          categoryPrefix = category.name.substring(0, 4).toUpperCase()
        }
      }

      // Find the next number for this category
      const existingProducts = await prisma.product.findMany({
        where: {
          sku: {
            startsWith: categoryPrefix
          }
        },
        orderBy: {
          sku: 'desc'
        },
        take: 1
      })

      let nextNumber = 1
      if (existingProducts.length > 0) {
        const lastSku = existingProducts[0].sku
        if (lastSku) {
          const match = lastSku.match(new RegExp(`^${categoryPrefix}-(\\d+)$`))
          if (match) {
            nextNumber = parseInt(match[1]) + 1
          }
        }
      }

      finalSku = `${categoryPrefix}-${nextNumber.toString().padStart(3, '0')}`
    } else {
      // Check for duplicate SKU if manually provided
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      })
      if (existingSku) {
        return NextResponse.json(
          { error: 'Ce SKU existe déjà' },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        costPrice: parseFloat(costPrice) || 0,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        barcode,
        sku: finalSku,
        categoryId: categoryId || null,
        taxRateId: taxRateId || null,
        image
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        taxRate: {
          select: {
            id: true,
            name: true,
            rate: true
          }
        }
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    )
  }
} 
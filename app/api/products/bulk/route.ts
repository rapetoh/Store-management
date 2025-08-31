import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Export products as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const format = searchParams.get('format') || 'csv'
    
    // Get all products with pagination for large datasets
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true
          }
        },
        taxRate: {
          select: {
            name: true,
            rate: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'Nom',
        'Description',
        'Prix (FCFA)',
        'Prix de revient (FCFA)',
        'Stock',
        'Stock minimum',
        'Code-barres',
        'SKU',
        'Catégorie',
        'TVA',
        'Statut',
        'Image URL'
      ]

      const csvRows = products.map(product => [
        product.name,
        product.description || '',
        product.price.toString(),
        product.costPrice.toString(),
        product.stock.toString(),
        product.minStock.toString(),
        product.barcode || '',
        product.sku || '',
        product.category?.name || '',
        product.taxRate ? `${product.taxRate.name} (${product.taxRate.rate}%)` : '',
        product.isActive ? 'Actif' : 'Inactif',
        product.image || ''
      ])

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="produits.csv"'
        }
      })
    }

    // Return JSON format
    return NextResponse.json({
      products,
      totalCount: products.length,
      exportedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error exporting products:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des produits' },
      { status: 500 }
    )
  }
}

// POST - Bulk import products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { products, options = {} } = body
    
    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      )
    }

    const { 
      skipDuplicates = true, 
      updateExisting = false,
      categoryMapping = {},
      taxRateMapping = {}
    } = options

    let imported = 0
    let updated = 0
    let skipped = 0
    let errors: string[] = []

    // Process products in batches to avoid memory issues
    const batchSize = 100
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      for (const productData of batch) {
        try {
          const {
            name,
            description,
            price,
            costPrice = 0,
            stock = 0,
            minStock = 0,
            barcode,
            sku,
            category,
            taxRate,
            image,
            isActive = true
          } = productData

          // Validate required fields
          if (!name || price === undefined || !barcode || stock === undefined) {
            const missingFields = []
            if (!name) missingFields.push('nom')
            if (price === undefined) missingFields.push('prix')
            if (!barcode) missingFields.push('code-barres')
            if (stock === undefined) missingFields.push('stock')
            errors.push(`Produit "${name || 'Sans nom'}": Champs requis manquants: ${missingFields.join(', ')}`)
            continue
          }

          // Handle category (create if doesn't exist, fallback to "Other" if empty/invalid)
          let categoryId = null
          let categoryName = category?.trim()
          
          if (categoryName && categoryName.length > 0) {
            // Try to find or create the specified category
            let existingCategory = await prisma.category.findFirst({
              where: { name: categoryName }
            })
            
            if (!existingCategory) {
              existingCategory = await prisma.category.create({
                data: { name: categoryName }
              })
            }
            categoryId = existingCategory.id
          } else {
            // Fallback to "Other" category
            let otherCategory = await prisma.category.findFirst({
              where: { name: 'Other' }
            })
            
            if (!otherCategory) {
              otherCategory = await prisma.category.create({
                data: { name: 'Other' }
              })
            }
            categoryId = otherCategory.id
          }

          // Check for existing product (using only barcode for duplicate detection)
          const existingProduct = await prisma.product.findFirst({
            where: { barcode: barcode }
          })

          if (existingProduct) {
            if (skipDuplicates) {
              skipped++
              continue
            } else if (updateExisting) {
              // Update existing product
              await prisma.product.update({
                where: { id: existingProduct.id },
                data: {
                  name,
                  description,
                  price: parseFloat(price),
                  costPrice: parseFloat(costPrice),
                  stock: parseInt(stock),
                  minStock: parseInt(minStock),
                  barcode: barcode || null,
                  sku: sku || null,
                  categoryId,
                  image: image || null,
                  isActive
                }
              })
              updated++
            } else {
              errors.push(`Produit "${name}": Déjà existant`)
              continue
            }
          } else {
            // Create new product (always active by default)
            await prisma.product.create({
              data: {
                name,
                description,
                price: parseFloat(price),
                costPrice: parseFloat(costPrice),
                stock: parseInt(stock),
                minStock: parseInt(minStock),
                barcode: barcode || null,
                sku: sku || null,
                categoryId,
                image: image || null,
                isActive: true // Force active status for imported products
              }
            })
            imported++
          }
        } catch (error) {
          console.error('Error processing product:', productData, error)
          errors.push(`Produit "${productData.name || 'Sans nom'}": ${error}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        imported,
        updated,
        skipped,
        errors: errors.length
      },
      errors: errors.slice(0, 10) // Limit error messages
    })
  } catch (error) {
    console.error('Error importing products:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'import des produits' },
      { status: 500 }
    )
  }
} 
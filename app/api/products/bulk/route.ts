import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { products } = await request.json()
    
    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Invalid products data' },
        { status: 400 }
      )
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const productData of products) {
      try {
        // Check if product exists by SKU or barcode
        let existingProduct = null
        if (productData.sku) {
          existingProduct = await DatabaseService.getProductBySku(productData.sku)
        } else if (productData.barcode) {
          existingProduct = await DatabaseService.getProductByBarcode(productData.barcode)
        }

        if (existingProduct) {
          // Update existing product
          const updatedProduct = await DatabaseService.updateProduct(existingProduct.id, {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock: productData.stock,
            minStock: productData.minStock || 5,
            barcode: productData.barcode,
            sku: productData.sku,
          })
          results.push({ success: true, product: updatedProduct, action: 'updated' })
          successCount++
        } else {
          // Create new product
          const newProduct = await DatabaseService.createProduct({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock: productData.stock,
            minStock: productData.minStock || 5,
            barcode: productData.barcode,
            sku: productData.sku,
          })
          results.push({ success: true, product: newProduct, action: 'created' })
          successCount++
        }
      } catch (error) {
        console.error('Error processing product:', productData.name, error)
        results.push({ 
          success: false, 
          product: productData, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: products.length,
        success: successCount,
        errors: errorCount
      }
    })
  } catch (error) {
    console.error('Error in bulk import:', error)
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    )
  }
} 
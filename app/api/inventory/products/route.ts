import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const categoryId = searchParams.get('categoryId') || undefined
    const supplierId = searchParams.get('supplierId') || undefined
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined
    const notWorkedOnHours = searchParams.get('notWorkedOnHours') ? 
      parseInt(searchParams.get('notWorkedOnHours')!) : 24

    const products = await DatabaseService.getProductsForInventory({
      categoryId,
      supplierId,
      status: status || undefined,
      search,
      notWorkedOnHours
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching inventory products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory products' },
      { status: 500 }
    )
  }
} 
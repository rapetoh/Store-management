import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')
    const name = searchParams.get('name')
    
    if (search) {
      const suppliers = await DatabaseService.searchSuppliers(search)
      return NextResponse.json(suppliers)
    }
    
    if (name) {
      const supplier = await DatabaseService.getSupplierByName(name)
      return NextResponse.json(supplier)
    }
    
    const suppliers = await DatabaseService.getAllSuppliers()
    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supplier = await DatabaseService.createSupplier(body)
    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
} 
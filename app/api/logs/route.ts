import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const user = searchParams.get('user')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const logs = await DatabaseService.getActivityLogs({
      action: action || undefined,
      user: user || undefined,
      category: category || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      limit,
      offset
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, details, user, financialImpact, category, metadata } = body

    if (!action || !details || !user || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const log = await DatabaseService.createActivityLog({
      action,
      details,
      user,
      financialImpact: financialImpact || null,
      category,
      metadata: metadata ? JSON.stringify(metadata) : null
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error creating activity log:', error)
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    )
  }
} 
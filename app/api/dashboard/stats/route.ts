import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function GET() {
  try {
    const stats = await DatabaseService.getDashboardStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
} 
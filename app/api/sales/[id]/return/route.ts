import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { items, reason } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Aucun article spécifié pour le retour' },
        { status: 400 }
      )
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'La raison du retour est requise' },
        { status: 400 }
      )
    }

    // Process the return
    const returnResult = await DatabaseService.processReturn(params.id, items, reason)

    return NextResponse.json(returnResult)
  } catch (error) {
    console.error('Error processing return:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du retour' },
      { status: 500 }
    )
  }
} 
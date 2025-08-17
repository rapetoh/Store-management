import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const updates = await request.json()

    // Validate the session exists
    const existingSession = await DatabaseService.getCashSessionById(sessionId)
    if (!existingSession) {
      return NextResponse.json(
        { success: false, error: 'Session de caisse non trouvée' },
        { status: 404 }
      )
    }

    // Update the session
    const updatedSession = await DatabaseService.updateCashSession(sessionId, updates)

    return NextResponse.json({
      success: true,
      message: 'Session mise à jour avec succès',
      session: updatedSession,
    })
  } catch (error: any) {
    console.error('Error updating cash session:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erreur lors de la mise à jour de la session' 
      },
      { status: 500 }
    )
  }
} 
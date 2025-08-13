import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function GET() {
  try {
    const currentSession = await DatabaseService.getCurrentCashSession()
    const history = await DatabaseService.getCashSessionHistory(5)
    
    return NextResponse.json({
      success: true,
      currentSession,
      history,
    })
  } catch (error) {
    console.error('Error fetching cash session:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la session de caisse' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'open':
        const newSession = await DatabaseService.openCashSession(data)
        return NextResponse.json({
          success: true,
          message: 'Caisse ouverte avec succès',
          session: newSession,
        })

      case 'close':
        const { sessionId, ...closeData } = data
        const closedSession = await DatabaseService.closeCashSession(sessionId, closeData)
        return NextResponse.json({
          success: true,
          message: 'Caisse fermée avec succès',
          session: closedSession,
        })

      case 'count':
        const { sessionId: countSessionId, ...countData } = data
        const countedSession = await DatabaseService.countCash(countSessionId, countData)
        return NextResponse.json({
          success: true,
          message: 'Caisse comptée avec succès',
          session: countedSession,
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Error in cash session operation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erreur lors de l\'opération de caisse' 
      },
      { status: 500 }
    )
  }
} 
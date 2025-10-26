import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

export async function getCurrentUser(request: NextRequest): Promise<string> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return 'Utilisateur non authentifié'
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return 'Token invalide'
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.isActive) {
      return 'Utilisateur non trouvé'
    }

    // Return first name if available, otherwise username
    return user.firstName || user.username

  } catch (error) {
    console.error('Error getting current user:', error)
    return 'Erreur utilisateur'
  }
}








import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add auth middleware to check if user is admin or requesting own data
    const user = await DatabaseService.getUserById(params.id)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add auth middleware to check if user is admin
    const body = await request.json()
    const updates = body

    // Don't allow password updates through this endpoint
    if ('password' in updates) {
      delete updates.password
    }

    // Validate role if provided
    if (updates.role && !['admin', 'cashier'].includes(updates.role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    const updatedUser = await DatabaseService.updateUser(params.id, updates)
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json(userWithoutPassword)
  } catch (error: any) {
    console.error('Error updating user:', error)
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('username')) {
        return NextResponse.json(
          { error: 'Ce nom d\'utilisateur existe déjà' },
          { status: 400 }
        )
      }
      if (error.meta?.target?.includes('email')) {
        return NextResponse.json(
          { error: 'Cette adresse email existe déjà' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add auth middleware to check if user is admin
    // TODO: Prevent deletion of last admin user
    
    const deletedUser = await DatabaseService.deleteUser(params.id)
    
    if (!deletedUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

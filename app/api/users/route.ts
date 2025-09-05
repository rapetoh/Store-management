import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add auth middleware to check if user is admin
    const users = await DatabaseService.getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add auth middleware to check if user is admin
    const body = await request.json()
    const { username, email, firstName, lastName, password, role } = body

    // Validate required fields
    if (!username || !email || !firstName || !lastName || !password || !role) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['admin', 'cashier'].includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await DatabaseService.createUser({
      username,
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
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
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

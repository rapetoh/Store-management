import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { username: 'admin' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@stockflow.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'StockFlow',
        role: 'admin',
        isActive: true
      }
    })

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role
    })

    // Create a cashier user as well
    const hashedCashierPassword = await bcrypt.hash('cashier123', 12)
    
    const cashierUser = await prisma.user.create({
      data: {
        username: 'cashier',
        email: 'cashier@stockflow.com',
        password: hashedCashierPassword,
        firstName: 'Caissier',
        lastName: 'StockFlow',
        role: 'cashier',
        isActive: true
      }
    })

    console.log('Cashier user created successfully:', {
      id: cashierUser.id,
      username: cashierUser.username,
      email: cashierUser.email,
      role: cashierUser.role
    })

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()

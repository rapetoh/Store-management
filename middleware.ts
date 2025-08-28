import { NextRequest, NextResponse } from 'next/server'

// Define which API endpoints should be logged
const LOGGABLE_ENDPOINTS = [
  '/api/products',
  '/api/categories', 
  '/api/suppliers',
  '/api/customers',
  '/api/sales',
  '/api/inventory',
  '/api/dashboard',
  '/api/settings',
  '/api/reports',
  '/api/cash',
  '/api/users',
  '/api/auth'
]

// Define which HTTP methods should be logged
const LOGGABLE_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH']

// Helper function to determine the category based on endpoint
function getCategory(pathname: string): string {
  if (pathname.includes('/products')) return 'Produits'
  if (pathname.includes('/categories')) return 'Catégories'
  if (pathname.includes('/suppliers')) return 'Fournisseurs'
  if (pathname.includes('/customers')) return 'Clients'
  if (pathname.includes('/sales')) return 'Ventes'
  if (pathname.includes('/inventory')) return 'Inventaire'
  if (pathname.includes('/dashboard')) return 'Dashboard'
  if (pathname.includes('/settings')) return 'Paramètres'
  if (pathname.includes('/reports')) return 'Rapports'
  if (pathname.includes('/cash')) return 'Caisse'
  if (pathname.includes('/users')) return 'Utilisateurs'
  if (pathname.includes('/auth')) return 'Système'
  
  return 'Autre'
}

// Helper function to determine the action type based on endpoint and method
function getActionType(pathname: string, method: string): string {
  if (pathname.includes('/sales') && method === 'POST') return 'sale'
  if (pathname.includes('/inventory') && method === 'POST') return 'adjustment'
  if (pathname.includes('/auth')) return 'login'
  return 'modification'
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const method = request.method
  
  // Check if this is a loggable endpoint and method
  const shouldLog = LOGGABLE_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint)) && 
                   LOGGABLE_METHODS.includes(method)
  
  if (shouldLog) {
    try {
      // Simple logging without complex parsing
      const action = getActionType(pathname, method)
      const category = getCategory(pathname)
      const details = `${method} ${pathname}`
      
      // Log the activity asynchronously using fetch to avoid import issues
      fetch('http://localhost:3000/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          details,
          user: 'Admin',
          financialImpact: null,
          category,
          metadata: JSON.stringify({
            pathname,
            method,
            timestamp: new Date().toISOString()
          })
        }),
      }).catch(error => {
        // Log error but don't fail the request
        console.error('Middleware logging error:', error)
      })
    } catch (error) {
      // Log error but don't fail the request
      console.error('Middleware error:', error)
    }
  }
  
  // Continue with the request
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 
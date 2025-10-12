import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from './database'
import { getCurrentUser } from './getCurrentUser'

export interface ApiLogContext {
  user?: string
  action?: string
  category?: string
  extractFinancialImpact?: (requestBody: any, responseBody: any) => number | null
  extractDetails?: (requestBody: any, responseBody: any) => string
}

// Higher-order function to wrap API routes with automatic logging
export function withApiLogging(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  context: ApiLogContext
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const startTime = Date.now()
    let requestBody: any = null
    let responseData: any = null
    let response: NextResponse

    try {
      // Capture request body for logging (only for POST/PUT/PATCH)
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const clonedRequest = request.clone()
          requestBody = await clonedRequest.json()
        } catch (error) {
          // Request might not have JSON body, that's okay
        }
      }

      // Execute the original handler
      response = await handler(request, ...args)

      // Capture response data for logging (only if successful)
      if (response.status >= 200 && response.status < 300) {
        try {
          const clonedResponse = response.clone()
          const responseText = await clonedResponse.text()
          if (responseText) {
            responseData = JSON.parse(responseText)
          }
        } catch (error) {
          // Response might not be JSON, that's okay
        }
      }

      // Log the successful operation
      await logApiActivity({
        request,
        requestBody,
        responseData,
        response,
        context,
        duration: Date.now() - startTime
      })

      return response

    } catch (error) {
      // Log the error
      await logApiError({
        request,
        requestBody,
        error: error as Error,
        context,
        duration: Date.now() - startTime
      })

      // Re-throw the error to maintain original behavior
      throw error
    }
  }
}

// Function to automatically determine logging context based on route
export function getAutoLogContext(request: NextRequest): ApiLogContext {
  const { pathname } = new URL(request.url)
  const method = request.method

  // Sales routes
  if (pathname.includes('/api/sales')) {
    if (method === 'POST') {
      return {
        action: 'sale',
        category: 'Ventes',
        extractFinancialImpact: (req, res) => res?.total || null,
        extractDetails: (req, res) => {
          const items = res?.items?.length || req?.items?.length || 0
          const paymentMethod = req?.paymentMethod || 'Non spécifié'
          return `Nouvelle vente - ${items} articles - ${paymentMethod}`
        }
      }
    } else if (method === 'DELETE') {
      return {
        action: 'modification',
        category: 'Ventes',
        extractFinancialImpact: (req, res) => res?.total ? -res.total : null,
        extractDetails: (req, res) => `Suppression vente #${res?.id || 'N/A'}`
      }
    }
  }

  // Products routes
  if (pathname.includes('/api/products')) {
    if (method === 'POST') {
      return {
        action: 'modification',
        category: 'Produits',
        extractDetails: (req, res) => `Ajout produit: ${req?.name || res?.name || 'N/A'}`
      }
    } else if (method === 'PUT' || method === 'PATCH') {
      return {
        action: 'modification',
        category: 'Produits',
        extractDetails: (req, res) => `Modification produit: ${req?.name || res?.name || 'N/A'}`
      }
    } else if (method === 'DELETE') {
      return {
        action: 'modification',
        category: 'Produits',
        extractDetails: (req, res) => `Suppression produit: ${res?.name || 'N/A'}`
      }
    }
  }

  // Stock adjustment routes
  if (pathname.includes('/api/products/adjust-stock') || pathname.includes('/api/inventory/adjust')) {
    return {
      action: 'adjustment',
      category: 'Inventaire',
      extractFinancialImpact: (req, res) => req?.financialImpact || res?.financialImpact || null,
      extractDetails: (req, res) => {
        const product = req?.productName || res?.productName || 'N/A'
        const reason = req?.reason || res?.reason || 'Non spécifié'
        return `Ajustement stock: ${product} - ${reason}`
      }
    }
  }

  // Categories routes
  if (pathname.includes('/api/categories')) {
    const actionMap = { POST: 'Ajout', PUT: 'Modification', PATCH: 'Modification', DELETE: 'Suppression' }
    return {
      action: 'modification',
      category: 'Catégories',
      extractDetails: (req, res) => {
        const action = actionMap[method as keyof typeof actionMap] || 'Action'
        const name = req?.name || res?.name || 'N/A'
        return `${action} catégorie: ${name}`
      }
    }
  }

  // Suppliers routes
  if (pathname.includes('/api/suppliers')) {
    const actionMap = { POST: 'Ajout', PUT: 'Modification', PATCH: 'Modification', DELETE: 'Suppression' }
    return {
      action: 'modification',
      category: 'Fournisseurs',
      extractDetails: (req, res) => {
        const action = actionMap[method as keyof typeof actionMap] || 'Action'
        const name = req?.name || res?.name || 'N/A'
        return `${action} fournisseur: ${name}`
      }
    }
  }

  // Customers routes
  if (pathname.includes('/api/customers')) {
    const actionMap = { POST: 'Ajout', PUT: 'Modification', PATCH: 'Modification', DELETE: 'Suppression' }
    return {
      action: 'modification',
      category: 'Clients',
      extractDetails: (req, res) => {
        const action = actionMap[method as keyof typeof actionMap] || 'Action'
        const name = req?.name || res?.name || req?.firstName || res?.firstName || 'N/A'
        return `${action} client: ${name}`
      }
    }
  }

  // Cash session routes
  if (pathname.includes('/api/cash')) {
    return {
      action: 'modification',
      category: 'Caisse',
      extractDetails: (req, res) => {
        if (method === 'POST') return 'Ouverture session caisse'
        if (method === 'PUT' || method === 'PATCH') return 'Modification session caisse'
        if (method === 'DELETE') return 'Fermeture session caisse'
        return 'Action caisse'
      }
    }
  }

  // Default context for unrecognized routes
  return {
    action: 'modification',
    category: 'Système',
    extractDetails: (req, res) => `Action API: ${method} ${pathname}`
  }
}

async function logApiActivity({
  request,
  requestBody,
  responseData,
  response,
  context,
  duration
}: {
  request: NextRequest
  requestBody: any
  responseData: any
  response: NextResponse
  context: ApiLogContext
  duration: number
}) {
  try {
    // Get current user - SIMPLE
    const user = await getCurrentUser(request)

    // Extract financial impact
    const financialImpact = context.extractFinancialImpact?.(requestBody, responseData) || null

    // Extract details
    const details = context.extractDetails?.(requestBody, responseData) || 
                   `${request.method} ${new URL(request.url).pathname}`

    // Create the activity log
    await DatabaseService.createActivityLog({
      action: context.action || 'modification',
      details,
      user: user, // SIMPLE - just use what getCurrentUser returns
      financialImpact,
      category: context.category || 'Système',
      metadata: JSON.stringify({
        method: request.method,
        path: new URL(request.url).pathname,
        statusCode: response.status,
        duration,
        timestamp: new Date().toISOString()
      })
    })
  } catch (error) {
    console.error('Failed to log API activity:', error)
    // Don't throw - logging failures shouldn't break the API
  }
}

async function logApiError({
  request,
  requestBody,
  error,
  context,
  duration
}: {
  request: NextRequest
  requestBody: any
  error: Error
  context: ApiLogContext
  duration: number
}) {
  try {
    const user = await getCurrentUser(request)

    await DatabaseService.createActivityLog({
      action: 'error',
      details: `Erreur API ${request.method} ${new URL(request.url).pathname}: ${error.message}`,
      user: user,
      financialImpact: null,
      category: 'Système',
      metadata: JSON.stringify({
        method: request.method,
        path: new URL(request.url).pathname,
        error: error.stack,
        duration,
        timestamp: new Date().toISOString()
      })
    })
  } catch (logError) {
    console.error('Failed to log API error:', logError)
  }
}

// No longer needed - using getCurrentUser instead

// Convenience function that automatically determines context
export function withAutoLogging(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const context = getAutoLogContext(request)
    return withApiLogging(handler, context)(request, ...args)
  }
}

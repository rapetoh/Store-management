// Utility functions for making authenticated API calls

interface FetchOptions extends RequestInit {
  headers?: HeadersInit
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

export async function authenticatedFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const authHeaders = getAuthHeaders()
  
  // Merge auth headers with any existing headers
  const mergedHeaders = {
    ...authHeaders,
    ...options.headers,
  }
  
  return fetch(url, {
    ...options,
    headers: mergedHeaders,
  })
}

// Convenience methods for common HTTP verbs
export const api = {
  get: (url: string, options: FetchOptions = {}) => 
    authenticatedFetch(url, { ...options, method: 'GET' }),
    
  post: (url: string, data?: any, options: FetchOptions = {}) => 
    authenticatedFetch(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: (url: string, data?: any, options: FetchOptions = {}) => 
    authenticatedFetch(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  patch: (url: string, data?: any, options: FetchOptions = {}) => 
    authenticatedFetch(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: (url: string, options: FetchOptions = {}) => 
    authenticatedFetch(url, { ...options, method: 'DELETE' }),
}

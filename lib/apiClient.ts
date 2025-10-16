// Universal API client that ALWAYS includes auth headers
export async function apiCall(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    : null

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  }

  return fetch(url, {
    ...options,
    headers
  })
}







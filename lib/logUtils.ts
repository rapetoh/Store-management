// Simple utility to get current user for logging
export async function getCurrentUserForLogging(): Promise<string> {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const userData = await response.json()
          return userData.firstName || userData.username || 'Utilisateur'
        }
      }
    }
    return 'Utilisateur inconnu'
  } catch (error) {
    console.error('Error getting current user:', error)
    return 'Utilisateur inconnu'
  }
}

// Simple logging function that gets real user
export async function logActivity(action: string, details: string, category: string = 'Système', financialImpact?: number) {
  try {
    const user = await getCurrentUserForLogging()
    
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        details,
        user,
        financialImpact: financialImpact || null,
        category
      }),
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}






'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'cashier'
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string, rememberMe: boolean) => Promise<boolean>
  logout: () => void
  register: (userData: RegisterData) => Promise<boolean>
  updateProfile: (userData: Partial<User>) => Promise<boolean>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'cashier'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      // Check both localStorage and sessionStorage for tokens
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // Invalid token, remove it from both storages
          localStorage.removeItem('authToken')
          sessionStorage.removeItem('authToken')
        }
      }
    } catch (error) {
      console.error('Error checking session:', error)
      localStorage.removeItem('authToken')
      sessionStorage.removeItem('authToken')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string, rememberMe: boolean): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, rememberMe }),
      })

      if (response.ok) {
        const { user: userData, token } = await response.json()
        setUser(userData)
        
        // Clear any existing tokens first
        localStorage.removeItem('authToken')
        localStorage.removeItem('isSessionToken')
        sessionStorage.removeItem('authToken')
        
        if (rememberMe) {
          // For "Remember me", store in localStorage (persists across browser sessions)
          localStorage.setItem('authToken', token)
        } else {
          // For session-based login, store in sessionStorage (clears when tab/browser closes)
          sessionStorage.setItem('authToken', token)
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('authToken')
    sessionStorage.removeItem('authToken')
    
    // Call logout API to invalidate token
    fetch('/api/auth/logout', { method: 'POST' }).catch(console.error)
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      return response.ok
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        return true
      }
      return false
    } catch (error) {
      console.error('Profile update error:', error)
      return false
    }
  }

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      register,
      updateProfile,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

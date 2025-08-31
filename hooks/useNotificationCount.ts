import { useState, useEffect } from 'react'

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadNotificationCount = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications/count')
      const data = await response.json()
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Error loading notification count:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotificationCount()
    
    // Refresh count every 30 seconds
    const interval = setInterval(loadNotificationCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const refreshCount = () => {
    loadNotificationCount()
  }

  return {
    unreadCount,
    isLoading,
    refreshCount
  }
} 
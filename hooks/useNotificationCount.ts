import { useState, useEffect } from 'react'

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadNotificationCount = async () => {
    try {
      setIsLoading(true)
      // First call - creates notifications and gets initial count
      const response = await fetch('/api/notifications/count')
      const data = await response.json()
      setUnreadCount(data.unreadCount)
      
      // Second call after a short delay - ensures we get the updated count
      // after any new notifications have been fully created
      setTimeout(async () => {
        try {
          const secondResponse = await fetch('/api/notifications/count')
          const secondData = await secondResponse.json()
          setUnreadCount(secondData.unreadCount)
        } catch (error) {
          console.error('Error loading notification count (second pass):', error)
        }
      }, 1000)
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
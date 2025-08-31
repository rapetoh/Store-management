'use client'

import { useState, useEffect } from 'react'
import { X, Bell, AlertTriangle, Package, ShoppingCart, CheckCircle, Clock, Trash2 } from 'lucide-react'

interface Notification {
  id: string
  type: 'stock_low' | 'stock_critical' | 'stock_out' | 'sale' | 'replenishment' | 'system'
  title: string
  message: string
  isRead: boolean
  priority: 'low' | 'normal' | 'high' | 'critical'
  productId?: string
  product?: {
    id: string
    name: string
    sku?: string
    stock: number
    minStock: number
  }
  metadata?: string
  createdAt: string
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    totalCount: 0,
    hasNextPage: false
  })

  // Load notifications
  const loadNotifications = async (page = 1, filterType = filter) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (filterType === 'unread') {
        params.append('isRead', 'false')
      }
      
      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()
      
      if (page === 1) {
        setNotifications(data.notifications)
      } else {
        setNotifications(prev => [...prev, ...data.notifications])
      }
      
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load notifications when modal opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications(1, filter)
    }
  }, [isOpen, filter])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'stock_low':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'stock_critical':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'stock_out':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'sale':
        return <ShoppingCart className="w-5 h-5 text-green-500" />
      case 'replenishment':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'system':
        return <Bell className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'stock_low':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'stock_critical':
        return 'border-l-orange-500 bg-orange-50'
      case 'stock_out':
        return 'border-l-red-500 bg-red-50'
      case 'sale':
        return 'border-l-green-500 bg-green-50'
      case 'replenishment':
        return 'border-l-blue-500 bg-blue-50'
      case 'system':
        return 'border-l-purple-500 bg-purple-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [notificationId]
        }),
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true } 
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markAll: true
        }),
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [notificationId]
        }),
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const unreadCount = notifications.filter(notification => !notification.isRead).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">{unreadCount} nouvelles notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Toutes ({pagination.totalCount})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'unread' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Non lues ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-6">
          {isLoading && notifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune notification</h3>
              <p className="text-gray-500">
                {filter === 'all' ? 'Vous n\'avez aucune notification' : 'Toutes les notifications ont été lues'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.isRead ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        {notification.product && (
                          <p className="text-xs text-gray-500 mt-1">
                            Produit: {notification.product.name} (Stock: {notification.product.stock}/{notification.product.minStock})
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Marquer comme lu
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {pagination.hasNextPage && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => loadNotifications(pagination.page + 1, filter)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Chargement...' : 'Charger plus'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
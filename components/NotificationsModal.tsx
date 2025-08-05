'use client'

import { useState } from 'react'
import { X, Bell, AlertTriangle, Package, ShoppingCart, CheckCircle, Clock } from 'lucide-react'

interface Notification {
  id: number
  type: 'warning' | 'info' | 'success' | 'error'
  title: string
  message: string
  time: string
  read: boolean
}

const notifications: Notification[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Stock faible',
    message: 'Le produit "Hub USB-C" est en stock faible (5 unités restantes)',
    time: 'Il y a 2 minutes',
    read: false
  },
  {
    id: 2,
    type: 'error',
    title: 'Stock critique',
    message: 'Le produit "Casque Gaming Pro" est en stock critique (3 unités restantes)',
    time: 'Il y a 15 minutes',
    read: false
  },
  {
    id: 3,
    type: 'error',
    title: 'Rupture de stock',
    message: 'Le produit "SSD Portable 1TB" est en rupture de stock',
    time: 'Il y a 1 heure',
    read: false
  },
  {
    id: 4,
    type: 'success',
    title: 'Commande livrée',
    message: 'La commande ORD001 a été livrée avec succès',
    time: 'Il y a 2 heures',
    read: true
  },
  {
    id: 5,
    type: 'info',
    title: 'Nouveau produit',
    message: 'Le produit "Webcam HD" a été ajouté à l\'inventaire',
    time: 'Il y a 3 heures',
    read: true
  }
]

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notificationsList, setNotificationsList] = useState<Notification[]>(notifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'info':
        return <Package className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'info':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const markAsRead = (id: number) => {
    setNotificationsList(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotificationsList(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: number) => {
    setNotificationsList(prev => prev.filter(notification => notification.id !== id))
  }

  const filteredNotifications = filter === 'all' 
    ? notificationsList 
    : notificationsList.filter(notification => !notification.read)

  const unreadCount = notificationsList.filter(notification => !notification.read).length

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
                Toutes ({notificationsList.length})
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
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune notification</h3>
              <p className="text-gray-500">
                {filter === 'all' ? 'Vous n\'avez aucune notification' : 'Toutes les notifications ont été lues'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'ring-2 ring-blue-200' : ''
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
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Marquer comme lu
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
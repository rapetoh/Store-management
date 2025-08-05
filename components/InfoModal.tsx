'use client'

import { X, Info, CheckCircle, AlertTriangle, Package, ShoppingCart } from 'lucide-react'

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'info' | 'success' | 'warning'
  icon?: 'info' | 'success' | 'warning' | 'package' | 'cart'
}

export default function InfoModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  icon = 'info'
}: InfoModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (icon) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case 'package':
        return <Package className="w-6 h-6 text-blue-500" />
      case 'cart':
        return <ShoppingCart className="w-6 h-6 text-blue-500" />
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-500" />
    }
  }

  const getIconBackground = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100'
      case 'warning':
        return 'bg-yellow-100'
      case 'info':
      default:
        return 'bg-blue-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${getIconBackground()} rounded-lg flex items-center justify-center`}>
              {getIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
} 
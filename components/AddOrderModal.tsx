'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, User, Package, Plus, Trash2, Save } from 'lucide-react'
import Modal from './Modal'
import toast from 'react-hot-toast'

interface OrderItem {
  productId: number
  productName: string
  quantity: number
  price: number
  total: number
}

interface OrderForm {
  customerName: string
  customerEmail: string
  customerPhone: string
  items: OrderItem[]
  notes: string
}

const customers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+33 1 23 45 67 89' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+33 1 23 45 67 90' },
  { id: 3, name: 'Robert Johnson', email: 'robert@example.com', phone: '+33 1 23 45 67 91' },
  { id: 4, name: 'Emily White', email: 'emily@example.com', phone: '+33 1 23 45 67 92' },
  { id: 5, name: 'Michael Brown', email: 'michael@example.com', phone: '+33 1 23 45 67 93' },
]

const availableProducts = [
  { id: 1, name: 'Souris Sans Fil X2', price: 25.00, stock: 150 },
  { id: 2, name: 'Clavier Ergonomique', price: 75.00, stock: 20 },
  { id: 3, name: 'Hub USB-C', price: 30.00, stock: 5 },
  { id: 4, name: 'Casque Gaming Pro', price: 120.00, stock: 3 },
  { id: 5, name: 'SSD Portable 1TB', price: 99.00, stock: 0 },
  { id: 6, name: 'Webcam HD', price: 45.00, stock: 2 },
]

export default function AddOrderModal({ isOpen, onClose, onOrderAdded }: {
  isOpen: boolean
  onClose: () => void
  onOrderAdded: (order: any) => void
}) {
  const [formData, setFormData] = useState<OrderForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [],
    notes: ''
  })

  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCustomerSelect = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone
      }))
      setSelectedCustomer(customerId)
    }
  }

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) return

    const product = availableProducts.find(p => p.id === selectedProduct)
    if (!product) return

    if (quantity > product.stock) {
      toast.error(`Stock insuffisant. Disponible: ${product.stock}`)
      return
    }

    const newItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.price,
      total: product.price * quantity
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))

    setSelectedProduct(null)
    setQuantity(1)
    toast.success('Produit ajouté à la commande')
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const getTotalAmount = () => {
    return formData.items.reduce((total, item) => total + item.total, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.items.length === 0) {
      toast.error('Veuillez ajouter au moins un produit')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newOrder = {
      id: `ORD${Date.now().toString().slice(-6)}`,
      customer: formData.customerName,
      date: new Date().toISOString().split('T')[0],
      total: getTotalAmount(),
      status: 'En attente',
      itemCount: formData.items.length,
      paymentStatus: 'En attente',
      notes: formData.notes,
      items: formData.items
    }

    onOrderAdded(newOrder)
    toast.success('Commande créée avec succès !')
    onClose()
    setIsSubmitting(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une nouvelle commande" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-night-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-night-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informations client
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-night-700 mb-2">
                Client existant
              </label>
              <select
                value={selectedCustomer || ''}
                onChange={(e) => handleCustomerSelect(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-night-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sélectionner un client</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-night-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                className="w-full px-4 py-3 border border-night-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Nom du client"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-night-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                className="w-full px-4 py-3 border border-night-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-night-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
              className="w-full px-4 py-3 border border-night-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+33 1 23 45 67 89"
            />
          </div>
        </div>

        {/* Products Selection */}
        <div className="bg-night-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-night-800 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Produits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-night-700 mb-2">
                Produit
              </label>
              <select
                value={selectedProduct || ''}
                onChange={(e) => setSelectedProduct(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-night-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sélectionner un produit</option>
                {availableProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - €{product.price} (Stock: {product.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-night-700 mb-2">
                Quantité
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-night-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="1"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={addItem}
                disabled={!selectedProduct || quantity <= 0}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-turquoise-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {formData.items.length > 0 && (
          <div className="bg-white rounded-xl border border-night-200">
            <div className="p-4 border-b border-night-100">
              <h3 className="text-lg font-semibold text-night-800">Produits commandés</h3>
            </div>
            <div className="p-4 space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-night-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-night-800">{item.productName}</p>
                    <p className="text-sm text-night-600">Quantité: {item.quantity} × €{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-night-800">€{item.total.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-night-100">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-night-800">Total</span>
                  <span className="text-xl font-bold text-primary-600">€{getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-night-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-night-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Notes sur la commande..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-night-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-night-700 bg-white border border-night-200 rounded-xl hover:bg-night-50 transition-colors duration-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || formData.items.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-turquoise-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Création en cours...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Créer la commande</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
} 
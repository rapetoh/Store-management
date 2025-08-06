'use client'

import { useState, useEffect } from 'react'
import { X, Package, Save, Loader2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  category: string
  supplier: string
  stock: number
  price: number
  status: string
  description?: string
  alertLevel: number
}

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  onProductUpdated: (product: Product) => void
  product: Product | null
}

const categories = ['Électronique', 'Accessoires', 'Bureau', 'Gaming', 'Stockage', 'Audio', 'Autres']
const suppliers = ['TechCorp', 'ErgoGear', 'ConnectAll', 'GameSound', 'DataVault', 'ViewTech', 'AudioMax']

export default function EditProductModal({ isOpen, onClose, onProductUpdated, product }: EditProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: '',
    supplier: '',
    stock: 0,
    price: 0,
    status: 'En stock',
    description: '',
    alertLevel: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Mettre à jour le formulaire quand le produit change
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        supplier: product.supplier,
        stock: product.stock,
        price: product.price,
        status: product.status,
        description: product.description || '',
        alertLevel: product.alertLevel
      })
      setErrors({})
    }
  }, [product])

  const generateSKU = () => {
    const prefix = formData.name?.substring(0, 3).toUpperCase() || 'PRO'
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    setFormData(prev => ({ ...prev, sku: `${prefix}-${random}` }))
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name?.trim()) newErrors.name = 'Le nom est requis'
    if (!formData.sku?.trim()) newErrors.sku = 'Le SKU est requis'
    if (!formData.category) newErrors.category = 'La catégorie est requise'
    if (!formData.supplier) newErrors.supplier = 'Le fournisseur est requis'
    if (!formData.stock || isNaN(Number(formData.stock))) newErrors.stock = 'Le stock doit être un nombre'
    if (!formData.price || isNaN(Number(formData.price))) newErrors.price = 'Le prix doit être un nombre'
    if (!formData.alertLevel || isNaN(Number(formData.alertLevel))) newErrors.alertLevel = 'Le niveau d\'alerte doit être un nombre'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateStatus = () => {
    const stock = Number(formData.stock) || 0
    let newStatus = 'En stock'
    
    if (stock === 0) {
      newStatus = 'Rupture'
    } else if (stock <= (formData.alertLevel || 0)) {
      newStatus = 'Stock critique'
    } else if (stock <= (formData.alertLevel || 0) * 2) {
      newStatus = 'Stock faible'
    }
    
    setFormData(prev => ({ ...prev, status: newStatus }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const updatedProduct: Product = {
      id: formData.id!,
      name: formData.name!,
      sku: formData.sku!,
      category: formData.category!,
      supplier: formData.supplier!,
      stock: Number(formData.stock),
      price: Number(formData.price),
      status: formData.status!,
      description: formData.description,
      alertLevel: Number(formData.alertLevel)
    }

    onProductUpdated(updatedProduct)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      supplier: '',
      stock: 0,
      price: 0,
      status: 'En stock',
      description: '',
      alertLevel: 0
    })
    setErrors({})
    setIsLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Modifier le produit</h2>
              <p className="text-sm text-gray-600">Mettez à jour les informations du produit</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nom du produit"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.sku ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Code SKU"
                  />
                  <button
                    type="button"
                    onClick={generateSKU}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Générer
                  </button>
                </div>
                {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur *</label>
                <select
                  value={formData.supplier || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.supplier ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {suppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
                {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>}
              </div>
            </div>
          </div>

          {/* Stock and Pricing */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Stock et prix</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <input
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))
                    setTimeout(updateStatus, 100)
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.stock ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Quantité en stock"
                  min="0"
                />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  min="0"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'alerte *</label>
                <input
                  type="number"
                  value={formData.alertLevel || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, alertLevel: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.alertLevel ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Seuil d'alerte"
                  min="0"
                />
                {errors.alertLevel && <p className="text-red-500 text-xs mt-1">{errors.alertLevel}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut actuel</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                <span className="text-sm font-medium text-gray-900">{formData.status}</span>
                <p className="text-xs text-gray-500 mt-1">Mis à jour automatiquement selon le stock</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description du produit</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description détaillée du produit..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Modification en cours...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
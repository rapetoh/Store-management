'use client'

import { useState, useEffect } from 'react'
import { X, Save, Package, Tag, Hash, DollarSign, AlertTriangle } from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  barcode?: string
  sku?: string
  categoryId?: string
  taxRateId?: string
  image?: string
  isActive: boolean
}

interface Category {
  id: string
  name: string
  description?: string
}

interface TaxRate {
  id: string
  name: string
  rate: number
  isDefault: boolean
}

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  onProductUpdated: () => void
  product: Product | null
}

export default function EditProductModal({ isOpen, onClose, onProductUpdated, product }: EditProductModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '',
    barcode: '',
    sku: '',
    categoryId: '',
    taxRateId: '',
    image: '',
    isActive: true
  })

  useEffect(() => {
    if (isOpen) {
      loadCategories()
      loadTaxRates()
    }
  }, [isOpen])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        costPrice: product.costPrice.toString(),
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        barcode: product.barcode || '',
        sku: product.sku || '',
        categoryId: product.categoryId || '',
        taxRateId: product.taxRateId || '',
        image: product.image || '',
        isActive: product.isActive
      })
    }
  }, [product])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadTaxRates = async () => {
    try {
      const response = await fetch('/api/tax-rates')
      if (response.ok) {
        const data = await response.json()
        setTaxRates(data)
      }
    } catch (error) {
      console.error('Error loading tax rates:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!product || !formData.name || !formData.price || !formData.costPrice || !formData.categoryId) {
      showToast('error', 'Champs requis', 'Le nom, le prix de vente, le prix d\'achat et la catégorie sont obligatoires')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          costPrice: parseFloat(formData.costPrice),
          stock: product.stock, // Garder le stock original - ne pas modifier via ce formulaire
          minStock: parseInt(formData.minStock) || 0,
          barcode: formData.barcode || undefined,
          sku: formData.sku || undefined,
          categoryId: formData.categoryId || undefined,
          taxRateId: formData.taxRateId || undefined,
          image: formData.image || undefined,
          isActive: formData.isActive
        }),
      })

      if (response.ok) {
        // Log the product update
        try {
          await fetch('/api/logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'modification',
              details: `Modification produit: ${product.name} → ${formData.name} - Prix: ${product.price} → ${parseFloat(formData.price)} FCFA - Stock: ${product.stock} (inchangé)`,
              user: 'Admin',
              financialImpact: undefined,
              category: 'Produits'
            }),
          })
        } catch (logError) {
          console.error('Error logging product update:', logError)
        }
        
        showToast('success', 'Produit mis à jour', 'Le produit a été mis à jour avec succès')
        onProductUpdated()
        onClose()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      showToast('error', 'Erreur', 'Impossible de mettre à jour le produit')
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Modifier le produit</h2>
              <p className="text-sm text-gray-600">Modifier les informations du produit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du produit"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de vente (FCFA) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description du produit"
              />
            </div>
          </div>

          {/* Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock et inventaire</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix d'achat (FCFA) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock minimum
                </label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock actuel (lecture seule)
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="0"
                  disabled
                />
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                  <AlertTriangle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-sm text-amber-800 font-medium">Modification du stock</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Le stock actuel ne peut être modifié directement. Pour changer le stock, utilisez :
                  </p>
                  <ul className="text-sm text-amber-700 mt-2 space-y-1">
                    <li>• <strong>Ventes</strong> : Diminution automatique lors des ventes</li>
                    <li>• <strong>Ravitaillement</strong> : Augmentation via la section "Ravitaillement"</li>
                    <li>• <strong>Ajustement d'inventaire</strong> : Via la section "Inventaire"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Classification</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux de TVA
                </label>
                <select
                  value={formData.taxRateId}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxRateId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un taux</option>
                  {taxRates.map((taxRate) => (
                    <option key={taxRate.id} value={taxRate.id}>
                      {taxRate.name} ({taxRate.rate}%)
                      {taxRate.isDefault && ' - Par défaut'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Identifiers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Identifiants</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code-barres
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Code-barres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SKU"
                />
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Image</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemple.com/image.jpg"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Statut</h3>
            
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Produit actif</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Les produits inactifs ne sont pas visibles dans les ventes
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mise à jour...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Mettre à jour</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import {
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Upload
} from 'lucide-react'
import AddProductModal from './AddProductModal'
import EditProductModal from './EditProductModal'
import ConfirmModal from './ConfirmModal'
import ImportModal from './ImportModal'

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
  image?: string
  isActive: boolean
  category?: {
    id: string
    name: string
  }
  taxRate?: {
    id: string
    name: string
    rate: number
  }
}

interface Category {
  id: string
  name: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  // UI States
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // all, low, out
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
  const [showFilters, setShowFilters] = useState(false)
  
  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Load products with current filters
  const loadProducts = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: debouncedSearchTerm,
        categoryId: selectedCategory,
        lowStock: stockFilter === 'low' ? 'true' : 'false',
        outOfStock: stockFilter === 'out' ? 'true' : 'false',
        isActive: statusFilter === 'all' ? '' : statusFilter === 'active' ? 'true' : 'false'
      })

      console.log('Loading products with params:', params.toString())
      const response = await fetch(`/api/products?${params}`)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Products data received:', data)
        console.log('Number of products:', data.products?.length || 0)
        setProducts(data.products || [])
        setPagination(data.pagination || {})
      } else {
        throw new Error('Failed to load products')
      }
    } catch (error) {
      console.error('Error loading products:', error)
      showToast('error', 'Erreur', 'Impossible de charger les produits')
    } finally {
      setIsLoading(false)
    }
  }

  // Load categories for filter
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

  // Initialize data
  useEffect(() => {
    console.log('Products component mounted, loading data...')
    loadCategories()
    loadProducts()
  }, [])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reload products when filters change
  useEffect(() => {
    loadProducts(1)
  }, [debouncedSearchTerm, selectedCategory, stockFilter, statusFilter])

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    loadProducts(newPage)
  }

  // Logging function
  const logActivity = async (action: string, details: string, financialImpact?: number) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          details,
          user: 'Admin', // TODO: Get actual user from auth system
          financialImpact: financialImpact || null,
          category: 'Produits'
        }),
      })
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Log the deletion
        await logActivity(
          'modification',
          `Suppression produit: ${selectedProduct.name} (${selectedProduct.sku || 'N/A'}) - Stock: ${selectedProduct.stock}`,
          undefined
        )
        
        showToast('success', 'Produit supprimé', 'Le produit a été supprimé avec succès')
        loadProducts(pagination.page) // Reload current page
        setShowConfirmModal(false)
        setSelectedProduct(null)
      } else {
        throw new Error('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showToast('error', 'Erreur', 'Impossible de supprimer le produit')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  // Handle product updated
  const handleProductUpdated = () => {
    loadProducts(pagination.page)
  }

  // Handle product added
  const handleProductAdded = () => {
    loadProducts(1) // Go to first page to see new product
  }

  // Handle export products
  const handleExportProducts = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/products/bulk?format=csv')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `produits_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showToast('success', 'Export réussi', 'Les produits ont été exportés avec succès')
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Error exporting products:', error)
      showToast('error', 'Erreur', 'Impossible d\'exporter les produits')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle import complete
  const handleImportComplete = () => {
    loadProducts(1) // Reload products after import
    showToast('success', 'Import réussi', 'Les produits ont été importés avec succès')
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setStockFilter('all')
    setStatusFilter('all')
  }

  // Get stock status
  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return { text: 'Rupture', color: 'text-red-600', bg: 'bg-red-50' }
    } else if (product.stock <= product.minStock) {
      return { text: 'Stock faible', color: 'text-orange-600', bg: 'bg-orange-50' }
    } else {
      return { text: 'Stock OK', color: 'text-green-600', bg: 'bg-green-50' }
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600">
            {pagination.totalCount} produit{pagination.totalCount !== 1 ? 's' : ''} au total
          </p>

        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-md transition-colors flex items-center space-x-2 ${
              showFilters 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
          <button
            onClick={handleExportProducts}
            disabled={isExporting}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Export...' : 'Exporter'}</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importer</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un produit</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
            placeholder="Rechercher par nom, SKU ou code-barres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Filtres</h3>
            <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
            >
                Effacer tout
            </button>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="low">Stock faible</option>
                  <option value="out">Rupture</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-2">Chargement des produits...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Aucun produit trouvé</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || selectedCategory || stockFilter !== 'all' || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Commencez par ajouter votre premier produit'
              }
            </p>
        </div>
        ) : (
          <>
        <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QTÉ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TVA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product)
                    return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {product.image ? (
                                <img 
                                  className="h-10 w-10 rounded-lg object-cover" 
                                  src={product.image} 
                                  alt={product.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.sku && `SKU: ${product.sku}`}
                                {product.barcode && product.sku && ' • '}
                                {product.barcode && `Code: ${product.barcode}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.price.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.costPrice ? (
                              <>
                                <div className="font-medium">
                                  {(product.price - product.costPrice).toLocaleString('fr-FR')} FCFA
                                </div>
                                <div className="text-xs text-gray-500">
                                  {product.price > 0 ? Math.round(((product.price - product.costPrice) / product.price) * 100) : 0}%
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.stock} unités
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full inline-block ${stockStatus.bg}`}>
                            <span className={stockStatus.color}>{stockStatus.text}</span>
                    </div>
                  </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.taxRate ? `${product.taxRate.name} (${product.taxRate.rate}%)` : '-'}
                        </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                              onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                              onClick={() => {
                                setSelectedProduct(product)
                                setShowConfirmModal(true)
                              }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> à{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
                      </span>{' '}
                      sur <span className="font-medium">{pagination.totalCount}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />

      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onProductUpdated={handleProductUpdated}
        product={selectedProduct}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDeleteProduct}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedProduct?.name}" ? Cette action ne peut pas être annulée.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  )
} 
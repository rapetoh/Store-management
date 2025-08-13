'use client'

import { useState, useEffect } from 'react'
import {
  Search, Filter, Plus, Eye, Edit, Trash2, Download, Upload
} from 'lucide-react'
import AddProductModal from './AddProductModal'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'
import EditProductModal from './EditProductModal'
import ImportProductsModal from './ImportProductsModal'

interface Product {
  id: string
  name: string
  sku?: string
  category?: string | { id: string; name: string; description?: string }
  categoryId?: string
  supplier?: string
  stock: number
  price: number
  status?: string
  description?: string
  alertLevel?: number
  minStock?: number
  barcode?: string
  isActive?: boolean
}

const categories = ['Alimentation', 'Boulangerie', 'Fruits', 'Boissons', 'Snacks', 'Confiserie']
const suppliers = ['TechCorp', 'ErgoGear', 'ConnectAll', 'GameSound', 'DataVault', 'ViewTech', 'AudioMax']

// Products will be loaded from database

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProducts(data)
      } else if (data.error) {
        console.error('API Error:', data.error)
        setProducts([])
      } else {
        console.error('Unexpected data format:', data)
        setProducts([])
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }
  const [selectedCategory, setSelectedCategory] = useState('Toutes les catégories')
  const [selectedStatus, setSelectedStatus] = useState('Tous les statuts')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })

  // Helper to show custom toasts
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleAddProduct = (newProduct: Product) => {
    // Reload products from database to ensure consistency
    loadProducts()
    showToast('success', 'Produit ajouté', `Le produit "${newProduct.name}" a été ajouté avec succès !`)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  const handleUpdateProduct = (updatedProduct: Product) => {
    // Reload products from database to ensure consistency
    loadProducts()
    setShowEditModal(false)
    setSelectedProduct(null)
    showToast('success', 'Produit modifié', `Le produit "${updatedProduct.name}" a été modifié avec succès !`)
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (selectedProduct) {
      try {
        const response = await fetch(`/api/products/${selectedProduct.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete product')
        }

        // Reload products from database to ensure consistency
        loadProducts()
        showToast('success', 'Produit supprimé', `Le produit "${selectedProduct.name}" a été supprimé avec succès.`)
        setSelectedProduct(null)
        setShowDeleteModal(false)
      } catch (error) {
        console.error('Error deleting product:', error)
        showToast('error', 'Erreur', 'Erreur lors de la suppression du produit')
      }
    }
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    const categoryName = typeof product.category === 'object' ? product.category?.name : product.category
    setInfoModalData({
      title: 'Détails du produit',
      message: `Nom: ${product.name}\nSKU: ${product.sku || 'N/A'}\nCatégorie: ${categoryName || 'Sans catégorie'}\nFournisseur: ${product.supplier || 'N/A'}\nStock: ${product.stock} unités\nPrix: ${product.price.toLocaleString('fr-FR')} FCFA\nStatut: ${getProductStatus(product)}\nNiveau d'alerte: ${product.minStock || 5} unités${product.description ? `\n\nDescription: ${product.description}` : ''}`,
      type: 'info',
      icon: 'package'
    })
    setShowInfoModal(true)
  }

  const handleExport = () => {
    const csvContent = [
      ['Nom', 'SKU', 'Catégorie', 'Fournisseur', 'Stock', 'Prix', 'Statut'],
      ...products.map(p => {
        const categoryName = typeof p.category === 'object' ? p.category?.name : p.category
        return [p.name, p.sku || 'N/A', categoryName || 'Sans catégorie', p.supplier || 'N/A', p.stock.toString(), p.price.toString(), getProductStatus(p)]
      })
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'produits.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showToast('success', 'Export terminé', 'Le fichier CSV a été téléchargé avec succès.')
  }

  const handleImport = () => {
    setShowImportModal(true)
  }

  const handleImportComplete = () => {
    loadProducts()
    showToast('success', 'Import terminé', 'Les produits ont été importés avec succès !')
  }

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    const categoryName = typeof product.category === 'object' ? product.category?.name : product.category
    const matchesCategory = selectedCategory === 'Toutes les catégories' || categoryName === selectedCategory
    const matchesStatus = selectedStatus === 'Tous les statuts' || getProductStatus(product) === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  }) : []

  const getProductStatus = (product: Product) => {
    if (product.stock === 0) return 'Rupture'
    if (product.stock <= (product.minStock || 5)) return 'Stock critique'
    if (product.stock <= (product.minStock || 5) * 2) return 'Stock faible'
    return 'En stock'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En stock': return 'bg-green-100 text-green-800'
      case 'Stock faible': return 'bg-yellow-100 text-yellow-800'
      case 'Stock critique': return 'bg-orange-100 text-orange-800'
      case 'Rupture': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600">Gérez votre inventaire de produits</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleImport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importer</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Toutes les catégories">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Tous les statuts">Tous les statuts</option>
                  <option value="En stock">En stock</option>
                  <option value="Stock faible">Stock faible</option>
                  <option value="Stock critique">Stock critique</option>
                  <option value="Rupture">Rupture</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Liste des Produits</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Chargement des produits...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {typeof product.category === 'object' ? product.category?.name || 'Sans catégorie' : product.category || 'Sans catégorie'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.price.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getProductStatus(product))}`}>
                      {getProductStatus(product)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-green-600 hover:text-green-900"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleAddProduct}
      />

      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedProduct(null)
        }}
        onProductUpdated={handleUpdateProduct}
        product={selectedProduct}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer le produit "${selectedProduct?.name}" ?\n\nCette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={infoModalData.title}
        message={infoModalData.message}
        type={infoModalData.type}
        icon={infoModalData.icon}
      />

      <ImportProductsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  )
} 
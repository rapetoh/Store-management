'use client'

import { useState } from 'react'
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react'
import AddProductModal from './AddProductModal'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'

interface Product {
  id: number
  name: string
  sku: string
  category: string
  supplier: string
  stock: number
  price: number
  status: string
  alertLevel: number
  description?: string
  imageUrl?: string
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Souris Sans Fil X2',
    sku: 'WMX2-001',
    category: 'Électronique',
    supplier: 'TechCorp',
    stock: 150,
    price: 25.00,
    status: 'En stock',
    alertLevel: 10,
    description: 'Souris sans fil ergonomique avec connexion 2.4GHz'
  },
  {
    id: 2,
    name: 'Clavier Ergonomique',
    sku: 'EK-005',
    category: 'Électronique',
    supplier: 'ErgoGear',
    stock: 20,
    price: 75.00,
    status: 'Stock faible',
    alertLevel: 25,
    description: 'Clavier mécanique avec design ergonomique'
  },
  {
    id: 3,
    name: 'Hub USB-C',
    sku: 'UCH-010',
    category: 'Accessoires',
    supplier: 'ConnectAll',
    stock: 5,
    price: 30.00,
    status: 'Stock faible',
    alertLevel: 15,
    description: 'Hub USB-C 7-en-1 avec ports multiples'
  },
  {
    id: 4,
    name: 'Casque Gaming Pro',
    sku: 'GHP-003',
    category: 'Électronique',
    supplier: 'GameSound',
    stock: 3,
    price: 120.00,
    status: 'Stock critique',
    alertLevel: 20,
    description: 'Casque gaming avec son surround 7.1'
  },
  {
    id: 5,
    name: 'SSD Portable 1TB',
    sku: 'SSD1TB-002',
    category: 'Électronique',
    supplier: 'DataVault',
    stock: 0,
    price: 99.00,
    status: 'Rupture',
    alertLevel: 5,
    description: 'SSD portable haute vitesse 1TB'
  },
  {
    id: 6,
    name: 'Webcam HD',
    sku: 'WCHD-007',
    category: 'Électronique',
    supplier: 'ViewTech',
    stock: 2,
    price: 45.00,
    status: 'Stock critique',
    alertLevel: 10,
    description: 'Webcam HD 1080p avec micro intégré'
  }
]

const categories = ['Toutes les catégories', 'Électronique', 'Accessoires', 'Bureau', 'Gaming']
const suppliers = ['Tous les fournisseurs', 'TechCorp', 'ErgoGear', 'ConnectAll', 'GameSound', 'DataVault', 'ViewTech']
const statuses = ['Tous les statuts', 'En stock', 'Stock faible', 'Stock critique', 'Rupture']

export default function Products() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Toutes les catégories')
  const [selectedSupplier, setSelectedSupplier] = useState('Tous les fournisseurs')
  const [selectedStatus, setSelectedStatus] = useState('Tous les statuts')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Toutes les catégories' || product.category === selectedCategory
    const matchesSupplier = selectedSupplier === 'Tous les fournisseurs' || product.supplier === selectedSupplier
    const matchesStatus = selectedStatus === 'Tous les statuts' || product.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesSupplier && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En stock':
        return 'bg-green-100 text-green-700'
      case 'Stock faible':
        return 'bg-yellow-100 text-yellow-700'
      case 'Stock critique':
        return 'bg-orange-100 text-orange-700'
      case 'Rupture':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev])
    showToast('success', 'Produit ajouté', `Le produit "${newProduct.name}" a été ajouté avec succès !`)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setInfoModalData({
      title: 'Modifier le produit',
      message: `Fonctionnalité d'édition pour "${product.name}"\n\nCette fonctionnalité sera implémentée dans la prochaine version.`,
      type: 'info',
      icon: 'package'
    })
    setShowInfoModal(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedProduct) {
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id))
      showToast('success', 'Produit supprimé', `Le produit "${selectedProduct.name}" a été supprimé avec succès.`)
      setSelectedProduct(null)
    }
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setInfoModalData({
      title: 'Détails du produit',
      message: `Nom: ${product.name}\nSKU: ${product.sku}\nCatégorie: ${product.category}\nFournisseur: ${product.supplier}\nStock: ${product.stock} unités\nPrix: €${product.price.toFixed(2)}\nStatut: ${product.status}${product.description ? `\n\nDescription: ${product.description}` : ''}`,
      type: 'info',
      icon: 'package'
    })
    setShowInfoModal(true)
  }

  const handleExport = () => {
    const csvContent = [
      ['Nom', 'SKU', 'Catégorie', 'Fournisseur', 'Stock', 'Prix', 'Statut'],
      ...filteredProducts.map(p => [p.name, p.sku, p.category, p.supplier, p.stock, p.price, p.status])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `produits_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    showToast('success', 'Export terminé', 'Le fichier CSV a été téléchargé avec succès.')
  }

  const handleImport = () => {
    setInfoModalData({
      title: 'Import de produits',
      message: 'Fonctionnalité d\'import\n\nSélectionnez un fichier CSV pour importer des produits.\n\nCette fonctionnalité sera implémentée dans la prochaine version.',
      type: 'info',
      icon: 'package'
    })
    setShowInfoModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600">Gérez votre inventaire de produits</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleImport}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importer</span>
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
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
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Liste des Produits</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stock} unités
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-500">Essayez de modifier vos filtres ou ajoutez un nouveau produit.</p>
        </div>
      )}

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleAddProduct}
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
    </div>
  )
} 
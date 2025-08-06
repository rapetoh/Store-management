'use client'

import { useState } from 'react'
import {
  Search, Filter, Plus, Eye, Edit, Trash2, Download, Upload
} from 'lucide-react'
import AddProductModal from './AddProductModal'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'
import EditProductModal from './EditProductModal'

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

const categories = ['Électronique', 'Accessoires', 'Bureau', 'Gaming', 'Stockage', 'Audio', 'Autres']
const suppliers = ['TechCorp', 'ErgoGear', 'ConnectAll', 'GameSound', 'DataVault', 'ViewTech', 'AudioMax']

const dummyProducts: Product[] = [
  {
    id: '1',
    name: 'Souris Sans Fil X2',
    sku: 'WMX2-001',
    category: 'Électronique',
    supplier: 'TechCorp',
    stock: 50,
    price: 25.00,
    status: 'En stock',
    description: 'Souris sans fil haute précision avec capteur optique avancé',
    alertLevel: 10
  },
  {
    id: '2',
    name: 'Clavier Ergonomique',
    sku: 'EK-005',
    category: 'Accessoires',
    supplier: 'ErgoGear',
    stock: 8,
    price: 75.00,
    status: 'Stock faible',
    description: 'Clavier ergonomique pour une frappe confortable',
    alertLevel: 15
  },
  {
    id: '3',
    name: 'Hub USB-C',
    sku: 'UCH-010',
    category: 'Électronique',
    supplier: 'ConnectAll',
    stock: 12,
    price: 30.00,
    status: 'Stock faible',
    description: 'Hub USB-C avec 4 ports et lecteur de carte',
    alertLevel: 10
  },
  {
    id: '4',
    name: 'Casque Gaming Pro',
    sku: 'GHP-003',
    category: 'Gaming',
    supplier: 'GameSound',
    stock: 3,
    price: 120.00,
    status: 'Stock critique',
    description: 'Casque gaming avec micro intégré et son surround',
    alertLevel: 5
  },
  {
    id: '5',
    name: 'SSD Portable 1TB',
    sku: 'SSD1TB-002',
    category: 'Stockage',
    supplier: 'DataVault',
    stock: 0,
    price: 99.00,
    status: 'Rupture',
    description: 'SSD portable haute vitesse 1TB',
    alertLevel: 10
  },
  {
    id: '6',
    name: 'Webcam HD',
    sku: 'WCHD-007',
    category: 'Électronique',
    supplier: 'TechCorp',
    stock: 5,
    price: 45.00,
    status: 'Stock critique',
    description: 'Webcam HD 1080p avec micro intégré',
    alertLevel: 8
  }
]

export default function Products() {
  const [products, setProducts] = useState<Product[]>(dummyProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Toutes les catégories')
  const [selectedStatus, setSelectedStatus] = useState('Tous les statuts')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
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
    setProducts(prev => [newProduct, ...prev])
    showToast('success', 'Produit ajouté', `Le produit "${newProduct.name}" a été ajouté avec succès !`)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
    setShowEditModal(false)
    setSelectedProduct(null)
    showToast('success', 'Produit modifié', `Le produit "${updatedProduct.name}" a été modifié avec succès !`)
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
      setShowDeleteModal(false)
    }
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setInfoModalData({
      title: 'Détails du produit',
      message: `Nom: ${product.name}\nSKU: ${product.sku}\nCatégorie: ${product.category}\nFournisseur: ${product.supplier}\nStock: ${product.stock} unités\nPrix: €${product.price.toFixed(2)}\nStatut: ${product.status}\nNiveau d'alerte: ${product.alertLevel} unités${product.description ? `\n\nDescription: ${product.description}` : ''}`,
      type: 'info',
      icon: 'package'
    })
    setShowInfoModal(true)
  }

  const handleExport = () => {
    const csvContent = [
      ['Nom', 'SKU', 'Catégorie', 'Fournisseur', 'Stock', 'Prix', 'Statut'],
      ...products.map(p => [p.name, p.sku, p.category, p.supplier, p.stock.toString(), p.price.toString(), p.status])
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
    setInfoModalData({
      title: 'Import de produits',
      message: 'Fonctionnalité d\'import\n\nSélectionnez un fichier CSV pour importer des produits.\n\nCette fonctionnalité sera implémentée dans la prochaine version.',
      type: 'info',
      icon: 'package'
    })
    setShowInfoModal(true)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Toutes les catégories' || product.category === selectedCategory
    const matchesStatus = selectedStatus === 'Tous les statuts' || product.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

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
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                      {product.status}
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
              ))}
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
    </div>
  )
} 
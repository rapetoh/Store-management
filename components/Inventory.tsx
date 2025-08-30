'use client'

import { useState, useEffect } from 'react'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  BarChart3,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  MapPin,
  Settings,
  Check,
  X
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku?: string
  barcode?: string
  stock: number
  minStock: number
  price: number
  costPrice: number
  category?: {
    id: string
    name: string
  }
  supplier?: {
    id: string
    name: string
  }
  lastInventoryDate?: string
  lastInventoryStatus?: 'OK' | 'ADJUSTED'
}

interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [notWorkedOnHours, setNotWorkedOnHours] = useState(24)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  
  // Movements tab state
  const [movements, setMovements] = useState<any[]>([])
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [movementSearchTerm, setMovementSearchTerm] = useState('')
  const [selectedMovementType, setSelectedMovementType] = useState('')
  const [selectedStartDate, setSelectedStartDate] = useState('')
  const [selectedEndDate, setSelectedEndDate] = useState('')
  const [selectedMovementReason, setSelectedMovementReason] = useState('')
  const [selectedFinancialImpact, setSelectedFinancialImpact] = useState('')

  // Replenishment tab state
  const [replenishments, setReplenishments] = useState<any[]>([])
  const [replenishmentsLoading, setReplenishmentsLoading] = useState(false)
  const [replenishmentSearchTerm, setReplenishmentSearchTerm] = useState('')
  const [selectedReplenishmentSupplier, setSelectedReplenishmentSupplier] = useState('')
  const [selectedReplenishmentStartDate, setSelectedReplenishmentStartDate] = useState('')
  const [selectedReplenishmentEndDate, setSelectedReplenishmentEndDate] = useState('')
  const [selectedReceiptNumber, setSelectedReceiptNumber] = useState('')
  const [showReplenishmentModal, setShowReplenishmentModal] = useState(false)
  const [replenishmentData, setReplenishmentData] = useState({
    productId: '',
    productName: '',
    supplierId: '',
    supplierName: '',
    quantity: 0,
    unitPrice: 0,
    deliveryCost: 0,
    receiptNumber: '',
    notes: ''
  })

  // Autocomplete states
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('')
  const [showProductSuggestions, setShowProductSuggestions] = useState(false)
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false)
  const [productSuggestions, setProductSuggestions] = useState<any[]>([])
  const [supplierSuggestions, setSupplierSuggestions] = useState<any[]>([])
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Barcode scanner hook
  const { scannedBarcode } = useBarcodeScanner()
  const [adjustmentData, setAdjustmentData] = useState({
    productId: '',
    productName: '',
    currentStock: 0,
    newStock: 0,
    reason: '',
    notes: ''
  })

  useEffect(() => {
    loadInventoryData()
  }, [searchTerm, selectedCategory, selectedSupplier, selectedStatus, notWorkedOnHours])

  useEffect(() => {
    if (activeTab === 'movements') {
      loadMovements()
    } else if (activeTab === 'replenishment') {
      loadReplenishments()
    }
  }, [activeTab, movementSearchTerm, selectedMovementType, selectedStartDate, selectedEndDate, selectedMovementReason, selectedFinancialImpact, replenishmentSearchTerm, selectedReplenishmentSupplier, selectedReplenishmentStartDate, selectedReplenishmentEndDate, selectedReceiptNumber])

  const loadInventoryData = async () => {
    try {
      setIsLoading(true)
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadSuppliers()
      ])
    } catch (error) {
      console.error('Error loading inventory data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (selectedSupplier) params.append('supplierId', selectedSupplier)
      if (selectedStatus) params.append('status', selectedStatus)
      params.append('notWorkedOnHours', notWorkedOnHours.toString())

      const response = await fetch(`/api/inventory/products?${params}`)
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      const categoriesData = data.categories || data || []
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    }
  }

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      const data = await response.json()
      setSuppliers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading suppliers:', error)
      setSuppliers([])
    }
  }

  const loadMovements = async () => {
    try {
      setMovementsLoading(true)
      const params = new URLSearchParams()
      if (movementSearchTerm) params.append('search', movementSearchTerm)
      if (selectedMovementType) params.append('type', selectedMovementType)
      if (selectedStartDate) params.append('startDate', selectedStartDate)
      if (selectedEndDate) params.append('endDate', selectedEndDate)
      if (selectedMovementReason) params.append('reason', selectedMovementReason)
      if (selectedFinancialImpact) params.append('financialImpact', selectedFinancialImpact)

      const response = await fetch(`/api/inventory/movements?${params}`)
      const data = await response.json()
      setMovements(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading movements:', error)
      setMovements([])
    } finally {
      setMovementsLoading(false)
    }
  }

  const loadReplenishments = async () => {
    try {
      setReplenishmentsLoading(true)
      const params = new URLSearchParams()
      if (replenishmentSearchTerm) params.append('search', replenishmentSearchTerm)
      if (selectedReplenishmentSupplier) params.append('supplierId', selectedReplenishmentSupplier)
      if (selectedReplenishmentStartDate) params.append('startDate', selectedReplenishmentStartDate)
      if (selectedReplenishmentEndDate) params.append('endDate', selectedReplenishmentEndDate)
      if (selectedReceiptNumber) params.append('receiptNumber', selectedReceiptNumber)

      const response = await fetch(`/api/inventory/replenishments?${params}`)
      const data = await response.json()
      setReplenishments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading replenishments:', error)
      setReplenishments([])
    } finally {
      setReplenishmentsLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const openAdjustmentModal = (product: Product) => {
    setAdjustmentData({
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      newStock: product.stock,
      reason: '',
      notes: ''
    })
    setShowAdjustmentModal(true)
  }

  const openReplenishmentModal = () => {
    setReplenishmentData({
      productId: '',
      productName: '',
      supplierId: '',
      supplierName: '',
      quantity: 0,
      unitPrice: 0,
      deliveryCost: 0,
      receiptNumber: '',
      notes: ''
    })
    setProductSearchTerm('')
    setSupplierSearchTerm('')
    setShowProductSuggestions(false)
    setShowSupplierSuggestions(false)
    setProductSuggestions([])
    setSupplierSuggestions([])
    setShowReplenishmentModal(true)
  }

  // Autocomplete functions
  const searchProducts = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setProductSuggestions([])
      setShowProductSuggestions(false)
      return
    }

    try {
      console.log('Searching products for:', searchTerm)
      const response = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}&limit=10`)
      const data = await response.json()
      console.log('Products API response:', data)
      const products = data.products || data || []
      setProductSuggestions(Array.isArray(products) ? products : [])
      setShowProductSuggestions(true)
    } catch (error) {
      console.error('Error searching products:', error)
      setProductSuggestions([])
    }
  }

  const handleProductSearchChange = (value: string) => {
    setProductSearchTerm(value)
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Set new timeout for search
    const timeout = setTimeout(() => {
      searchProducts(value)
    }, 300) // 300ms delay
    
    setSearchTimeout(timeout)
  }

  const searchSuppliers = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSupplierSuggestions([])
      setShowSupplierSuggestions(false)
      return
    }

    try {
      const response = await fetch(`/api/suppliers?search=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      const suppliers = Array.isArray(data) ? data : []
      setSupplierSuggestions(suppliers)
      setShowSupplierSuggestions(true)
    } catch (error) {
      console.error('Error searching suppliers:', error)
      setSupplierSuggestions([])
    }
  }

  const selectProduct = (product: any) => {
    setReplenishmentData({
      ...replenishmentData,
      productId: product.id,
      productName: product.name
    })
    setProductSearchTerm(product.name)
    setShowProductSuggestions(false)
  }

  const selectSupplier = (supplier: any) => {
    setReplenishmentData({
      ...replenishmentData,
      supplierId: supplier.id,
      supplierName: supplier.name
    })
    setSupplierSearchTerm(supplier.name)
    setShowSupplierSuggestions(false)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.autocomplete-container')) {
        setShowProductSuggestions(false)
        setShowSupplierSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // Handle barcode scanner input
  useEffect(() => {
    if (scannedBarcode && showReplenishmentModal) {
      // Search for product by barcode
      searchProductsByBarcode(scannedBarcode)
    }
  }, [scannedBarcode, showReplenishmentModal])

  const searchProductsByBarcode = async (barcode: string) => {
    try {
      const response = await fetch(`/api/products?barcode=${encodeURIComponent(barcode)}`)
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        const product = data[0]
        selectProduct(product)
      } else {
        // If no product found, set the barcode as search term
        setProductSearchTerm(barcode)
        searchProducts(barcode)
      }
    } catch (error) {
      console.error('Error searching product by barcode:', error)
    }
  }

  const handleReplenishment = async () => {
    try {
      const response = await fetch('/api/inventory/replenishments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: replenishmentData.productId,
          supplierId: replenishmentData.supplierId || undefined,
          quantity: replenishmentData.quantity,
          unitPrice: replenishmentData.unitPrice,
          deliveryCost: replenishmentData.deliveryCost,
          receiptNumber: replenishmentData.receiptNumber,
          notes: replenishmentData.notes
        }),
      })

      if (response.ok) {
        showToast('success', 'Ravitaillement créé', 'Le ravitaillement a été enregistré avec succès')
        setShowReplenishmentModal(false)
        loadReplenishments() // Refresh the list
        loadProducts() // Refresh product stock
      } else {
        showToast('error', 'Erreur', 'Impossible de créer le ravitaillement')
      }
    } catch (error) {
      console.error('Error creating replenishment:', error)
      showToast('error', 'Erreur', 'Une erreur est survenue')
    }
  }

  const handleMarkAsOK = async (productId: string) => {
    try {
      const response = await fetch('/api/inventory/mark-ok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        showToast('success', 'Produit marqué comme OK', 'Le produit a été marqué comme inventorié avec succès')
        loadProducts() // Refresh the list
      } else {
        showToast('error', 'Erreur', 'Impossible de marquer le produit comme OK')
      }
    } catch (error) {
      console.error('Error marking product as OK:', error)
      showToast('error', 'Erreur', 'Une erreur est survenue')
    }
  }

  const handleAdjustment = async () => {
    try {
      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: adjustmentData.productId,
          newStock: adjustmentData.newStock,
          reason: adjustmentData.reason,
          notes: adjustmentData.notes
        }),
      })

      if (response.ok) {
        showToast('success', 'Stock ajusté', 'Le stock a été ajusté avec succès')
        setShowAdjustmentModal(false)
        loadProducts() // Refresh the list
      } else {
        showToast('error', 'Erreur', 'Impossible d\'ajuster le stock')
      }
    } catch (error) {
      console.error('Error adjusting stock:', error)
      showToast('error', 'Erreur', 'Une erreur est survenue')
    }
  }

  const getInventoryStatus = (product: Product) => {
    if (!product.lastInventoryDate) {
      return { text: 'Non inventorié', color: 'bg-red-100 text-red-800' }
    }

    const lastInventory = new Date(product.lastInventoryDate)
    const hoursSinceInventory = (Date.now() - lastInventory.getTime()) / (1000 * 60 * 60)

    if (hoursSinceInventory <= notWorkedOnHours) {
      return { 
        text: product.lastInventoryStatus === 'OK' ? 'OK' : 'Ajusté', 
        color: product.lastInventoryStatus === 'OK' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800' 
      }
    } else {
      return { text: 'À réinventorier', color: 'bg-yellow-100 text-yellow-800' }
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.stock <= 0) {
      return { text: 'Rupture', color: 'bg-red-100 text-red-800' }
    } else if (product.stock <= product.minStock) {
      return { text: 'Stock faible', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { text: 'En stock', color: 'bg-green-100 text-green-800' }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateStockValue = (product: Product) => {
    return product.stock * product.costPrice
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventaire</h1>
          <p className="text-gray-600">Gestion complète de votre inventaire et des mouvements de stock</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres</span>
          </button>
          <button 
            onClick={() => {/* TODO: Export functionality */}}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
          <button 
            onClick={() => {/* TODO: New operation */}}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle opération</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'movements', name: 'Mouvements', icon: TrendingUp },
            { id: 'replenishment', name: 'Ravitaillement', icon: Truck },
            { id: 'counts', name: 'Inventaires', icon: CheckCircle },
            { id: 'alerts', name: 'Alertes', icon: AlertTriangle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Liste des produits - Inventaire physique</h3>
          </div>
          
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Supplier Filter */}
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les fournisseurs</option>
                {Array.isArray(suppliers) && suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="not_worked_on">Non travaillé</option>
                <option value="worked_on">Travaillé</option>
                <option value="ok">Marqué OK</option>
                <option value="adjusted">Ajusté</option>
              </select>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setSelectedSupplier('')
                  setSelectedStatus('')
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Effacer les filtres
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRODUIT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STOCK SYSTÈME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STOCK MINIMUM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VALEUR STOCK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DERNIÈRE INVENTAIRE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Chargement...
                    </td>
                  </tr>
                ) : (Array.isArray(products) && products.length === 0) ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : (Array.isArray(products) && products.map((product) => {
                  const inventoryStatus = getInventoryStatus(product)
                  const stockStatus = getStockStatus(product)
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Package className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.sku || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.minStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateStockValue(product).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(product.lastInventoryDate)}</div>
                        <div className="text-sm text-gray-500">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${inventoryStatus.color}`}>
                            {inventoryStatus.text}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleMarkAsOK(product.id)}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                          >
                            <Check className="w-4 h-4" />
                            <span>OK</span>
                          </button>
                          <button
                            onClick={() => openAdjustmentModal(product)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span>Ajuster</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movements Tab Content */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Mouvements de stock</h3>
            <p className="text-sm text-gray-600">Historique des entrées, sorties et ajustements de stock</p>
          </div>
          
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {/* Product Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={movementSearchTerm}
                  onChange={(e) => setMovementSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Movement Type Filter */}
              <select 
                value={selectedMovementType}
                onChange={(e) => setSelectedMovementType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="vente">Ventes</option>
                <option value="ravitaillement">Ravitaillement/Achat</option>
                <option value="ajustement">Ajustement/Inventaire</option>
              </select>

              {/* Reason Filter */}
              <input
                type="text"
                placeholder="Filtrer par raison..."
                value={selectedMovementReason}
                onChange={(e) => setSelectedMovementReason(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Financial Impact Filter */}
              <select 
                value={selectedFinancialImpact}
                onChange={(e) => setSelectedFinancialImpact(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les impacts</option>
                <option value="positive">Impact positif</option>
                <option value="negative">Impact négatif</option>
              </select>

              {/* Start Date */}
              <input
                type="date"
                value={selectedStartDate}
                onChange={(e) => setSelectedStartDate(e.target.value)}
                placeholder="Date de début"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />

              {/* End Date */}
              <input
                type="date"
                value={selectedEndDate}
                onChange={(e) => setSelectedEndDate(e.target.value)}
                placeholder="Date de fin"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Clear Filters */}
              <button 
                onClick={() => {
                  setMovementSearchTerm('')
                  setSelectedMovementType('')
                  setSelectedStartDate('')
                  setSelectedEndDate('')
                  setSelectedMovementReason('')
                  setSelectedFinancialImpact('')
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Effacer les filtres
              </button>
            </div>
          </div>

          {/* Movements Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRODUIT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TYPE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QUANTITÉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IMPACT FINANCIER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RAISON
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UTILISATEUR
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movementsLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Chargement...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Aucun mouvement trouvé
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(movement.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{movement.product?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{movement.product?.sku || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           movement.type === 'vente' ? 'bg-red-100 text-red-800' :
                           movement.type === 'ajustement' ? 'bg-blue-100 text-blue-800' :
                           movement.type === 'ravitaillement' ? 'bg-green-100 text-green-800' :
                           'bg-gray-100 text-gray-800'
                         }`}>
                           {movement.type === 'vente' ? 'Ventes' :
                            movement.type === 'ajustement' ? 'Ajustement/Inventaire' :
                            movement.type === 'ravitaillement' ? 'Ravitaillement/Achat' : movement.type}
                         </span>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={movement.financialImpact > 0 ? 'text-green-600' : movement.financialImpact < 0 ? 'text-red-600' : 'text-gray-600'}>
                          {movement.financialImpact > 0 ? '+' : ''}{movement.financialImpact?.toLocaleString('fr-FR') || '0'} FCFA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.reason || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.userId || 'Système'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Replenishment Tab Content */}
      {activeTab === 'replenishment' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ravitaillements et Achats</h3>
                <p className="text-sm text-gray-600">Historique des achats et ravitaillements de stock</p>
              </div>
              <button
                onClick={openReplenishmentModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Ravitaillement</span>
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={replenishmentSearchTerm}
                  onChange={(e) => setReplenishmentSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Supplier Filter */}
              <select 
                value={selectedReplenishmentSupplier}
                onChange={(e) => setSelectedReplenishmentSupplier(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les fournisseurs</option>
                {Array.isArray(suppliers) && suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>

              {/* Receipt Number Filter */}
              <input
                type="text"
                placeholder="Numéro de reçu..."
                value={selectedReceiptNumber}
                onChange={(e) => setSelectedReceiptNumber(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Start Date */}
              <input
                type="date"
                value={selectedReplenishmentStartDate}
                onChange={(e) => setSelectedReplenishmentStartDate(e.target.value)}
                placeholder="Date de début"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />

              {/* End Date */}
              <input
                type="date"
                value={selectedReplenishmentEndDate}
                onChange={(e) => setSelectedReplenishmentEndDate(e.target.value)}
                placeholder="Date de fin"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Clear Filters */}
              <button 
                onClick={() => {
                  setReplenishmentSearchTerm('')
                  setSelectedReplenishmentSupplier('')
                  setSelectedReplenishmentStartDate('')
                  setSelectedReplenishmentEndDate('')
                  setSelectedReceiptNumber('')
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Effacer les filtres
              </button>
            </div>
          </div>

          {/* Replenishments Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRODUIT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FOURNISSEUR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QUANTITÉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRIX UNITAIRE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FRAIS DE LIVRAISON
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRIX TOTAL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° REÇU
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {replenishmentsLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Chargement...
                    </td>
                  </tr>
                ) : replenishments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Aucun ravitaillement trouvé
                    </td>
                  </tr>
                ) : (
                  replenishments.map((replenishment) => (
                    <tr key={replenishment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(replenishment.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{replenishment.product?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{replenishment.product?.sku || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {replenishment.supplier?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {replenishment.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {replenishment.unitPrice.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {replenishment.deliveryCost.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {replenishment.totalPrice.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {replenishment.receiptNumber || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Other tabs content */}
      {activeTab !== 'overview' && activeTab !== 'movements' && activeTab !== 'replenishment' && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Contenu pour l'onglet {activeTab} - À implémenter</p>
        </div>
      )}

      {/* Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ajuster le stock</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Produit</label>
                  <p className="text-sm text-gray-900">{adjustmentData.productName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock actuel</label>
                  <p className="text-sm text-gray-900">{adjustmentData.currentStock}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nouveau stock</label>
                  <input
                    type="number"
                    value={adjustmentData.newStock}
                    onChange={(e) => setAdjustmentData({...adjustmentData, newStock: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Raison *</label>
                  <input
                    type="text"
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                    placeholder="Raison de l'ajustement"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={adjustmentData.notes}
                    onChange={(e) => setAdjustmentData({...adjustmentData, notes: e.target.value})}
                    placeholder="Notes supplémentaires"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAdjustment}
                  disabled={!adjustmentData.reason}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajuster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replenishment Modal */}
      {showReplenishmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[85vh] overflow-y-auto my-auto">
            <div className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nouveau Ravitaillement</h3>
                <div className="space-y-4">
                  {/* Product Selection */}
                  <div className="relative autocomplete-container">
                    <label className="block text-sm font-medium text-gray-700">Produit *</label>
                    <input
                      type="text"
                      value={productSearchTerm}
                      onChange={(e) => handleProductSearchChange(e.target.value)}
                      placeholder="Rechercher un produit par nom, SKU ou code-barres... (ou scanner)"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {showProductSuggestions && productSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {productSuggestions.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => selectProduct(product)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku || 'N/A'} | Stock: {product.stock} | Prix: {product.price?.toLocaleString('fr-FR')} FCFA
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {replenishmentData.productId && (
                      <div className="mt-1 text-sm text-green-600">
                        ✓ Produit sélectionné: {replenishmentData.productName}
                      </div>
                    )}
                  </div>

                  {/* Supplier Selection */}
                  <div className="relative autocomplete-container">
                    <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
                    <input
                      type="text"
                      value={supplierSearchTerm}
                      onChange={(e) => {
                        setSupplierSearchTerm(e.target.value)
                        searchSuppliers(e.target.value)
                      }}
                      placeholder="Rechercher un fournisseur par nom..."
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {showSupplierSuggestions && supplierSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {supplierSuggestions.map((supplier) => (
                          <div
                            key={supplier.id}
                            onClick={() => selectSupplier(supplier)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{supplier.name}</div>
                            {supplier.email && (
                              <div className="text-sm text-gray-500">{supplier.email}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {replenishmentData.supplierId && (
                      <div className="mt-1 text-sm text-green-600">
                        ✓ Fournisseur sélectionné: {replenishmentData.supplierName}
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantité *</label>
                    <input
                      type="number"
                      value={replenishmentData.quantity}
                      onChange={(e) => setReplenishmentData({...replenishmentData, quantity: parseInt(e.target.value) || 0})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prix unitaire (FCFA) *</label>
                    <input
                      type="number"
                      value={replenishmentData.unitPrice}
                      onChange={(e) => setReplenishmentData({...replenishmentData, unitPrice: parseFloat(e.target.value) || 0})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Delivery Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frais de livraison (FCFA)</label>
                    <input
                      type="number"
                      value={replenishmentData.deliveryCost}
                      onChange={(e) => setReplenishmentData({...replenishmentData, deliveryCost: parseFloat(e.target.value) || 0})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Receipt Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Numéro de reçu</label>
                    <input
                      type="text"
                      value={replenishmentData.receiptNumber}
                      onChange={(e) => setReplenishmentData({...replenishmentData, receiptNumber: e.target.value})}
                      placeholder="Numéro de reçu ou facture"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={replenishmentData.notes}
                      onChange={(e) => setReplenishmentData({...replenishmentData, notes: e.target.value})}
                      placeholder="Notes supplémentaires"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Total Price Display */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm font-medium text-gray-700">
                      Prix total: {(replenishmentData.quantity * replenishmentData.unitPrice + replenishmentData.deliveryCost).toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowReplenishmentModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleReplenishment}
                    disabled={!replenishmentData.productId || !replenishmentData.quantity || !replenishmentData.unitPrice}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Créer le ravitaillement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres d'inventaire</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Heures pour considérer un produit comme "travaillé"
                  </label>
                  <input
                    type="number"
                    value={notWorkedOnHours}
                    onChange={(e) => setNotWorkedOnHours(parseInt(e.target.value) || 24)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Un produit est considéré comme "travaillé" s'il a été inventorié dans les dernières {notWorkedOnHours} heures
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
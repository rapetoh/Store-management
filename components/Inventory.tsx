'use client'

import { useState, useEffect } from 'react'
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
  MapPin
} from 'lucide-react'

interface StockMovement {
  id: string
  productId: string
  productName: string
  type: 'in' | 'out' | 'adjustment' | 'transfer'
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  date: string
  userId: string
  userName: string
}

interface PurchaseOrder {
  id: string
  supplierId: string
  supplierName: string
  status: 'draft' | 'ordered' | 'shipped' | 'received' | 'cancelled'
  orderDate: string
  expectedDelivery: string
  totalAmount: number
  items: PurchaseOrderItem[]
}

interface PurchaseOrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface InventoryCount {
  id: string
  productId: string
  productName: string
  expectedQuantity: number
  actualQuantity: number
  difference: number
  date: string
  status: 'pending' | 'completed'
}

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [inventoryCounts, setInventoryCounts] = useState<InventoryCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    loadInventoryData()
  }, [])

  const loadInventoryData = async () => {
    try {
      setIsLoading(true)
      // Load stock movements, purchase orders, and inventory counts
      // This will be implemented with actual API calls
      await Promise.all([
        loadStockMovements(),
        loadPurchaseOrders(),
        loadInventoryCounts()
      ])
    } catch (error) {
      console.error('Error loading inventory data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStockMovements = async () => {
    // TODO: Implement API call to load stock movements
    const mockMovements: StockMovement[] = [
      {
        id: '1',
        productId: '1',
        productName: 'Chargeur USB',
        type: 'in',
        quantity: 50,
        previousStock: 15,
        newStock: 65,
        reason: 'Ravitaillement',
        date: '2025-08-24T10:00:00Z',
        userId: '1',
        userName: 'Admin'
      },
      {
        id: '2',
        productId: '2',
        productName: 'Eau minérale 1L',
        type: 'out',
        quantity: 10,
        previousStock: 97,
        newStock: 87,
        reason: 'Vente',
        date: '2025-08-24T09:30:00Z',
        userId: '1',
        userName: 'Admin'
      }
    ]
    setStockMovements(mockMovements)
  }

  const loadPurchaseOrders = async () => {
    // TODO: Implement API call to load purchase orders
    const mockOrders: PurchaseOrder[] = [
      {
        id: '1',
        supplierId: '1',
        supplierName: 'Togo SARL',
        status: 'ordered',
        orderDate: '2025-08-20T10:00:00Z',
        expectedDelivery: '2025-08-25T10:00:00Z',
        totalAmount: 1500000,
        items: [
          {
            productId: '1',
            productName: 'Chargeur USB',
            quantity: 100,
            unitPrice: 120000,
            totalPrice: 12000000
          }
        ]
      }
    ]
    setPurchaseOrders(mockOrders)
  }

  const loadInventoryCounts = async () => {
    // TODO: Implement API call to load inventory counts
    const mockCounts: InventoryCount[] = [
      {
        id: '1',
        productId: '1',
        productName: 'Chargeur USB',
        expectedQuantity: 65,
        actualQuantity: 63,
        difference: -2,
        date: '2025-08-24T08:00:00Z',
        status: 'completed'
      }
    ]
    setInventoryCounts(mockCounts)
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'ordered': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-yellow-100 text-yellow-800'
      case 'received': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'out': return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'adjustment': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'transfer': return <Truck className="w-4 h-4 text-blue-600" />
      default: return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement de l'inventaire...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventaire</h1>
          <p className="text-gray-600">Gestion complète de votre inventaire et des mouvements de stock</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nouvelle opération</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
                     {[
             { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
             { id: 'movements', label: 'Mouvements', icon: TrendingUp },
             { id: 'purchase-orders', label: 'Ravitaillement', icon: Truck },
             { id: 'counts', label: 'Inventaires', icon: CheckCircle },
             { id: 'alerts', label: 'Alertes', icon: AlertTriangle },
             { id: 'logs', label: 'Logs', icon: BarChart3 }
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
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Vue d'ensemble de l'inventaire</h3>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Produits en stock</p>
                    <p className="text-2xl font-bold text-blue-900">1,234</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Valeur totale</p>
                    <p className="text-2xl font-bold text-green-900">45,678,900 FCFA</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Stock faible</p>
                    <p className="text-2xl font-bold text-yellow-900">12</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Commandes en cours</p>
                    <p className="text-2xl font-bold text-purple-900">5</p>
                  </div>
                  <Truck className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Activité récente</h4>
              <div className="space-y-3">
                {stockMovements.slice(0, 5).map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getMovementIcon(movement.type)}
                      <div>
                        <p className="font-medium text-gray-900">{movement.productName}</p>
                        <p className="text-sm text-gray-600">{movement.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(movement.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Movements Tab */}
        {activeTab === 'movements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Mouvements de stock</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les types</option>
                  <option value="in">Entrées</option>
                  <option value="out">Sorties</option>
                  <option value="adjustment">Ajustements</option>
                  <option value="transfer">Transferts</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock final
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raison
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{movement.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getMovementIcon(movement.type)}
                          <span className="text-sm text-gray-900 capitalize">{movement.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.newStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(movement.date).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === 'purchase-orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Commandes fournisseurs</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nouvelle commande</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchaseOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{order.supplierName}</h4>
                      <p className="text-sm text-gray-600">Commande #{order.id}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date de commande:</span>
                      <span className="text-gray-900">{new Date(order.orderDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Livraison prévue:</span>
                      <span className="text-gray-900">{new Date(order.expectedDelivery).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Montant total:</span>
                      <span className="font-medium text-gray-900">{order.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Articles:</h5>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.productName}</span>
                          <span className="text-gray-900">{item.quantity} × {item.unitPrice.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Counts Tab */}
        {activeTab === 'counts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Inventaires physiques</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nouvel inventaire</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité attendue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité réelle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Différence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryCounts.map((count) => (
                    <tr key={count.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{count.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {count.expectedQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {count.actualQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          count.difference === 0 ? 'text-green-600' : 
                          count.difference > 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {count.difference > 0 ? '+' : ''}{count.difference}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          count.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {count.status === 'completed' ? 'Terminé' : 'En cours'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(count.date).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Alertes d'inventaire</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Low Stock Alerts */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h4 className="text-lg font-medium text-red-900">Stock faible</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Produit pas cher</p>
                      <p className="text-sm text-gray-600">Stock: 3 (Min: 15)</p>
                    </div>
                    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
                      Commander
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Coussin tesla</p>
                      <p className="text-sm text-gray-600">Stock: 2 (Min: 2)</p>
                    </div>
                    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
                      Commander
                    </button>
                  </div>
                </div>
              </div>

              {/* Expiring Products */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <h4 className="text-lg font-medium text-yellow-900">Produits expirant</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Pain de mie</p>
                      <p className="text-sm text-gray-600">Expire dans 2 jours</p>
                    </div>
                    <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700">
                      Voir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
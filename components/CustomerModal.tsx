'use client'

import { useState } from 'react'
import { X, User, Search, Plus, Edit, Trash2, Star, Gift, CreditCard, History, Phone, Mail, MapPin, Calendar } from 'lucide-react'

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerSelected: (customer: any) => void
  type: 'search' | 'create' | 'edit' | 'view'
  customerId?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  loyaltyCard: string
  loyaltyPoints: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  totalSpent: number
  visitCount: number
  lastVisit: string
  registrationDate: string
  notes: string
  isActive: boolean
}

interface PurchaseHistory {
  id: string
  date: string
  total: number
  items: number
  paymentMethod: string
  cashier: string
}

export default function CustomerModal({ isOpen, onClose, onCustomerSelected, type, customerId }: CustomerModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerData, setCustomerData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    loyaltyCard: '',
    notes: '',
    loyaltyTier: 'bronze'
  })
  const [isProcessing, setIsProcessing] = useState(false)

  // Base de données des clients
  const customers: Customer[] = [
    {
      id: '1',
      name: 'Marie Dupont',
      email: 'marie.dupont@email.com',
      phone: '06 12 34 56 78',
      address: '123 Rue de la Paix, 75001 Paris',
      loyaltyCard: 'LOY001',
      loyaltyPoints: 1250,
      loyaltyTier: 'gold',
      totalSpent: 2450.75,
      visitCount: 45,
      lastVisit: '2024-01-15',
      registrationDate: '2022-03-10',
      notes: 'Client fidèle, préfère les produits bio',
      isActive: true
    },
    {
      id: '2',
      name: 'Jean Martin',
      email: 'jean.martin@email.com',
      phone: '06 98 76 54 32',
      address: '456 Avenue des Champs, 75008 Paris',
      loyaltyCard: 'LOY002',
      loyaltyPoints: 320,
      loyaltyTier: 'silver',
      totalSpent: 890.50,
      visitCount: 12,
      lastVisit: '2024-01-10',
      registrationDate: '2023-06-15',
      notes: 'Aime les promotions',
      isActive: true
    },
    {
      id: '3',
      name: 'Sophie Bernard',
      email: 'sophie.bernard@email.com',
      phone: '06 55 44 33 22',
      address: '789 Boulevard Saint-Germain, 75006 Paris',
      loyaltyCard: 'LOY003',
      loyaltyPoints: 50,
      loyaltyTier: 'bronze',
      totalSpent: 150.25,
      visitCount: 3,
      lastVisit: '2024-01-05',
      registrationDate: '2024-01-01',
      notes: 'Nouveau client',
      isActive: true
    },
    {
      id: '4',
      name: 'Pierre Dubois',
      email: 'pierre.dubois@email.com',
      phone: '06 11 22 33 44',
      address: '321 Rue de Rivoli, 75001 Paris',
      loyaltyCard: 'LOY004',
      loyaltyPoints: 2100,
      loyaltyTier: 'platinum',
      totalSpent: 5200.00,
      visitCount: 89,
      lastVisit: '2024-01-12',
      registrationDate: '2021-09-20',
      notes: 'Client VIP, commandes importantes',
      isActive: true
    }
  ]

  // Historique d'achats simulé
  const purchaseHistory: PurchaseHistory[] = [
    { id: 'SALE001', date: '2024-01-15', total: 125.50, items: 8, paymentMethod: 'Carte bancaire', cashier: 'Marie' },
    { id: 'SALE002', date: '2024-01-10', total: 89.75, items: 5, paymentMethod: 'Espèces', cashier: 'Jean' },
    { id: 'SALE003', date: '2024-01-05', total: 45.20, items: 3, paymentMethod: 'Carte bancaire', cashier: 'Sophie' },
    { id: 'SALE004', date: '2023-12-28', total: 210.00, items: 12, paymentMethod: 'Carte bancaire', cashier: 'Marie' },
    { id: 'SALE005', date: '2023-12-20', total: 67.30, items: 4, paymentMethod: 'Espèces', cashier: 'Jean' }
  ]

  const loyaltyTiers = [
    { id: 'bronze', name: 'Bronze', minPoints: 0, discount: 0, color: 'text-amber-600' },
    { id: 'silver', name: 'Argent', minPoints: 500, discount: 5, color: 'text-gray-600' },
    { id: 'gold', name: 'Or', minPoints: 1000, discount: 10, color: 'text-yellow-600' },
    { id: 'platinum', name: 'Platine', minPoints: 2000, discount: 15, color: 'text-purple-600' }
  ]

  const getTitle = () => {
    switch (type) {
      case 'search': return 'Rechercher un client'
      case 'create': return 'Nouveau client'
      case 'edit': return 'Modifier le client'
      case 'view': return 'Détails du client'
      default: return 'Gestion des clients'
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'search': return 'Trouver un client existant'
      case 'create': return 'Créer un nouveau client'
      case 'edit': return 'Modifier les informations du client'
      case 'view': return 'Consulter les détails du client'
      default: return ''
    }
  }

  const getLoyaltyTierInfo = (tier: string) => {
    return loyaltyTiers.find(t => t.id === tier) || loyaltyTiers[0]
  }

  const getLoyaltyTierColor = (tier: string) => {
    const tierInfo = getLoyaltyTierInfo(tier)
    return tierInfo.color
  }

  const searchCustomers = (term: string) => {
    if (!term.trim()) return customers
    
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(term.toLowerCase()) ||
      customer.email.toLowerCase().includes(term.toLowerCase()) ||
      customer.phone.includes(term) ||
      customer.loyaltyCard.toLowerCase().includes(term.toLowerCase())
    )
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    if (type === 'search') {
      onCustomerSelected(customer)
      onClose()
    }
  }

  const handleCreateCustomer = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newCustomer: Customer = {
      id: `CUST${Date.now()}`,
      loyaltyCard: `LOY${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      loyaltyPoints: 0,
      totalSpent: 0,
      visitCount: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      registrationDate: new Date().toISOString().split('T')[0],
      isActive: true,
      ...customerData
    } as Customer

    showToast('success', 'Client créé', `Le client "${newCustomer.name}" a été créé avec succès`)
    onCustomerSelected(newCustomer)
    setIsProcessing(false)
    onClose()
  }

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return
    
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const updatedCustomer = { ...selectedCustomer, ...customerData }
    showToast('success', 'Client modifié', `Les informations de "${updatedCustomer.name}" ont été mises à jour`)
    onCustomerSelected(updatedCustomer)
    setIsProcessing(false)
    onClose()
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
              <p className="text-sm text-gray-600">{getDescription()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {type === 'search' && (
            <div className="space-y-6">
              {/* Search */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rechercher un client</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom, email, téléphone ou carte fidélité..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Customer List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Résultats</h3>
                <div className="space-y-3">
                  {searchCustomers(searchTerm).map(customer => (
                    <div
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{customer.name}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLoyaltyTierColor(customer.loyaltyTier)} bg-gray-100`}>
                              {getLoyaltyTierInfo(customer.loyaltyTier).name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{customer.email}</p>
                            <p>{customer.phone}</p>
                            <p>Carte: {customer.loyaltyCard}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{customer.loyaltyPoints} pts</span>
                          </div>
                          <p className="text-sm text-gray-600">{customer.totalSpent.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(type === 'create' || type === 'edit') && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    value={customerData.name || ''}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du client"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerData.email || ''}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@exemple.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={customerData.phone || ''}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="06 12 34 56 78"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de fidélité</label>
                  <select
                    value={customerData.loyaltyTier || 'bronze'}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, loyaltyTier: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {loyaltyTiers.map(tier => (
                      <option key={tier.id} value={tier.id}>{tier.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea
                  value={customerData.address || ''}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adresse complète"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={customerData.notes || ''}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notes sur le client..."
                />
              </div>
            </div>
          )}

          {type === 'view' && selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedCustomer.name}</h3>
                    <p className="text-gray-600">{selectedCustomer.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getLoyaltyTierColor(selectedCustomer.loyaltyTier)} bg-gray-100`}>
                      {getLoyaltyTierInfo(selectedCustomer.loyaltyTier).name}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.address}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Carte: {selectedCustomer.loyaltyCard}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{selectedCustomer.loyaltyPoints} points fidélité</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Client depuis {new Date(selectedCustomer.registrationDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Total dépensé</h4>
                  <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalSpent.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900">Visites</h4>
                  <p className="text-2xl font-bold text-green-600">{selectedCustomer.visitCount}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900">Dernière visite</h4>
                  <p className="text-lg font-bold text-purple-600">{new Date(selectedCustomer.lastVisit).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Purchase History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique d'achats</h3>
                <div className="space-y-2">
                  {purchaseHistory.map(purchase => (
                    <div key={purchase.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{purchase.id}</p>
                        <p className="text-sm text-gray-600">{purchase.date} • {purchase.items} articles</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{purchase.total.toLocaleString('fr-FR')} FCFA</p>
                        <p className="text-sm text-gray-600">{purchase.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            {(type === 'create' || type === 'edit') && (
              <button
                onClick={type === 'create' ? handleCreateCustomer : handleUpdateCustomer}
                disabled={isProcessing || !customerData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    {type === 'create' ? <Plus className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    <span>{type === 'create' ? 'Créer le client' : 'Modifier le client'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
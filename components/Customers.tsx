'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Filter,
  Users,
  Phone,
  Mail,
  MapPin,
  CreditCard
} from 'lucide-react'
import AddCustomerModal from './AddCustomerModal'
import EditCustomerModal from './EditCustomerModal'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  loyaltyCard?: string
  totalPurchases?: number
  lastPurchase?: string
  isActive: boolean
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('Tous les clients')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleAddCustomer = (newCustomer: Customer) => {
    loadCustomers()
    showToast('success', 'Client ajouté', `Le client "${newCustomer.name}" a été ajouté avec succès !`)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowEditModal(true)
  }

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    loadCustomers()
    setShowEditModal(false)
    setSelectedCustomer(null)
    showToast('success', 'Client modifié', `Le client "${updatedCustomer.name}" a été modifié avec succès !`)
  }

  const handleToggleCustomerStatus = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDeleteModal(true)
  }

  const confirmToggleStatus = async () => {
    if (selectedCustomer) {
      try {
        const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isActive: !selectedCustomer.isActive,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update customer status')
        }

        loadCustomers()
        const action = selectedCustomer.isActive ? 'désactivé' : 'activé'
        showToast('success', 'Statut modifié', `Le client "${selectedCustomer.name}" a été ${action} avec succès.`)
        setSelectedCustomer(null)
        setShowDeleteModal(false)
      } catch (error) {
        console.error('Error updating customer status:', error)
        showToast('error', 'Erreur', 'Erreur lors de la modification du statut du client')
      }
    }
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setInfoModalData({
      title: 'Détails du client',
      message: `Nom: ${customer.name}\nEmail: ${customer.email || 'N/A'}\nTéléphone: ${customer.phone || 'N/A'}\nAdresse: ${customer.address || 'N/A'}\nCarte de fidélité: ${customer.loyaltyCard || 'N/A'}\nTotal des achats: ${customer.totalPurchases || 0} FCFA\nDernier achat: ${customer.lastPurchase || 'Aucun'}`,
      type: 'info',
      icon: 'info'
    })
    setShowInfoModal(true)
  }

  const handleExport = () => {
    const csvContent = [
      ['Nom', 'Email', 'Téléphone', 'Adresse', 'Carte de fidélité', 'Total achats', 'Dernier achat'],
      ...customers.map(c => [
        c.name, 
        c.email || 'N/A', 
        c.phone || 'N/A', 
        c.address || 'N/A', 
        c.loyaltyCard || 'N/A',
        (c.totalPurchases || 0).toString(),
        c.lastPurchase || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'clients.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showToast('success', 'Export terminé', 'Le fichier CSV a été téléchargé avec succès.')
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (customer.phone && customer.phone.includes(searchTerm))
    const matchesStatus = selectedStatus === 'Tous les clients' || 
                         (selectedStatus === 'Clients actifs' && customer.isActive) ||
                         (selectedStatus === 'Clients inactifs' && !customer.isActive)
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Gérez votre base de clients</p>
        </div>
        <div className="flex space-x-3">
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
            <span>Ajouter un client</span>
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
                placeholder="Rechercher des clients..."
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

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tous les clients">Tous les clients</option>
                <option value="Clients actifs">Clients actifs</option>
                <option value="Clients inactifs">Clients inactifs</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Liste des clients ({filteredCustomers.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carte de fidélité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total achats
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Chargement des clients...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className={`hover:bg-gray-50 ${!customer.isActive ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${!customer.isActive ? 'text-gray-500' : 'text-gray-900'}`}>{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${!customer.isActive ? 'text-gray-500' : 'text-gray-900'}`}>
                        {customer.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${!customer.isActive ? 'text-gray-500' : 'text-gray-900'}`}>{customer.loyaltyCard || 'N/A'}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${!customer.isActive ? 'text-gray-500' : 'text-gray-900'}`}>
                                              {(customer.totalPurchases || 0).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleCustomerStatus(customer)}
                          className={customer.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                          title={customer.isActive ? "Désactiver" : "Activer"}
                        >
                          {customer.isActive ? (
                            <Trash2 className="w-4 h-4" />
                          ) : (
                            <Users className="w-4 h-4" />
                          )}
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
      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCustomerAdded={handleAddCustomer}
      />

      <EditCustomerModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onCustomerUpdated={handleUpdateCustomer}
        customer={selectedCustomer}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmToggleStatus}
        title={selectedCustomer?.isActive ? "Désactiver le client" : "Activer le client"}
        message={selectedCustomer?.isActive 
          ? `Êtes-vous sûr de vouloir désactiver le client "${selectedCustomer?.name}" ? Il ne sera plus visible dans les ventes mais restera dans l'historique.`
          : `Êtes-vous sûr de vouloir réactiver le client "${selectedCustomer?.name}" ?`
        }
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
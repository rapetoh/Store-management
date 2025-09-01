'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Minus, Trash2, Search, DollarSign, User, Receipt, Save, CreditCard } from 'lucide-react'
import ReceiptModal from './ReceiptModal'
import PromoCodeModal from './PromoCodeModal'
import { useCompanyInfo } from '@/hooks/useCompanyInfo'

interface SaleItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  totalPrice: number
}

interface Sale {
  id: string
  customerId?: string
  customer?: string
  totalAmount?: number
  discountAmount?: number
  taxAmount?: number
  finalAmount?: number
  paymentMethod: string
  paymentStatus?: string
  saleDate?: string
  notes?: string
  items?: SaleItem[]
  total?: number
  date?: string
  time?: string
  status?: string
  cashier?: string
}

interface EditSaleModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
  onSaleUpdated: () => void
}

export default function EditSaleModal({ isOpen, onClose, sale, onSaleUpdated }: EditSaleModalProps) {
  const { companyInfo } = useCompanyInfo()
  
  // Cart state
  const [cart, setCart] = useState<SaleItem[]>([])
  
  // Customer state
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([])
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  
  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    loyaltyCard: ''
  })
  
  // Promo code state
  const [showPromoCodeModal, setShowPromoCodeModal] = useState(false)
  const [appliedPromoCode, setAppliedPromoCode] = useState<any>(null)
  
  // Product search state
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)

  const paymentMethods = [
    { id: 'cash', name: 'Espèces', isActive: true },
    { id: 'card', name: 'Carte bancaire', isActive: true },
    { id: 'check', name: 'Chèque', isActive: true },
    { id: 'transferTmoney', name: 'Transfert Tmoney', isActive: true },
    { id: 'transferFlooz', name: 'Transfert Flooz', isActive: true }
  ]

  // Initialize with existing sale data
  useEffect(() => {
    if (sale && isOpen) {
      // Always fetch fresh data when modal opens
      const fetchFreshSaleData = async () => {
        try {
          const response = await fetch(`/api/sales/${sale.id}`)
          if (response.ok) {
            const freshSale = await response.json()
            
            // Initialize cart with fresh items
            if (freshSale.items && Array.isArray(freshSale.items)) {
              setCart([...freshSale.items])
            }
            
            // Initialize customer info
            if (freshSale.customer) {
              setCustomerForm({
                name: freshSale.customer,
                email: '',
                phone: '',
                loyaltyCard: ''
              })
              setSelectedCustomer({ name: freshSale.customer })
            }
            
            // Initialize payment method
            setPaymentMethod(freshSale.paymentMethod || 'cash')
          }
        } catch (error) {
          console.error('Error fetching fresh sale data:', error)
          // Fallback to original sale data if fetch fails
          if (sale.items && Array.isArray(sale.items)) {
            setCart([...sale.items])
          }
          if (sale.customer) {
            setCustomerForm({
              name: sale.customer,
              email: '',
              phone: '',
              loyaltyCard: ''
            })
            setSelectedCustomer({ name: sale.customer })
          }
          setPaymentMethod(sale.paymentMethod || 'cash')
        }
      }
      
      fetchFreshSaleData()
    }
  }, [sale, isOpen])

  // Product search function
  const searchProducts = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearchingProducts(true)
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Error searching products:', error)
      setSearchResults([])
    } finally {
      setIsSearchingProducts(false)
    }
  }

  // Add product to cart
  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id)
    
    if (existingItem) {
      // Update quantity if product already exists
      setCart(prev => prev.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice * (1 - item.discount / 100) }
          : item
      ))
    } else {
      // Add new product to cart
      const newItem: SaleItem = {
        id: `temp-${Date.now()}`, // Temporary ID
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
        totalPrice: product.price
      }
      setCart(prev => [...prev, newItem])
    }
    
    // Clear search
    setSearchTerm('')
    setSearchResults([])
  }

  const searchCustomers = async (query: string) => {
    if (query.length < 2) return
    
    console.log('Searching customers for:', query)
    setIsSearchingCustomers(true)
    try {
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`)
      console.log('Customer search response status:', response.status)
      if (response.ok) {
        const customers = await response.json()
        console.log('Found customers:', customers)
        setCustomerSearchResults(customers)
        setShowCustomerSearch(customers.length > 0)
      } else {
        console.error('Customer search failed:', response.status)
      }
    } catch (error) {
      console.error('Error searching customers:', error)
      setCustomerSearchResults([])
    } finally {
      setIsSearchingCustomers(false)
    }
  }

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setCustomerForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      loyaltyCard: customer.loyaltyCard || ''
    })
    setShowCustomerSearch(false)
    setCustomerSearchTerm('')
  }

  // Handle product search input change
  const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    if (value.length >= 2) {
      searchProducts(value)
    } else {
      setSearchResults([])
    }
  }

  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomerSearchTerm(value)
    
    if (value.length >= 2) {
      searchCustomers(value)
    } else {
      setShowCustomerSearch(false)
      setCustomerSearchResults([])
    }
  }

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    
    setCart(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice * (1 - item.discount / 100) }
        : item
    ))
  }

  const updateItemPrice = (itemId: string, newPrice: number) => {
    if (newPrice < 0) return
    
    setCart(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, unitPrice: newPrice, totalPrice: item.quantity * newPrice * (1 - item.discount / 100) }
        : item
    ))
  }

  const updateItemDiscount = (itemId: string, newDiscount: number) => {
    if (newDiscount < 0 || newDiscount > 100) return
    
    setCart(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, discount: newDiscount, totalPrice: item.quantity * item.unitPrice * (1 - newDiscount / 100) }
        : item
    ))
  }

  const removeItem = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId))
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0)
  }

  const calculateTax = () => {
    // Assuming 18% tax rate (you can make this configurable)
    return calculateSubtotal() * 0.18
  }

  const calculateTotal = () => {
    let total = calculateSubtotal() + calculateTax()
    
    // Apply promo code discount if available
    if (appliedPromoCode) {
      if (appliedPromoCode.type === 'percentage') {
        total = total * (1 - appliedPromoCode.value / 100)
      } else {
        total = total - appliedPromoCode.value
      }
    }
    
    return Math.max(0, total) // Ensure total doesn't go below 0
  }

  const getPromoCodeDiscount = () => {
    if (!appliedPromoCode) return 0
    
    if (appliedPromoCode.type === 'percentage') {
      return (calculateSubtotal() + calculateTax()) * (appliedPromoCode.value / 100)
    } else {
      return appliedPromoCode.value
    }
  }

    const handleSaveChanges = async () => {
    if (!sale) return
    
    setIsLoading(true)
    setError('')
    
    try {
      // Calculate new totals
      const newSubtotal = calculateSubtotal()
      const newTax = calculateTax()
      const newTotal = calculateTotal()
      
      const saveData = {
        items: cart,
        totalAmount: newSubtotal,
        taxAmount: newTax,
        finalAmount: newTotal,
        paymentMethod: paymentMethod,
        notes: (sale.notes || '') + `\n\n[VENTE MODIFIÉE - ${new Date().toLocaleString('fr-FR')}]\nNouveau total: ${newTotal.toLocaleString('fr-FR')} FCFA\nArticles modifiés: ${cart.length}${appliedPromoCode ? `\nCode promo appliqué: ${appliedPromoCode.code} (${appliedPromoCode.type === 'percentage' ? `${appliedPromoCode.value}%` : `${appliedPromoCode.value.toLocaleString('fr-FR')} FCFA`})` : ''}`
      }
      
      console.log('Saving sale with data:', saveData)
      
      // Update the sale with new items and totals
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      })

      console.log('Save response status:', response.status)
      if (response.ok) {
        const updatedSale = await response.json()
        console.log('Sale updated successfully:', updatedSale)
        // Call the callback to refresh the sales list
        onSaleUpdated()
        
        // Show receipt immediately (don't close the modal yet)
        setShowReceipt(true)
      } else {
        const errorData = await response.json()
        console.error('Save failed:', errorData)
        setError(errorData.error || 'Erreur lors de la sauvegarde des modifications')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !sale) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Modifier la vente</h2>
                <p className="text-sm text-gray-600">Modification de la vente existante</p>
              </div>
            </div>
                         <div className="flex items-center space-x-3">
               <button
                 onClick={onClose}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>
             </div>
          </div>

                     <div className="flex h-[calc(90vh-120px)] overflow-hidden">
             {/* Left Panel - Products and Cart */}
             <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
              {/* Product Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, SKU ou code-barres..."
                    value={searchTerm}
                    onChange={handleProductSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Product Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {product.price.toLocaleString('fr-FR')} FCFA • {product.stock} en stock
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-blue-600" />
                      </button>
                    ))}
                  </div>
                )}
                
                {searchTerm && searchResults.length === 0 && !isSearchingProducts && (
                  <div className="mt-4 text-center text-gray-500">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Aucun produit trouvé</p>
                    <p className="text-sm">Essayez d'autres termes de recherche</p>
                  </div>
                )}
                
                {isSearchingProducts && (
                  <div className="mt-4 text-center text-gray-500">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p>Recherche en cours...</p>
                  </div>
                )}
              </div>

              {/* Cart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Panier</h3>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Votre panier est vide</p>
                    <p className="text-sm">Ajoutez des produits pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                            
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                    className="p-1 rounded border hover:bg-gray-50"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                    min="0"
                                  />
                                  <button
                                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                    className="p-1 rounded border hover:bg-gray-50"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (FCFA)</label>
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                  className="w-24 px-2 py-1 border border-gray-300 rounded text-center"
                                  min="0"
                                  step="100"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remise (%)</label>
                                <input
                                  type="number"
                                  value={item.discount}
                                  onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                  min="0"
                                  max="100"
                                  step="1"
                                />
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-600">
                              Prix total: {item.totalPrice.toLocaleString('fr-FR')} FCFA
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

                         {/* Right Panel - Customer and Payment */}
             <div className="w-96 p-6 bg-gray-50 overflow-y-auto">
              {/* Customer Search */}
              <div className="mb-6 relative">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rechercher un client</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, téléph"
                    value={customerSearchTerm}
                    onChange={handleCustomerSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Customer Search Results */}
                {showCustomerSearch && customerSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {customerSearchResults.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{customer.name}</div>
                        {customer.phone && <div className="text-sm text-gray-600">{customer.phone}</div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations client</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                    <input
                      type="text"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom complet"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemple.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+22890123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carte de fidélité</label>
                    <input
                      type="text"
                      value={customerForm.loyaltyCard}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, loyaltyCard: e.target.value }))}
                      placeholder="LOY001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

                             {/* Promo Codes */}
               <div className="mb-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Codes promo</h3>
                 {appliedPromoCode ? (
                   <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm font-medium text-green-800">{appliedPromoCode.code}</p>
                         <p className="text-xs text-green-600">
                           {appliedPromoCode.type === 'percentage' 
                             ? `${appliedPromoCode.value}% de remise` 
                             : `${appliedPromoCode.value.toLocaleString('fr-FR')} FCFA de remise`}
                         </p>
                       </div>
                       <button
                         onClick={() => setAppliedPromoCode(null)}
                         className="text-green-600 hover:text-green-800"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 ) : (
                   <button
                     onClick={() => setShowPromoCodeModal(true)}
                     className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                   >
                     + Ajouter un code promo
                   </button>
                 )}
               </div>

                             {/* Payment Methods */}
               <div className="mb-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Mode de paiement</h3>
                 <div className="grid grid-cols-3 gap-2">
                   {paymentMethods.map((method) => (
                     <button
                       key={method.id}
                       onClick={() => setPaymentMethod(method.id)}
                       className={`p-2 border rounded-md transition-colors ${
                         paymentMethod === method.id
                           ? 'border-blue-500 bg-blue-50 text-blue-700'
                           : 'border-gray-300 hover:border-gray-400'
                       }`}
                     >
                       <div className="flex items-center space-x-1">
                         <CreditCard className="w-3 h-3" />
                         <span className="text-xs font-medium">{method.name}</span>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

              {/* Summary */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Résumé</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total:</span>
                    <span className="font-medium">{calculateSubtotal().toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA (18%):</span>
                    <span className="font-medium">{calculateTax().toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  {appliedPromoCode && (
                    <div className="flex justify-between text-green-600">
                      <span>Remise promo:</span>
                      <span>-{getPromoCodeDiscount().toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total final:</span>
                      <span className="text-lg font-semibold">{calculateTotal().toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSaveChanges}
                  disabled={isLoading || cart.length === 0}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Sauvegarder et imprimer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Code Modal */}
      {showPromoCodeModal && (
        <PromoCodeModal
          isOpen={showPromoCodeModal}
          onClose={() => setShowPromoCodeModal(false)}
          onPromoCodeSelected={(promoCode) => {
            setAppliedPromoCode(promoCode)
            setShowPromoCodeModal(false)
          }}
          currentAmount={calculateSubtotal()}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false)
            // Close both the receipt and the edit modal
            onClose()
          }}
          sale={{
            ...sale,
            items: cart,
            total: calculateTotal(),
            finalAmount: calculateTotal(),
            paymentMethod: paymentMethod,
            customer: customerForm.name
          }}
        />
      )}
    </>
  )
}

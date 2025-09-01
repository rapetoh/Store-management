'use client'

import { useState, useEffect } from 'react'
import { X, Search, Plus, Minus, Receipt, Printer, Barcode, Percent, User, Mail, Phone, CreditCard, Trash2 } from 'lucide-react'
import DiscountModal from './DiscountModal'
import CashRegisterWarningModal from './CashRegisterWarningModal'
import PromoCodeModal from './PromoCodeModal'
import { useBarcodeScanner } from '../hooks/useBarcodeScanner'
import { useCompanyInfo } from '../hooks/useCompanyInfo'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  barcode?: string
  sku?: string
  category?: {
    name: string
  }
  taxRate?: {
    id: string
    name: string
    rate: number
  }
}

interface CartItem {
  id: string
  name: string
  originalPrice: number
  quantity: number
  discount: number
  total: number
  stock: number
  taxRate?: {
    id: string
    name: string
    rate: number
  }
}

interface CustomerInfo {
  name: string
  email: string
  phone: string
  loyaltyCard: string
}

interface PromoCode {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount: number
  maxUses: number
  usedCount: number
  validUntil: Date
  description: string
  isActive: boolean
}

interface DiscountRule {
  id: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  minQuantity: number
  maxQuantity: number
  isActive: boolean
}

interface PaymentMethod {
  id: string
  name: string
  isActive: boolean
}

interface QuickSaleModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuickSaleModal({ isOpen, onClose }: QuickSaleModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    loyaltyCard: ''
  })
  const [appliedPromos, setAppliedPromos] = useState<PromoCode[]>([])
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountRule | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showCashRegisterWarning, setShowCashRegisterWarning] = useState(false)
  const [defaultTaxRate, setDefaultTaxRate] = useState<{ rate: number } | null>(null)
  
  // Company information
  const { companyInfo } = useCompanyInfo()
  

  
  // Customer search states
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([])
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
  
  // Promo code modal state
  const [showPromoCodeModal, setShowPromoCodeModal] = useState(false)
  


  // Barcode scanner hook
  const { barcodeBuffer, isScanning, clearBuffer } = useBarcodeScanner({
    onBarcodeDetected: (barcode) => {
      console.log('Barcode detected:', barcode)
      setSearchTerm(barcode)
      // Automatically search for the product with this barcode
      handleBarcodeSearch(barcode)
    },
    minLength: 8,
    maxLength: 20,
    timeout: 150
  })

  // Customer search function
  const searchCustomers = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setCustomerSearchResults([])
      setShowCustomerSearch(false)
      return
    }

    setIsSearchingCustomers(true)
    try {
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const customers = await response.json()
        setCustomerSearchResults(customers)
        setShowCustomerSearch(customers.length > 0)
      }
    } catch (error) {
      console.error('Error searching customers:', error)
      setCustomerSearchResults([])
    } finally {
      setIsSearchingCustomers(false)
    }
  }

  // Handle customer selection
  const selectCustomer = (customer: any) => {
    setCustomerInfo({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      loyaltyCard: customer.loyaltyCard || ''
    })
    setCustomerSearchTerm(customer.name || '')
    setShowCustomerSearch(false)
    setCustomerSearchResults([])
  }

  // Handle customer search input change
  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomerSearchTerm(value)
    
    // Clear customer info if search is cleared
    if (!value.trim()) {
      setCustomerInfo({ name: '', email: '', phone: '', loyaltyCard: '' })
      setShowCustomerSearch(false)
      setCustomerSearchResults([])
      return
    }
    
    // Search customers as user types
    searchCustomers(value)
  }

  // Load products and default tax rate on component mount
  useEffect(() => {
    if (isOpen) {
      loadProducts()
      loadDefaultTaxRate()
    }
  }, [isOpen])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadDefaultTaxRate = async () => {
    try {
      const response = await fetch('/api/tax-rates')
      if (response.ok) {
        const taxRates = await response.json()
        const defaultRate = taxRates.find((rate: any) => rate.isDefault)
        setDefaultTaxRate(defaultRate || { rate: 18 }) // Fallback to 18% for Togo
      }
    } catch (error) {
      console.error('Error loading default tax rate:', error)
      setDefaultTaxRate({ rate: 18 }) // Fallback to 18% for Togo
    }
  }



  const getProductTaxRate = (product: Product) => {
    return product.taxRate?.rate || defaultTaxRate?.rate || 18
  }

  const getCartItemTaxRate = (item: CartItem) => {
    return item.taxRate?.rate || defaultTaxRate?.rate || 18
  }

  const calculateTaxAmount = () => {
    let totalTax = 0
    cart.forEach(item => {
      const taxableAmount = (item.total - item.discount * item.quantity)
      const taxRate = getCartItemTaxRate(item)
      totalTax += (taxableAmount * taxRate) / 100
    })
    return totalTax
  }

  // Product search states
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchPagination, setSearchPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Search products with pagination
  const searchProducts = async (page = 1) => {
    if (!debouncedSearchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: searchPagination.limit.toString(),
        search: debouncedSearchTerm,
        isActive: 'true' // Only search active products
      })

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.products)
        setSearchPagination(data.pagination)
      } else {
        throw new Error('Failed to search products')
      }
    } catch (error) {
      console.error('Error searching products:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Search products when debounced term changes
  useEffect(() => {
    searchProducts(1)
  }, [debouncedSearchTerm])

  // Load more search results
  const loadMoreSearchResults = () => {
    if (searchPagination.hasNextPage) {
      searchProducts(searchPagination.page + 1)
    }
  }

  // Handle barcode search - automatically add product to cart if found
  const handleBarcodeSearch = async (barcode: string) => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        search: barcode,
        isActive: 'true'
      })

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        const products = data.products
        
        // Look for exact barcode match
        const exactMatch = products.find((product: Product) => 
          product.barcode === barcode
        )
        
        if (exactMatch) {
          // Automatically add to cart
          addToCart(exactMatch)
          showToast('success', 'Produit ajouté', `${exactMatch.name} ajouté au panier`)
          setSearchTerm('')
          clearBuffer()
        } else {
          // Show search results for partial matches
          setSearchResults(products)
          setSearchPagination(data.pagination)
          showToast('info', 'Recherche', `Aucun produit exact trouvé pour le code ${barcode}`)
        }
      }
    } catch (error) {
      console.error('Error searching by barcode:', error)
      showToast('error', 'Erreur', 'Erreur lors de la recherche par code-barres')
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(prev => prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.originalPrice }
            : item
        ))
      }
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        originalPrice: product.price,
        quantity: 1,
        discount: 0,
        total: product.price,
        stock: product.stock,
        taxRate: product.taxRate
      }
      setCart(prev => [...prev, newItem])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const item = cart.find(item => item.id === productId)
    if (item && newQuantity <= item.stock) {
      setCart(prev => prev.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.originalPrice }
          : item
      ))
    }
  }

  const updateDiscount = (productId: string, discount: number) => {
    const item = cart.find(item => item.id === productId)
    if (item) {
      const maxDiscount = item.originalPrice * 0.5 // Max 50% discount
      const clampedDiscount = Math.min(Math.max(discount, 0), maxDiscount)
      
      setCart(prev => prev.map(item =>
        item.id === productId
          ? { ...item, discount: clampedDiscount, total: item.quantity * (item.originalPrice - clampedDiscount) }
          : item
      ))
    }
  }

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  const getPromoDiscount = () => {
    let totalDiscount = 0
    appliedPromos.forEach(promo => {
      if (promo.type === 'percentage') {
        totalDiscount += (getSubtotal() * promo.value) / 100
      } else {
        totalDiscount += promo.value
      }
    })
    return totalDiscount
  }

  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0
    
    if (appliedDiscount.type === 'percentage') {
      return (getSubtotal() * appliedDiscount.value) / 100
    } else {
      return appliedDiscount.value
    }
  }

  const getTotal = () => {
    const subtotal = getSubtotal()
    const promoDiscount = getPromoDiscount()
    const discountAmount = getDiscountAmount()
    const taxAmount = calculateTaxAmount()
    
    return subtotal - promoDiscount - discountAmount + taxAmount
  }

  const handlePromoCode = async (code: string) => {
    try {
      const response = await fetch(`/api/promocodes/validate?code=${code}`)
      if (response.ok) {
        const promo = await response.json()
        
        if (promo) {
          const subtotal = getSubtotal()
          if (subtotal >= promo.minAmount) {
            setAppliedPromos(prev => [...prev, promo])
            showToast('success', 'Code promo appliqué', `Code ${promo.code} appliqué avec succès`)
          } else {
            showToast('error', 'Montant insuffisant', `Montant minimum requis: ${promo.minAmount.toLocaleString('fr-FR')} FCFA`)
          }
        } else {
          showToast('error', 'Code invalide', 'Code promo invalide ou expiré')
        }
      }
    } catch (error) {
      console.error('Error applying promo code:', error)
      showToast('error', 'Erreur', 'Impossible d\'appliquer le code promo')
    }
  }

  const handleDiscountApplied = (discount: DiscountRule) => {
    setAppliedDiscount(discount)
    setShowDiscountModal(false)
    showToast('success', 'Remise appliquée', `Remise ${discount.name} appliquée`)
  }

  const removePromo = (promoId: string) => {
    setAppliedPromos(prev => prev.filter(promo => promo.id !== promoId))
    showToast('info', 'Code promo supprimé', 'Code promo retiré du panier')
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
    showToast('info', 'Remise supprimée', 'La remise a été supprimée du panier')
  }
  


  const handleOpenCashRegister = async (initialAmount: number, cashierName: string) => {
    try {
      const response = await fetch('/api/cash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'open',
          openingAmount: initialAmount,
          cashierName: cashierName,
        }),
      })

      if (response.ok) {
        setShowCashRegisterWarning(false)
        showToast('success', 'Caisse ouverte', `Caisse ouverte avec ${initialAmount.toLocaleString('fr-FR')} FCFA`)
        // Don't continue with sale automatically - let user add products first
      } else {
        throw new Error('Failed to open cash register')
      }
    } catch (error) {
      console.error('Error opening cash register:', error)
      showToast('error', 'Erreur', 'Impossible d\'ouvrir la caisse')
    }
  }

  const handleContinueWithoutRegister = () => {
    setShowCashRegisterWarning(false)
    // Continue with the sale without cash register
    handleCompleteSale()
  }

  const checkCashRegisterStatus = async () => {
    try {
      const cashSessionResponse = await fetch('/api/cash')
      const cashData = await cashSessionResponse.json()
      
      if (!cashData.currentSession) {
        setShowCashRegisterWarning(true)
      }
    } catch (error) {
      console.error('Error checking cash register status:', error)
    }
  }

  const handlePaymentMethodChange = (methodId: string) => {
    setSelectedPaymentMethod(methodId)
    
    // Check cash register if switching to cash payment
    if (methodId === 'cash') {
      checkCashRegisterStatus()
    }
  }

  const printReceipt = async () => {
    setIsPrinting(true)
    
    // Generate receipt content
    const receiptContent = `
=================================
${companyInfo.name || 'StockFlow'} - RECU DE VENTE
=================================
Date: ${new Date().toLocaleDateString('fr-FR')}
Heure: ${new Date().toLocaleTimeString('fr-FR')}
Vente: SALE${Date.now()}
Caissier: Caissier actuel
=================================
${cart.map(item => `
${item.name}
${item.quantity} x ${item.originalPrice.toLocaleString('fr-FR')} FCFA = ${(item.quantity * item.originalPrice).toLocaleString('fr-FR')} FCFA
${item.discount > 0 ? `Remise: -${(item.discount * item.quantity).toLocaleString('fr-FR')} FCFA` : ''}
`).join('')}
=================================
Sous-total: ${getSubtotal().toLocaleString('fr-FR')} FCFA
${appliedPromos.length > 0 ? `Remise promo: -${getPromoDiscount().toLocaleString('fr-FR')} FCFA` : ''}
${appliedDiscount ? `Remise: -${getDiscountAmount().toLocaleString('fr-FR')} FCFA` : ''}
TVA: ${calculateTaxAmount().toLocaleString('fr-FR')} FCFA
TOTAL: ${getTotal().toLocaleString('fr-FR')} FCFA
=================================
Méthode de paiement: ${paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
=================================
Merci de votre visite !
=================================
    `

    // Simuler l'impression
    console.log('Impression du reçu:', receiptContent)
    
    setIsPrinting(false)
    showToast('success', 'Reçu imprimé', 'Le reçu a été imprimé avec succès')
  }

  const handleCompleteSale = async () => {
    if (cart.length === 0) return

    setIsProcessing(true)
    
    try {
      // Handle customer creation/linking
      let customerId = null
      
      if (customerInfo.name || customerInfo.phone || customerInfo.email) {
        // Try to find existing customer by phone or loyalty card
        if (customerInfo.phone || customerInfo.loyaltyCard) {
          const searchParams = new URLSearchParams()
          if (customerInfo.phone) searchParams.append('phone', customerInfo.phone)
          if (customerInfo.loyaltyCard) searchParams.append('loyaltyCard', customerInfo.loyaltyCard)
          
          const existingCustomer = await fetch(`/api/customers/search?${searchParams.toString()}`)
          if (existingCustomer.ok) {
            const customer = await existingCustomer.json()
            if (customer) {
              customerId = customer.id
            }
          }
        }
        
        // If no existing customer found, create a new one
        if (!customerId) {
          const customerResponse = await fetch('/api/customers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: customerInfo.name || 'Client en magasin',
              email: customerInfo.email || undefined,
              phone: customerInfo.phone || undefined,
              loyaltyCard: customerInfo.loyaltyCard || undefined,
            }),
          })
          
          if (customerResponse.ok) {
            const newCustomer = await customerResponse.json()
            customerId = newCustomer.id
          }
        }
      }

      // Prepare sale data for database
      const saleData = {
        customerId: customerId,
        totalAmount: getSubtotal(),
        discountAmount: getPromoDiscount() + getDiscountAmount(),
        taxAmount: calculateTaxAmount(),
        finalAmount: getTotal(),
        paymentMethod: selectedPaymentMethod,
        notes: customerInfo.name ? `Client: ${customerInfo.name}` : undefined,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.originalPrice,
          discount: item.discount,
          totalPrice: item.total,
        })),
      }

      // Save sale to database
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      })

      if (!response.ok) {
        throw new Error('Failed to save sale')
      }

      const sale = await response.json()
      
      // Update product stock
      for (const item of cart) {
        await fetch(`/api/products/${item.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stock: item.stock - item.quantity
          }),
        })
      }

      // Clear cart and reset form
      setCart([])
      setCustomerInfo({ name: '', email: '', phone: '', loyaltyCard: '' })
      setAppliedPromos([])
      setAppliedDiscount(null)
      setSearchTerm('')
      
      showToast('success', 'Vente terminée', `Vente ${sale.id} enregistrée avec succès`)
      
      // Print receipt
      printReceipt()
      
      // Close modal
      onClose()
      
    } catch (error) {
      console.error('Error completing sale:', error)
      showToast('error', 'Erreur', 'Impossible de finaliser la vente')
    } finally {
      setIsProcessing(false)
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }


  // Payment methods - customize these as you like
  const paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Espèces', isActive: true },
    { id: 'card', name: 'Carte bancaire', isActive: true },
    { id: 'check', name: 'Chèque', isActive: true },
    { id: 'transferTmoney', name: 'Transfert Tmoney', isActive: true },
    { id: 'transferFlooz', name: 'Transfert Flooz', isActive: true }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Nouvelle vente</h2>
              <p className="text-sm text-gray-600">Vente rapide en magasin</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
              className={`p-2 rounded-lg transition-colors ${
                showBarcodeScanner ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="Scanner codes-barres"
            >
              <Barcode className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side - Product search and cart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Barcode Scanner */}
              {showBarcodeScanner && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Barcode className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Scanner codes-barres</span>
                    {isScanning && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">Scanning...</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-blue-700">
                    Scannez un produit ou tapez le code-barres au clavier
                  </div>
                  {barcodeBuffer && (
                    <div className="mt-2 text-xs text-blue-600">
                      Code en cours: {barcodeBuffer}
                    </div>
                  )}
                </div>
              )}

              {/* Product Search */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, SKU ou code-barres..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                        <span className="text-sm text-gray-500">{product.stock} en stock</span>
                      </div>
                      <p className="text-lg font-bold text-green-600 mb-2">
                        {product.price.toLocaleString('fr-FR')} FCFA
                      </p>
                      {product.category && (
                        <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
                      )}
                      {product.taxRate && (
                        <p className="text-xs text-blue-600">TVA: {product.taxRate.name}</p>
                      )}
                      {product.barcode && (
                        <p className="text-xs text-gray-400">Code: {product.barcode}</p>
                      )}
                    </div>
                  ))}
                  {isSearching && (
                    <div className="col-span-full text-center py-4">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm text-gray-600">Recherche en cours...</p>
                    </div>
                  )}
                  {searchResults.length === 0 && !isSearching && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucun produit trouvé</p>
                      <p className="text-sm">Essayez d'autres termes de recherche</p>
                    </div>
                  )}
                </div>
                {searchPagination.totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={loadMoreSearchResults}
                      disabled={!searchPagination.hasNextPage || isSearching}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? 'Chargement...' : 'Charger plus'}
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Panier</h3>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Votre panier est vide</p>
                    <p className="text-sm">Ajoutez des produits pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.originalPrice.toLocaleString('fr-FR')} FCFA x {item.quantity}
                          </p>
                          {item.taxRate && (
                            <p className="text-xs text-blue-600">TVA: {item.taxRate.name}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {item.total.toLocaleString('fr-FR')} FCFA
                            </p>
                            {item.discount > 0 && (
                              <p className="text-sm text-green-600">
                                -{item.discount.toLocaleString('fr-FR')} FCFA
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Customer info and payment */}
            <div className="space-y-6">
              {/* Customer Search */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Rechercher un client</h3>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={customerSearchTerm}
                      onChange={handleCustomerSearchChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Rechercher par nom, téléphone ou carte de fidélité..."
                    />
                  </div>
                  
                  {/* Customer search results dropdown */}
                  {showCustomerSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {isSearchingCustomers ? (
                        <div className="px-4 py-2 text-sm text-gray-500">Recherche en cours...</div>
                      ) : customerSearchResults.length > 0 ? (
                        customerSearchResults.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => selectCustomer(customer)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-600">
                              {customer.phone && `${customer.phone} • `}
                              {customer.loyaltyCard && `Carte: ${customer.loyaltyCard}`}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">Aucun client trouvé</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informations client</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom complet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@exemple.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+22890123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carte de fidélité</label>
                    <input
                      type="text"
                      value={customerInfo.loyaltyCard}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, loyaltyCard: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="LOY001"
                    />
                  </div>
                </div>
              </div>

              {/* Promo Codes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Codes promo</h3>
                <div className="space-y-3">
                  {appliedPromos.map((promo) => (
                    <div key={promo.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">{promo.code}</p>
                        <p className="text-sm text-green-600">{promo.description}</p>
                      </div>
                      <button
                        onClick={() => removePromo(promo.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowPromoCodeModal(true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    + Ajouter un code promo
                  </button>
                </div>
              </div>

              {/* Discounts */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Remises</h3>
                <div className="space-y-3">
                  {appliedDiscount && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div>
                        <p className="font-medium text-purple-800">{appliedDiscount.name}</p>
                        <p className="text-sm text-purple-600">
                          {appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}%` : `${appliedDiscount.value.toLocaleString('fr-FR')} FCFA`}
                        </p>
                      </div>
                      <button
                        onClick={removeDiscount}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setShowDiscountModal(true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Gérer les remises
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Mode de paiement</h3>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodChange(method.id)}
                      className={`p-2 border rounded-md transition-colors ${
                        selectedPaymentMethod === method.id
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

              {/* Total */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Total</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total:</span>
                    <span className="font-medium">{getSubtotal().toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  {appliedPromos.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Remise promo:
                      </span>
                      <span className="font-medium text-green-600">
                        -{getPromoDiscount().toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  )}
                  {appliedDiscount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remise:</span>
                      <span className="font-medium text-purple-600">
                        -{getDiscountAmount().toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA:</span>
                    <span className="font-medium">{calculateTaxAmount().toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total TTC:</span>
                      <span className="text-lg font-bold text-green-600">{getTotal().toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                onClick={handleCompleteSale}
                disabled={cart.length === 0 || isProcessing}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    <span>Finaliser la vente</span>
                  </>
                )}
              </button>

              {/* Print Receipt Button */}
              {cart.length > 0 && (
                <button
                  onClick={printReceipt}
                  disabled={isPrinting}
                  className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isPrinting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Impression...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      <span>Imprimer reçu</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Discount Modal */}
        <DiscountModal
          isOpen={showDiscountModal}
          onClose={() => setShowDiscountModal(false)}
          onDiscountApplied={handleDiscountApplied}
          cartItems={cart}
          totalAmount={getSubtotal()}
        />

        {/* Promo Code Modal */}
        <PromoCodeModal
          isOpen={showPromoCodeModal}
          onClose={() => setShowPromoCodeModal(false)}
          onPromoCodeSelected={(promoCode) => {
            // Apply the selected promo code
            setAppliedPromos(prev => [...prev, promoCode])
            showToast('success', 'Code promo appliqué', `Code ${promoCode.code} appliqué avec succès`)
          }}
          currentAmount={getSubtotal()}
        />

        {/* Cash Register Warning Modal */}
        <CashRegisterWarningModal
          isOpen={showCashRegisterWarning}
          onClose={() => setShowCashRegisterWarning(false)}
          onOpenCashRegister={handleOpenCashRegister}
          onContinueWithoutRegister={handleContinueWithoutRegister}
        />
      </div>
    </div>
  )
} 
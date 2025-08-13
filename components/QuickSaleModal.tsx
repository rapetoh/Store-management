'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search, Plus, Minus, Trash2, CreditCard, DollarSign, Calculator, Receipt, Tag, Percent, Barcode, Printer, AlertTriangle, CheckCircle } from 'lucide-react'
import DiscountModal from './DiscountModal' // New import

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  total: number
  discount: number
  discountType: 'percentage' | 'fixed'
  originalPrice: number
}

interface PromoCode {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount: number
  maxUses: number
  usedCount: number
  validUntil: string
  description: string
}

interface QuickSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onSaleCompleted: (sale: any) => void
}

// Payment methods will be defined inside component

export default function QuickSaleModal({ isOpen, onClose, onSaleCompleted }: QuickSaleModalProps) {
  // Payment methods
  const paymentMethods = [
    { id: 'cash', name: 'Espèces', icon: DollarSign },
    { id: 'card', name: 'Carte bancaire', icon: CreditCard },
    { id: 'check', name: 'Chèque', icon: DollarSign },
    { id: 'mobile', name: 'Paiement mobile', icon: CreditCard }
  ]

  // Database state
  const [productsDatabase, setProductsDatabase] = useState<any[]>([])
  const [promoDatabase, setPromoDatabase] = useState<PromoCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromos, setAppliedPromos] = useState<PromoCode[]>([])
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [isPrinting, setIsPrinting] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    loyaltyCard: ''
  })
  const [showDiscountModal, setShowDiscountModal] = useState(false) // New state
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null) // New state

  // Customer search states
  const [customersDatabase, setCustomersDatabase] = useState<any[]>([])
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([])
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false)
  const [activeCustomerField, setActiveCustomerField] = useState<'name' | 'phone' | 'email' | 'loyaltyCard' | null>(null)
  const [promoSuggestions, setPromoSuggestions] = useState<any[]>([])
  const [showPromoSuggestions, setShowPromoSuggestions] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  // Load data from database when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData()
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }
  }, [isOpen])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Fetch products
      const productsResponse = await fetch('/api/products')
      const products = await productsResponse.json()
      setProductsDatabase(products)

      // Fetch promo codes
      const promosResponse = await fetch('/api/promocodes')
      const promos = await promosResponse.json()
      setPromoDatabase(promos)

      // Fetch customers
      const customersResponse = await fetch('/api/customers')
      const customers = await customersResponse.json()
      setCustomersDatabase(customers)
    } catch (error) {
      console.error('Error loading data:', error)
      showToast('error', 'Erreur', 'Impossible de charger les données')
    } finally {
      setIsLoading(false)
    }
  }

  // Gestion des touches clavier pour le scanner
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return

      // Si on tape dans un champ de saisie, ne pas traiter comme code-barres
      const activeElement = document.activeElement
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      )) {
        return
      }

      // Si c'est un chiffre ou lettre, ajouter au code-barres
      if (e.key.length === 1 && (e.key.match(/[0-9]/) || e.key.match(/[a-zA-Z]/))) {
        setBarcodeInput(prev => prev + e.key)
      }
      // Si c'est Enter, traiter le code-barres
      else if (e.key === 'Enter' && barcodeInput.length > 0) {
        handleBarcodeScan(barcodeInput)
        setBarcodeInput('')
      }
    }

    if (isOpen) {
      document.addEventListener('keypress', handleKeyPress)
    }

    return () => {
      document.removeEventListener('keypress', handleKeyPress)
    }
  }, [isOpen, barcodeInput])

  const handleBarcodeScan = (barcode: string) => {
    const product = productsDatabase.find(p => p.barcode === barcode)
    if (product) {
      addToCart(product)
      showToast('success', 'Produit scanné', `${product.name} ajouté au panier`)
    } else {
      showToast('error', 'Code-barres invalide', 'Produit non trouvé dans la base de données')
    }
  }

  const searchProducts = (term: string) => {
    if (term.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const filtered = productsDatabase.filter(product =>
      product.name.toLowerCase().includes(term.toLowerCase()) ||
      product.barcode.includes(term)
    ).slice(0, 5)

    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
  }

  const searchCustomers = (term: string, field: 'name' | 'phone' | 'email' | 'loyaltyCard') => {
    if (term.length < 2) {
      setCustomerSuggestions([])
      setShowCustomerSuggestions(false)
      return
    }

    const filtered = customersDatabase.filter(customer => {
      const searchValue = customer[field]?.toLowerCase() || ''
      return searchValue.includes(term.toLowerCase())
    }).slice(0, 5)

    setCustomerSuggestions(filtered)
    setShowCustomerSuggestions(filtered.length > 0)
  }

  const searchPromoCodes = (term: string) => {
    if (!term.trim()) return []

    const filtered = promoDatabase.filter(promo => {
      const searchValue = promo.code.toLowerCase()
      const descriptionValue = promo.description.toLowerCase()
      return searchValue.includes(term.toLowerCase()) || descriptionValue.includes(term.toLowerCase())
    })

    return filtered.slice(0, 5)
  }

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ))
    } else {
      setCart(prev => [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
        discount: 0,
        discountType: 'percentage',
        originalPrice: product.price
      }])
    }
    
    setSearchTerm('')
    setShowSuggestions(false)
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== itemId))
    } else {
      setCart(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      ))
    }
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId))
  }

  const selectCustomer = async (customer: any) => {
    setCustomerInfo({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      loyaltyCard: customer.loyaltyCard || ''
    })
    setShowCustomerSuggestions(false)
    setActiveCustomerField(null)
    
    // Apply LOYALTY5 promo code if customer has ANY loyalty card
    if (customer.loyaltyCard && customer.loyaltyCard.trim() !== '') {
      console.log('Applying loyalty code for customer:', customer.name, 'with loyalty card:', customer.loyaltyCard)
      console.log('Current subtotal:', getSubtotal())
      
      try {
        const response = await fetch('/api/promocodes?action=validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: 'LOYALTY5',
            amount: getSubtotal(),
          }),
        })

        const data = await response.json()
        console.log('Loyalty code validation response:', data)
        
              if (data.success) {
        // Check if loyalty code is already applied
        if (appliedPromos.some(promo => promo.code === 'LOYALTY5')) {
          setPromoError('La fidélité est déjà appliquée')
          return
        }
        
        setAppliedPromos(prev => [...prev, data.promoCode])
        setPromoSuccess(`Fidélité appliquée: ${data.promoCode.description}`)
        showToast('success', 'Fidélité appliquée', `Code fidélité appliqué pour ${customer.name} (${customer.loyaltyCard})`)
      } else {
          console.log('Loyalty code validation failed:', data.error)
          showToast('warning', 'Fidélité non disponible', data.error || 'Code fidélité non disponible ou invalide')
        }
      } catch (error) {
        console.error('Error applying loyalty code:', error)
        showToast('error', 'Erreur', 'Erreur lors de l\'application du code fidélité')
      }
    }
  }

  const applyDiscountToItem = (itemId: string, discount: number, type: 'percentage' | 'fixed') => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const discountAmount = type === 'percentage' ? (item.price * discount / 100) : discount
        const newPrice = Math.max(0, item.price - discountAmount)
        return {
          ...item,
          discount: discount,
          discountType: type,
          price: newPrice,
          total: newPrice * item.quantity
        }
      }
      return item
    }))
  }

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  const getPromoDiscount = () => {
    if (appliedPromos.length === 0) return 0
    
    const subtotal = getSubtotal()
    let totalDiscount = 0
    
    for (const promo of appliedPromos) {
      if (subtotal < promo.minAmount) continue
      
      if (promo.type === 'percentage') {
        totalDiscount += (subtotal * promo.value) / 100
      } else {
        totalDiscount += Math.min(promo.value, subtotal)
      }
    }
    
    return totalDiscount
  }

  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0
    
    const subtotal = getSubtotal()
    if (appliedDiscount.type === 'loyalty') {
      return (subtotal * appliedDiscount.percentage) / 100
    }
    
    return appliedDiscount.appliedAmount || 0
  }

  const getTotal = () => {
    const subtotal = getSubtotal()
    const promoDiscount = getPromoDiscount()
    const discountAmount = getDiscountAmount()
    const tax = (subtotal - promoDiscount - discountAmount) * 0.2
    return subtotal - promoDiscount - discountAmount + tax
  }

  const applyPromoCode = async () => {
    setPromoError('')
    setPromoSuccess('')

    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo')
      return
    }

    if (appliedPromos.length >= 2) {
      setPromoError('Maximum 2 codes promo autorisés par vente')
      return
    }

    // Check if promo code is already applied
    if (appliedPromos.some(promo => promo.code === promoCode.toUpperCase())) {
      setPromoError('Ce code promo est déjà appliqué')
      return
    }

    try {
      console.log('Applying promo code:', promoCode, 'Subtotal:', getSubtotal())
      
      const response = await fetch('/api/promocodes?action=validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode.toUpperCase(),
          amount: getSubtotal(),
        }),
      })

      const data = await response.json()
      console.log('Promo code validation response:', data)

      if (data.success) {
        setAppliedPromos(prev => [...prev, data.promoCode])
        setPromoSuccess(`Code promo appliqué: ${data.promoCode.description}`)
        setPromoCode('')
        setShowPromoSuggestions(false)
      } else {
        console.log('Promo code validation failed:', data.error)
        setPromoError(data.error || 'Code promo invalide')
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoError('Erreur lors de la validation du code promo')
    }
  }

  const removePromoCode = (codeToRemove?: string) => {
    if (codeToRemove) {
      setAppliedPromos(prev => prev.filter(promo => promo.code !== codeToRemove))
    } else {
      setAppliedPromos([])
    }
    setPromoSuccess('')
  }

  const printReceipt = async () => {
    setIsPrinting(true)
    
    // Simuler l'impression
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const receiptContent = `
      =================================
      STOCKFLOW - RECU DE VENTE
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
      TVA (20%): ${((getSubtotal() - getPromoDiscount() - getDiscountAmount()) * 0.2).toLocaleString('fr-FR')} FCFA
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
        taxAmount: (getSubtotal() - getPromoDiscount() - getDiscountAmount()) * 0.2,
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

      const savedSale = await response.json()
      
      const sale = {
        id: savedSale.id,
        customer: customerInfo.name || 'Client en magasin',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        total: getTotal(),
        subtotal: getSubtotal(),
        tax: (getSubtotal() - getPromoDiscount() - getDiscountAmount()) * 0.2,
        promoDiscount: getPromoDiscount(),
        discountAmount: getDiscountAmount(),
        items: cart.length,
        paymentMethod: paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'Carte bancaire',
        cashier: 'Caissier actuel',
        status: 'Payé',
        saleItems: cart,
        customerInfo: customerInfo,
        appliedPromos: appliedPromos,
        appliedDiscount: appliedDiscount
      }

      onSaleCompleted(sale)
      
      // Reload products to get updated stock
      await loadData()
      
      // Imprimer le reçu
      await printReceipt()
      
      // Reset form
      setCart([])
      setSearchTerm('')
      setSelectedPaymentMethod('cash')
      setPromoCode('')
      setAppliedPromos([])
      setCustomerInfo({ name: '', phone: '', email: '', loyaltyCard: '' })
      setIsProcessing(false)
      onClose()
      
      showToast('success', 'Vente terminée', 'La vente a été enregistrée avec succès')
    } catch (error) {
      console.error('Error completing sale:', error)
      showToast('error', 'Erreur', 'Impossible de finaliser la vente')
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setCart([])
    setSearchTerm('')
    setSelectedPaymentMethod('cash')
    setPromoCode('')
          setAppliedPromos([])
    setCustomerInfo({ name: '', phone: '', email: '', loyaltyCard: '' })
    onClose()
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleDiscountApplied = (discount: any) => {
    setAppliedDiscount(discount)
    showToast('success', 'Remise appliquée', `${discount.name} appliquée avec succès !`)
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
    showToast('info', 'Remise supprimée', 'La remise a été supprimée du panier')
  }

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
              onClick={handleClose}
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
                  </div>
                  <div className="text-sm text-blue-700">
                    Tapez le code-barres au clavier ou utilisez un scanner physique
                  </div>
                  {barcodeInput && (
                    <div className="mt-2 text-xs text-blue-600">
                      Code saisi: {barcodeInput}
                    </div>
                  )}
                </div>
              )}

              {/* Product Search */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Rechercher un produit
                  {isLoading && (
                    <span className="ml-2 text-sm text-gray-500">(Chargement...)</span>
                  )}
                </h3>
                <div className="relative max-w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      searchProducts(e.target.value)
                    }}
                    placeholder="Tapez le nom du produit ou code-barres..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Suggestions */}
                {showSuggestions && (
                  <div className="absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-start min-w-0">
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate">
                              {typeof product.category === 'object' ? product.category?.name : product.category} • Stock: {product.stock}
                            </div>
                            <div className="text-xs text-gray-400 truncate">Code: {product.barcode}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-medium text-gray-900 whitespace-nowrap">{product.price.toLocaleString('fr-FR')} FCFA</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Panier</h3>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calculator className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Ajoutez des produits au panier</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.originalPrice.toLocaleString('fr-FR')} FCFA l'unité
                            {item.discount > 0 && (
                              <span className="text-green-600 ml-2">
                                -{item.discount}{item.discountType === 'percentage' ? '%' : ' FCFA'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">{item.total.toLocaleString('fr-FR')} FCFA</div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations client</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => {
                        setCustomerInfo(prev => ({ ...prev, name: e.target.value }))
                        searchCustomers(e.target.value, 'name')
                        setActiveCustomerField('name')
                      }}
                      onFocus={() => {
                        if (customerInfo.name.length >= 2) {
                          searchCustomers(customerInfo.name, 'name')
                          setActiveCustomerField('name')
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom du client"
                    />
                    {/* Customer Suggestions for Name */}
                    {showCustomerSuggestions && customerSuggestions.length > 0 && activeCustomerField === 'name' && (
                      <div className="absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {customerSuggestions.map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => selectCustomer(customer)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex flex-col min-w-0">
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">
                                {customer.phone && `📞 ${customer.phone}`}
                                {customer.email && ` • 📧 ${customer.email}`}
                                {customer.loyaltyCard && ` • 🎫 ${customer.loyaltyCard}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => {
                        setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))
                        searchCustomers(e.target.value, 'phone')
                        setActiveCustomerField('phone')
                      }}
                      onFocus={() => {
                        if (customerInfo.phone.length >= 2) {
                          searchCustomers(customerInfo.phone, 'phone')
                          setActiveCustomerField('phone')
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Téléphone"
                    />
                    {/* Customer Suggestions for Phone */}
                    {showCustomerSuggestions && customerSuggestions.length > 0 && activeCustomerField === 'phone' && (
                      <div className="absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {customerSuggestions.map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => selectCustomer(customer)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex flex-col min-w-0">
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">
                                {customer.phone && `📞 ${customer.phone}`}
                                {customer.email && ` • 📧 ${customer.email}`}
                                {customer.loyaltyCard && ` • 🎫 ${customer.loyaltyCard}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => {
                        setCustomerInfo(prev => ({ ...prev, email: e.target.value }))
                        searchCustomers(e.target.value, 'email')
                        setActiveCustomerField('email')
                      }}
                      onFocus={() => {
                        if (customerInfo.email.length >= 2) {
                          searchCustomers(customerInfo.email, 'email')
                          setActiveCustomerField('email')
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email"
                    />
                    {/* Customer Suggestions for Email */}
                    {showCustomerSuggestions && customerSuggestions.length > 0 && activeCustomerField === 'email' && (
                      <div className="absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {customerSuggestions.map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => selectCustomer(customer)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex flex-col min-w-0">
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">
                                {customer.phone && `📞 ${customer.phone}`}
                                {customer.email && ` • 📧 ${customer.email}`}
                                {customer.loyaltyCard && ` • 🎫 ${customer.loyaltyCard}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carte fidélité</label>
                    <input
                      type="text"
                      value={customerInfo.loyaltyCard}
                      onChange={(e) => {
                        setCustomerInfo(prev => ({ ...prev, loyaltyCard: e.target.value }))
                        searchCustomers(e.target.value, 'loyaltyCard')
                        setActiveCustomerField('loyaltyCard')
                      }}
                      onFocus={() => {
                        if (customerInfo.loyaltyCard.length >= 2) {
                          searchCustomers(customerInfo.loyaltyCard, 'loyaltyCard')
                          setActiveCustomerField('loyaltyCard')
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Numéro de carte"
                    />
                    {/* Customer Suggestions for Loyalty Card */}
                    {showCustomerSuggestions && customerSuggestions.length > 0 && activeCustomerField === 'loyaltyCard' && (
                      <div className="absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {customerSuggestions.map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => selectCustomer(customer)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex flex-col min-w-0">
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">
                                {customer.phone && `📞 ${customer.phone}`}
                                {customer.email && ` • 📧 ${customer.email}`}
                                {customer.loyaltyCard && ` • 🎫 ${customer.loyaltyCard}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>


              </div>
            </div>

            {/* Right side - Payment, promo codes, and total */}
            <div className="space-y-6">
              {/* Promo Code */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Code promo 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({appliedPromos.length}/2)
                  </span>
                </h3>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value)
                        const suggestions = searchPromoCodes(e.target.value)
                        setPromoSuggestions(suggestions)
                        setShowPromoSuggestions(suggestions.length > 0 && e.target.value.length > 0)
                      }}
                      onFocus={() => {
                        const suggestions = searchPromoCodes(promoCode)
                        setPromoSuggestions(suggestions)
                        setShowPromoSuggestions(suggestions.length > 0 && promoCode.length > 0)
                      }}
                      placeholder="Code promo..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    {/* Promo Code Suggestions */}
                    {showPromoSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {promoSuggestions.map((promo) => (
                          <div
                            key={promo.code}
                            onClick={() => {
                              setPromoCode(promo.code)
                              setShowPromoSuggestions(false)
                            }}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-blue-600">{promo.code}</div>
                                <div className="text-sm text-gray-600">{promo.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-green-600">
                                  {promo.type === 'percentage' ? `${promo.value}%` : `${promo.value} FCFA`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Min: {promo.minAmount.toLocaleString('fr-FR')} FCFA
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>

                {/* Promo Messages */}
                {promoError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{promoError}</p>
                  </div>
                )}

                {/* Applied Promo Codes */}
                {appliedPromos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {appliedPromos.map((promo, index) => (
                      <div key={promo.code} className="p-2 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-green-800 text-sm font-medium">
                              {promo.code === 'LOYALTY5' ? 'Réduction fidélité' : promo.code}
                            </p>
                            <p className="text-green-600 text-xs">{promo.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-700 text-sm font-medium">
                              -{promo.type === 'percentage' ? ((getSubtotal() * promo.value) / 100).toLocaleString('fr-FR') : promo.value.toLocaleString('fr-FR')} FCFA
                            </span>
                            <button
                              onClick={() => removePromoCode(promo.code)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}



                {/* Available Promo Codes */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Codes promo disponibles :</h4>
                  <div className="space-y-2">
                                    {promoDatabase.map(promo => (
                  <div 
                    key={promo.code} 
                    className={`p-2 rounded-md text-xs ${
                      appliedPromos.some(p => p.code === promo.code)
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${
                          appliedPromos.some(p => p.code === promo.code) ? 'text-blue-800' : 'text-blue-600'
                        }`}>
                          {promo.code}
                        </span>
                        {appliedPromos.some(p => p.code === promo.code) && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className={`${
                        appliedPromos.some(p => p.code === promo.code) ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {promo.type === 'percentage' ? `${promo.value}%` : `${promo.value} FCFA`}
                      </span>
                    </div>
                    <div className={`mt-1 ${
                      appliedPromos.some(p => p.code === promo.code) ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {promo.description}
                    </div>
                  </div>
                ))}
                  </div>
                </div>
              </div>

              {/* Discounts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Remises</h3>
                <button
                  onClick={() => setShowDiscountModal(true)}
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Percent className="w-4 h-4" />
                  <span>Gérer les remises</span>
                </button>

                {appliedDiscount && (
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-purple-900">{appliedDiscount.name}</p>
                        <p className="text-sm text-purple-700">{appliedDiscount.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-900">-{appliedDiscount.appliedAmount?.toLocaleString('fr-FR')} FCFA</p>
                        <button
                          onClick={removeDiscount}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Méthode de paiement</h3>
                <div className="space-y-2">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      <span className="font-medium">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-4">
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
                    <span className="text-gray-600">TVA (20%):</span>
                    <span className="font-medium">{((getSubtotal() - getPromoDiscount() - getDiscountAmount()) * 0.2).toLocaleString('fr-FR')} FCFA</span>
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
      </div>
    </div>
  )
} 
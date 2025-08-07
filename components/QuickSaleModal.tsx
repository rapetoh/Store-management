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

// Base de données des produits (simulation)
const productsDatabase = [
  { id: '1', name: 'Lait 1L', price: 1.20, stock: 50, category: 'Alimentation', barcode: '3017620422003' },
  { id: '2', name: 'Pain baguette', price: 0.85, stock: 30, category: 'Boulangerie', barcode: '3017620422004' },
  { id: '3', name: 'Yaourt nature', price: 0.65, stock: 100, category: 'Alimentation', barcode: '3017620422005' },
  { id: '4', name: 'Pommes Golden', price: 2.50, stock: 25, category: 'Fruits', barcode: '3017620422006' },
  { id: '5', name: 'Eau minérale 1.5L', price: 0.90, stock: 80, category: 'Boissons', barcode: '3017620422007' },
  { id: '6', name: 'Chips nature', price: 1.10, stock: 45, category: 'Snacks', barcode: '3017620422008' },
  { id: '7', name: 'Café moulu 250g', price: 3.50, stock: 20, category: 'Alimentation', barcode: '3017620422009' },
  { id: '8', name: 'Bananes 1kg', price: 1.80, stock: 35, category: 'Fruits', barcode: '3017620422010' },
  { id: '9', name: 'Jus d\'orange 1L', price: 1.95, stock: 40, category: 'Boissons', barcode: '3017620422011' },
  { id: '10', name: 'Chocolat noir', price: 2.20, stock: 60, category: 'Confiserie', barcode: '3017620422012' }
]

// Codes promo disponibles
const promoDatabase: PromoCode[] = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minAmount: 50, maxUses: 100, usedCount: 45, validUntil: '2025-12-31', description: '10% de réduction pour nouveaux clients' },
  { code: 'SUMMER20', type: 'percentage', value: 20, minAmount: 100, maxUses: 50, usedCount: 23, validUntil: '2025-08-31', description: '20% de réduction été' },
  { code: 'FREESHIP', type: 'fixed', value: 15, minAmount: 75, maxUses: 200, usedCount: 89, validUntil: '2025-12-31', description: 'Livraison gratuite (15€)' },
  { code: 'FLASH50', type: 'percentage', value: 50, minAmount: 200, maxUses: 10, usedCount: 8, validUntil: '2025-06-30', description: '50% de réduction flash' },
  { code: 'LOYALTY5', type: 'percentage', value: 5, minAmount: 25, maxUses: 500, usedCount: 156, validUntil: '2025-12-31', description: '5% fidélité' }
]

const paymentMethods = [
  { id: 'cash', name: 'Espèces', icon: DollarSign },
  { id: 'card', name: 'Carte bancaire', icon: CreditCard },
  { id: 'check', name: 'Chèque', icon: DollarSign },
  { id: 'mobile', name: 'Paiement mobile', icon: CreditCard }
]

export default function QuickSaleModal({ isOpen, onClose, onSaleCompleted }: QuickSaleModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
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

  const searchInputRef = useRef<HTMLInputElement>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  // Focus sur la recherche quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Gestion des touches clavier pour le scanner
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return

      // Si on tape dans le champ de recherche, ne pas traiter comme code-barres
      if (document.activeElement === searchInputRef.current) return

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
    if (!appliedPromo) return 0

    const subtotal = getSubtotal()
    if (subtotal < appliedPromo.minAmount) return 0

    if (appliedPromo.type === 'percentage') {
      return (subtotal * appliedPromo.value) / 100
    } else {
      return Math.min(appliedPromo.value, subtotal)
    }
  }

  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0
    return appliedDiscount.appliedAmount || 0
  }

  const getTotal = () => {
    const subtotal = getSubtotal()
    const promoDiscount = getPromoDiscount()
    const discountAmount = getDiscountAmount()
    const tax = (subtotal - promoDiscount - discountAmount) * 0.2
    return subtotal - promoDiscount - discountAmount + tax
  }

  const applyPromoCode = () => {
    setPromoError('')
    setPromoSuccess('')

    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo')
      return
    }

    const promo = promoDatabase.find(p => p.code.toUpperCase() === promoCode.toUpperCase())

    if (!promo) {
      setPromoError('Code promo invalide')
      return
    }

    if (new Date() > new Date(promo.validUntil)) {
      setPromoError('Code promo expiré')
      return
    }

    if (promo.usedCount >= promo.maxUses) {
      setPromoError('Code promo épuisé')
      return
    }

    const subtotal = getSubtotal()
    if (subtotal < promo.minAmount) {
      setPromoError(`Montant minimum requis: €${promo.minAmount}`)
      return
    }

    setAppliedPromo(promo)
    setPromoSuccess(`Code promo appliqué: ${promo.description}`)
    setPromoCode('')
  }

  const removePromoCode = () => {
    setAppliedPromo(null)
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
      ${item.quantity} x €${item.originalPrice.toFixed(2)} = €${(item.quantity * item.originalPrice).toFixed(2)}
      ${item.discount > 0 ? `Remise: -€${(item.discount * item.quantity).toFixed(2)}` : ''}
      `).join('')}
      =================================
      Sous-total: €${getSubtotal().toFixed(2)}
      ${appliedPromo ? `Remise promo: -€${getPromoDiscount().toFixed(2)}` : ''}
      TVA (20%): €${((getSubtotal() - getPromoDiscount()) * 0.2).toFixed(2)}
      TOTAL: €${getTotal().toFixed(2)}
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
    
    // Simuler le traitement de la vente
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mettre à jour le stock (simulation)
    cart.forEach(item => {
      const product = productsDatabase.find(p => p.id === item.id)
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity)
      }
    })
    
    const sale = {
      id: `SALE${Date.now()}`,
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
      appliedPromo: appliedPromo,
      appliedDiscount: appliedDiscount
    }

    onSaleCompleted(sale)
    
    // Imprimer le reçu
    await printReceipt()
    
    // Reset form
    setCart([])
    setSearchTerm('')
    setSelectedPaymentMethod('card')
    setPromoCode('')
    setAppliedPromo(null)
    setCustomerInfo({ name: '', phone: '', email: '', loyaltyCard: '' })
    setIsProcessing(false)
    onClose()
  }

  const handleClose = () => {
    setCart([])
    setSearchTerm('')
    setSelectedPaymentMethod('card')
    setPromoCode('')
    setAppliedPromo(null)
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-auto max-h-[95vh] overflow-y-auto">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rechercher un produit</h3>
                <div className="relative">
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
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.category} • Stock: {product.stock}</div>
                            <div className="text-xs text-gray-400">Code: {product.barcode}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">€{product.price.toFixed(2)}</div>
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
                            €{item.originalPrice.toFixed(2)} l'unité
                            {item.discount > 0 && (
                              <span className="text-green-600 ml-2">
                                -{item.discount}{item.discountType === 'percentage' ? '%' : '€'}
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
                            <div className="font-medium text-gray-900">€{item.total.toFixed(2)}</div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom du client"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Téléphone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carte fidélité</label>
                    <input
                      type="text"
                      value={customerInfo.loyaltyCard}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, loyaltyCard: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Numéro de carte"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Payment, promo codes, and total */}
            <div className="space-y-6">
              {/* Promo Code */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Code promo</h3>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Code promo..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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

                {promoSuccess && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex justify-between items-center">
                      <p className="text-green-600 text-sm">{promoSuccess}</p>
                      <button
                        onClick={removePromoCode}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Available Promo Codes */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Codes promo disponibles :</h4>
                  <div className="space-y-2">
                    {promoDatabase.map(promo => (
                      <div key={promo.code} className="p-2 bg-gray-50 rounded-md text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-600">{promo.code}</span>
                          <span className="text-gray-500">
                            {promo.type === 'percentage' ? `${promo.value}%` : `€${promo.value}`}
                          </span>
                        </div>
                        <div className="text-gray-600 mt-1">{promo.description}</div>
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
                        <p className="font-bold text-purple-900">-€{appliedDiscount.appliedAmount?.toFixed(2)}</p>
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
                    <span className="font-medium">€{getSubtotal().toFixed(2)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remise promo:</span>
                      <span className="font-medium text-green-600">-€{getPromoDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  {appliedDiscount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remise:</span>
                      <span className="font-medium text-purple-600">-€{getDiscountAmount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA (20%):</span>
                    <span className="font-medium">€{((getSubtotal() - getPromoDiscount() - getDiscountAmount()) * 0.2).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total TTC:</span>
                      <span className="text-lg font-bold text-green-600">€{getTotal().toFixed(2)}</span>
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
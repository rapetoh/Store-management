'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Printer, Download, CreditCard, DollarSign, Search, Percent, Tag } from 'lucide-react'

interface InvoiceItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  taxRate: number
  discount: number
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
  supplier: string
  status: string
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

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
}

const taxRates = [
  { name: 'TVA 20%', rate: 20 },
  { name: 'TVA 10%', rate: 10 },
  { name: 'TVA 5.5%', rate: 5.5 },
  { name: 'TVA 2.1%', rate: 2.1 },
  { name: 'Exonéré', rate: 0 }
]

const paymentMethods = [
  { id: 'cash', name: 'Espèces', icon: DollarSign },
  { id: 'card', name: 'Carte bancaire', icon: CreditCard },
  { id: 'check', name: 'Chèque', icon: DollarSign },
  { id: 'transfer', name: 'Virement', icon: CreditCard }
]

// Database state will be loaded dynamically

export default function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  // Database state
  const [productsDatabase, setProductsDatabase] = useState<Product[]>([])
  const [promoDatabase, setPromoDatabase] = useState<PromoCode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      name: 'Souris Sans Fil X2',
      quantity: 2,
      unitPrice: 25.00,
      taxRate: 20,
      discount: 0
    },
    {
      id: '2',
      name: 'Clavier Ergonomique',
      quantity: 1,
      unitPrice: 75.00,
      taxRate: 20,
      discount: 10
    }
  ])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  const [customerInfo, setCustomerInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+33 1 23 45 67 89',
    address: '123 Rue de la Paix\n75001 Paris, France'
  })
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`)
  const [invoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  // Auto-complétion states
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

  // Promo code states
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')

  const printRef = useRef<HTMLDivElement>(null)

  // Load data from database when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData()
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
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice
      const discountAmount = (itemTotal * item.discount) / 100
      return sum + (itemTotal - discountAmount)
    }, 0)
  }

  const calculateTax = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice
      const discountAmount = (itemTotal * item.discount) / 100
      const taxableAmount = itemTotal - discountAmount
      return sum + (taxableAmount * item.taxRate) / 100
    }, 0)
  }

  const calculatePromoDiscount = () => {
    if (!appliedPromo) return 0
    
    const subtotal = calculateSubtotal()
    if (subtotal < appliedPromo.minAmount) return 0

    if (appliedPromo.type === 'percentage') {
      return (subtotal * appliedPromo.value) / 100
    } else {
      return Math.min(appliedPromo.value, subtotal)
    }
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax()
    const promoDiscount = calculatePromoDiscount()
    return subtotal + tax - promoDiscount
  }

  // Fonction de recherche pour l'auto-complétion
  const searchProducts = (term: string) => {
    if (term.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const filtered = productsDatabase.filter(product => 
      product.name.toLowerCase().includes(term.toLowerCase()) ||
      product.sku.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5) // Limiter à 5 suggestions

    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
    setSelectedSuggestionIndex(-1)
  }

  // Sélectionner un produit depuis les suggestions
  const selectProduct = (product: Product) => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: product.name,
      quantity: 1,
      unitPrice: product.price,
      taxRate: 20, // TVA par défaut
      discount: 0
    }
    setItems(prev => [...prev, newItem])
    setSearchTerm('')
    setShowSuggestions(false)
    setSuggestions([])
  }

  // Appliquer un code promo
  const applyPromoCode = async () => {
    setPromoError('')
    setPromoSuccess('')

    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo')
      return
    }

    try {
      const response = await fetch('/api/promocodes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode,
          amount: calculateSubtotal(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPromoError(data.error || 'Code promo invalide')
        return
      }

      setAppliedPromo(data.promoCode)
      setPromoSuccess(`Code promo appliqué: ${data.promoCode.description}`)
      setPromoCode('')
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoError('Erreur lors de la validation du code promo')
    }
  }

  // Supprimer le code promo appliqué
  const removePromoCode = () => {
    setAppliedPromo(null)
    setPromoSuccess('')
  }

  // Gestion des touches clavier pour la navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          selectProduct(suggestions[selectedSuggestionIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSearchTerm('')
        break
    }
  }

  const handlePrint = () => {
    if (printRef.current) {
      // Sauvegarder le contenu original de la page
      const originalContent = document.body.innerHTML
      
      // Remplacer le contenu de la page par la facture
      document.body.innerHTML = printRef.current.innerHTML
      
      // Ajouter des styles d'impression
      const style = document.createElement('style')
      style.textContent = `
        @media print {
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
          }
          .invoice-header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .invoice-header h1 { 
            font-size: 24px; 
            margin: 0; 
            color: #333;
          }
          .invoice-header h2 { 
            font-size: 18px; 
            margin: 5px 0; 
            color: #666;
          }
          .invoice-details { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
          }
          .invoice-details > div {
            flex: 1;
          }
          .invoice-details h3 {
            font-size: 14px;
            margin: 0 0 10px 0;
            color: #333;
          }
          .invoice-details p {
            margin: 5px 0;
            color: #666;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
            font-size: 11px;
          }
          th { 
            background-color: #f8f9fa; 
            font-weight: bold;
            color: #333;
          }
          .totals { 
            text-align: right; 
            margin-top: 20px;
            border-top: 2px solid #333;
            padding-top: 10px;
          }
          .totals p {
            margin: 5px 0;
            font-size: 12px;
          }
          .totals p:last-child {
            font-weight: bold;
            font-size: 14px;
            color: #333;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 10px; 
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          @page {
            margin: 1cm;
          }
        }
        @media screen {
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
          }
          .invoice-header { 
            text-align: center; 
            margin-bottom: 30px; 
          }
          .invoice-details { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f8f9fa; 
          }
          .totals { 
            text-align: right; 
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
          }
        }
      `
      document.head.appendChild(style)
      
      // Imprimer
      window.print()
      
      // Restaurer le contenu original après l'impression
      setTimeout(() => {
        document.body.innerHTML = originalContent
        // Réinitialiser les event listeners si nécessaire
        window.location.reload()
      }, 100)
    }
  }

  const handleDownloadPDF = () => {
    // Simuler le téléchargement d'un PDF
    alert('Fonctionnalité de téléchargement PDF à implémenter')
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 20,
      discount: 0
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Facture #{invoiceNumber}</h2>
              <p className="text-sm text-gray-600">Gestion complète de la facturation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              title="Télécharger PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              title="Imprimer"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">StockFlow</h3>
              <p className="text-sm text-gray-600">123 Rue du Commerce</p>
              <p className="text-sm text-gray-600">75001 Paris, France</p>
              <p className="text-sm text-gray-600">Tél: +33 1 23 45 67 89</p>
              <p className="text-sm text-gray-600">Email: contact@stockflow.fr</p>
              <p className="text-sm text-gray-600">SIRET: 123 456 789 00012</p>
            </div>

            {/* Invoice Details */}
            <div className="text-right">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de facture</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de facture</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                  <input
                    type="date"
                    value={dueDate}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Add Article Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Ajouter un article</h3>
            <div className="relative">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      searchProducts(e.target.value)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Tapez le nom ou le code du produit..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    if (searchTerm.trim()) {
                      searchProducts(searchTerm)
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Rechercher
                </button>
              </div>

              {/* Suggestions */}
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((product, index) => (
                    <div
                      key={product.id}
                      onClick={() => selectProduct(product)}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                        index === selectedSuggestionIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">Code: {product.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">€{product.price.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">Stock: {product.stock}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Code promo</h3>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Entrez votre code promo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={applyPromoCode}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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

          {/* Items Table */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Articles</h3>
              <button
                onClick={addItem}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                + Ajouter un article
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TVA</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remise %</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total HT</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-t border-gray-200">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Nom de l'article"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={item.taxRate}
                          onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value))}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {taxRates.map(tax => (
                            <option key={tax.rate} value={tax.rate}>{tax.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">
                        €{((item.quantity * item.unitPrice) * (1 - item.discount / 100)).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Méthode de paiement</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`p-3 border rounded-lg flex items-center space-x-2 transition-colors ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <method.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Sous-total HT:</span>
                  <span className="font-medium">€{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">TVA:</span>
                  <span className="font-medium">€{calculateTax().toFixed(2)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Réduction promo:</span>
                    <span className="font-medium text-green-600">-€{calculatePromoDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total TTC:</span>
                    <span className="text-lg font-semibold">€{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer la facture</span>
          </button>
        </div>

        {/* Print Template (Hidden) */}
        <div ref={printRef} className="hidden">
          <div className="invoice-header">
            <h1>StockFlow</h1>
            <h2>Facture #{invoiceNumber}</h2>
          </div>
          <div className="invoice-details">
            <div>
              <h3>Facturé à:</h3>
              <p>{customerInfo.name}</p>
              <p>{customerInfo.address}</p>
            </div>
            <div>
              <p><strong>Date:</strong> {invoiceDate}</p>
              <p><strong>Échéance:</strong> {dueDate}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>€{item.unitPrice.toFixed(2)}</td>
                  <td>€{((item.quantity * item.unitPrice) * (1 - item.discount / 100)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="totals">
            <p><strong>Sous-total HT:</strong> €{calculateSubtotal().toFixed(2)}</p>
            <p><strong>TVA:</strong> €{calculateTax().toFixed(2)}</p>
            {appliedPromo && (
              <p><strong>Réduction promo:</strong> -€{calculatePromoDiscount().toFixed(2)}</p>
            )}
            <p><strong>Total TTC:</strong> €{calculateTotal().toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 
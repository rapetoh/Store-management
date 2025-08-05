'use client'

import { useState, useRef } from 'react'
import { X, Printer, Download, CreditCard, Cash } from 'lucide-react'

interface InvoiceItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  taxRate: number
  discount: number
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
  { id: 'cash', name: 'Espèces', icon: Cash },
  { id: 'card', name: 'Carte bancaire', icon: CreditCard },
  { id: 'check', name: 'Chèque', icon: Cash },
  { id: 'transfer', name: 'Virement', icon: CreditCard }
]

export default function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
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

  const printRef = useRef<HTMLDivElement>(null)

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

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Facture ${invoiceNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-header { text-align: center; margin-bottom: 30px; }
                .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f8f9fa; }
                .totals { text-align: right; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
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
            <p><strong>Total TTC:</strong> €{calculateTotal().toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 
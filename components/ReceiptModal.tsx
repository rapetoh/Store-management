'use client'

import React, { useRef, useEffect, useState } from 'react'
import { X, Printer, Download, Receipt } from 'lucide-react'
import QRCode from 'qrcode'

interface SaleItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Sale {
  id: string
  customer?: string
  totalAmount?: number
  discountAmount?: number
  taxAmount?: number
  finalAmount?: number
  paymentMethod: string
  saleDate?: string
  notes?: string
  items?: SaleItem[]
  // For compatibility
  total?: number
  date?: string
  time?: string
  status?: string
  cashier?: string
}

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
}

export default function ReceiptModal({ isOpen, onClose, sale }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  // Generate QR code data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const generateQRData = () => {
    const itemsText = sale.items && sale.items.length > 0 
      ? sale.items.map(item => `- ${item.productName}: ${item.quantity} x ${item.unitPrice.toLocaleString('fr-FR')} FCFA = ${item.totalPrice.toLocaleString('fr-FR')} FCFA`).join('\n')
      : 'Aucun article'

    const qrText = `STOCKFLOW - RECU DE VENTE
ID: ${sale.id}
Date: ${formatDate(sale.saleDate || sale.date || new Date().toISOString())}
Client: ${sale.customer || 'Client anonyme'}
Caissier: ${sale.cashier || 'Caissier actuel'}
Paiement: ${sale.paymentMethod}

ARTICLES:
${itemsText}

Sous-total: ${(sale.totalAmount || sale.total || 0).toLocaleString('fr-FR')} FCFA
${sale.discountAmount && sale.discountAmount > 0 ? `Remise: -${sale.discountAmount.toLocaleString('fr-FR')} FCFA\n` : ''}${sale.taxAmount && sale.taxAmount > 0 ? `TVA: ${sale.taxAmount.toLocaleString('fr-FR')} FCFA\n` : ''}TOTAL: ${(sale.finalAmount || sale.total || 0).toLocaleString('fr-FR')} FCFA

${sale.notes ? `Notes: ${sale.notes}` : ''}

Merci de votre visite!
StockFlow - Lomé, Togo`

    return qrText
  }

  // Generate QR code when sale changes
  useEffect(() => {
    if (sale) {
      const qrData = generateQRData()
      QRCode.toDataURL(qrData, {
        width: 150,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrCodeDataUrl(url)
      }).catch(err => {
        console.error('Error generating QR code:', err)
      })
    }
  }, [sale])

  if (!isOpen || !sale) return null

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Reçu de vente</title>
              <style>
                @media print {
                  body { 
                    font-family: 'Courier New', monospace; 
                    margin: 0; 
                    padding: 10px;
                    font-size: 12px;
                    line-height: 1.2;
                  }
                                     .receipt {
                     width: 80mm;
                     margin: 0 auto;
                     font-family: 'Courier New', monospace;
                     font-size: 10px;
                     line-height: 1.1;
                   }
                  .header {
                    text-align: center;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                  }
                  .header h1 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: bold;
                  }
                  .header h2 {
                    margin: 5px 0;
                    font-size: 14px;
                  }
                  .info {
                    margin-bottom: 10px;
                    font-size: 11px;
                  }
                  .items {
                    margin-bottom: 10px;
                  }
                  .item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 3px;
                    font-size: 11px;
                  }
                  .item-name {
                    flex: 1;
                  }
                  .item-details {
                    text-align: right;
                    min-width: 80px;
                  }
                  .totals {
                    border-top: 1px dashed #000;
                    padding-top: 10px;
                    margin-top: 10px;
                  }
                  .total-line {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2px;
                    font-size: 11px;
                  }
                  .total-line.final {
                    font-weight: bold;
                    font-size: 12px;
                    border-top: 1px solid #000;
                    padding-top: 5px;
                    margin-top: 5px;
                  }
                  .footer {
                    text-align: center;
                    margin-top: 15px;
                    font-size: 10px;
                    border-top: 1px dashed #000;
                    padding-top: 10px;
                  }
                  .qr-code {
                    text-align: center;
                    margin: 10px 0;
                    font-size: 8px;
                  }
                  @page {
                    margin: 0;
                    size: 80mm auto;
                  }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const handleDownloadPDF = () => {
    // Pour l'instant, on simule le téléchargement
    alert('Fonctionnalité PDF à implémenter')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Reçu de vente</h2>
              <p className="text-sm text-gray-600">Impression et téléchargement</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              title="Télécharger PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              title="Imprimer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Preview */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div ref={printRef} className="receipt bg-white border border-gray-200 rounded-lg p-4 max-w-sm mx-auto">
            {/* Header */}
            <div className="header text-center border-b border-dashed border-gray-300 pb-3 mb-3">
              <h1 className="text-lg font-bold text-gray-900">STOCKFLOW</h1>
              <h2 className="text-sm text-gray-600">Gestion de Stock</h2>
              <p className="text-xs text-gray-500">123 Rue du Commerce, Lomé, Togo</p>
              <p className="text-xs text-gray-500">Tél: +228 90 12 34 56</p>
            </div>

            {/* Sale Info */}
            <div className="info text-xs text-gray-600 mb-3">
              <div className="flex justify-between">
                <span>Reçu N°:</span>
                <span className="font-mono">{sale.id.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDate(sale.saleDate || sale.date || new Date().toISOString())}</span>
              </div>
              <div className="flex justify-between">
                <span>Client:</span>
                <span>{sale.customer || 'Client anonyme'}</span>
              </div>
              <div className="flex justify-between">
                <span>Caissier:</span>
                <span>{sale.cashier || 'Caissier actuel'}</span>
              </div>
              <div className="flex justify-between">
                <span>Paiement:</span>
                <span className="capitalize">{sale.paymentMethod}</span>
              </div>
            </div>

            {/* Items */}
            <div className="items mb-3">
              <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
                <div className="flex justify-between text-xs font-medium text-gray-700">
                  <span>Article</span>
                  <span>Qté x Prix</span>
                  <span>Total</span>
                </div>
              </div>
              
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((item) => (
                  <div key={item.id} className="item mb-2">
                    <div className="item-name text-xs">
                      {item.productName}
                    </div>
                    <div className="item-details text-xs text-right">
                                      <div>{item.quantity} x {item.unitPrice.toLocaleString('fr-FR')} FCFA</div>
                <div className="font-medium">{item.totalPrice.toLocaleString('fr-FR')} FCFA</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 text-center py-4">
                  Aucun article disponible
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="totals border-t border-dashed border-gray-300 pt-3">
              <div className="total-line">
                <span>Sous-total:</span>
                <span>{(sale.totalAmount || sale.total || 0).toLocaleString('fr-FR')} FCFA</span>
              </div>
              {sale.discountAmount && sale.discountAmount > 0 && (
                <div className="total-line text-green-600">
                  <span>Remise:</span>
                  <span>-{sale.discountAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              {sale.taxAmount && sale.taxAmount > 0 && (
                <div className="total-line">
                  <span>TVA:</span>
                  <span>{sale.taxAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              <div className="total-line final">
                <span>TOTAL:</span>
                <span>{(sale.finalAmount || sale.total || 0).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* Notes */}
            {sale.notes && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                <div className="font-medium text-gray-700 mb-1">Notes:</div>
                <div className="text-gray-600">{sale.notes}</div>
              </div>
            )}

                         {/* QR Code */}
             <div className="qr-code mt-3 text-center">
               {qrCodeDataUrl ? (
                 <img 
                   src={qrCodeDataUrl} 
                   alt="QR Code du reçu" 
                   className="w-16 h-16 mx-auto mb-2"
                 />
               ) : (
                 <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                   <span className="text-xs text-gray-500">QR</span>
                 </div>
               )}
               <div className="text-xs text-gray-500 font-mono">{sale.id}</div>
             </div>

            {/* Footer */}
            <div className="footer text-center mt-4 pt-3 border-t border-dashed border-gray-300">
              <p className="text-xs text-gray-500 mb-1">Merci de votre visite !</p>
              <p className="text-xs text-gray-500">Conservez ce reçu pour vos retours</p>
              <p className="text-xs text-gray-400 mt-2">Reçu généré automatiquement</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>
    </div>
  )
} 
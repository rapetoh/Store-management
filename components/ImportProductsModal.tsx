'use client'

import { useState, useRef } from 'react'
import { X, Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react'

interface ImportProductsModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface CSVProduct {
  name: string
  sku?: string
  category?: string
  supplier?: string
  stock: number
  price: number
  description?: string
  minStock?: number
  barcode?: string
}

export default function ImportProductsModal({ isOpen, onClose, onImportComplete }: ImportProductsModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<CSVProduct[]>([])
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'preview' | 'importing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [importResults, setImportResults] = useState({ success: 0, errors: 0, total: 0 })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Veuillez sélectionner un fichier CSV')
      return
    }

    setUploadedFile(file)
    setErrorMessage('')
    parseCSVFile(file)
  }

  const parseCSVFile = (file: File) => {
    setIsUploading(true)
    setImportStatus('uploading')

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        
        const products: CSVProduct[] = []
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue
          
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const product: CSVProduct = {
            name: values[headers.indexOf('nom')] || values[headers.indexOf('name')] || '',
            sku: values[headers.indexOf('sku')] || '',
            category: values[headers.indexOf('catégorie')] || values[headers.indexOf('category')] || '',
            supplier: values[headers.indexOf('fournisseur')] || values[headers.indexOf('supplier')] || '',
            stock: parseInt(values[headers.indexOf('stock')]) || 0,
            price: parseFloat(values[headers.indexOf('prix')]) || parseFloat(values[headers.indexOf('price')]) || 0,
            description: values[headers.indexOf('description')] || '',
            minStock: parseInt(values[headers.indexOf('minstock')]) || 5,
            barcode: values[headers.indexOf('barcode')] || values[headers.indexOf('code-barres')] || ''
          }
          
          if (product.name) {
            products.push(product)
          }
        }
        
        setPreviewData(products)
        setImportStatus('preview')
      } catch (error) {
        setErrorMessage('Erreur lors de la lecture du fichier CSV')
        setImportStatus('error')
      } finally {
        setIsUploading(false)
      }
    }
    
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (previewData.length === 0) return

    setImportStatus('importing')

    try {
      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: previewData }),
      })

      const result = await response.json()

      if (response.ok) {
        setImportResults({
          success: result.summary.success,
          errors: result.summary.errors,
          total: result.summary.total
        })
        setImportStatus('success')
        onImportComplete()
      } else {
        setErrorMessage(result.error || 'Erreur lors de l\'import')
        setImportStatus('error')
      }
    } catch (error) {
      setErrorMessage('Erreur de connexion lors de l\'import')
      setImportStatus('error')
    }
  }

  const handleDownloadTemplate = () => {
    const template = [
      'Nom,SKU,Catégorie,Fournisseur,Stock,Prix,Description,MinStock,Barcode',
      'Lait 1L,LAIT001,Alimentation,Fournisseur A,50,1.20,Lait frais 1L,10,3017620422003',
      'Pain baguette,PAIN001,Boulangerie,Fournisseur B,30,0.85,Pain frais,5,3017620422004'
    ].join('\n')

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_produits.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetModal = () => {
    setUploadedFile(null)
    setPreviewData([])
    setImportStatus('idle')
    setErrorMessage('')
    setImportResults({ success: 0, errors: 0, total: 0 })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Import de produits</h2>
              <p className="text-sm text-gray-600">Importer des produits depuis un fichier CSV</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {importStatus === 'idle' && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sélectionnez un fichier CSV avec les colonnes: Nom, SKU, Catégorie, Fournisseur, Stock, Prix</li>
                  <li>• Les colonnes optionnelles: Description, MinStock, Barcode</li>
                  <li>• Le fichier doit avoir un en-tête avec les noms des colonnes</li>
                  <li>• Les produits existants avec le même SKU seront mis à jour</li>
                </ul>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionner un fichier CSV</h3>
                <p className="text-gray-600 mb-4">Glissez-déposez votre fichier ici ou cliquez pour parcourir</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Choisir un fichier
                </button>
              </div>

              {/* Template Download */}
              <div className="text-center">
                <p className="text-gray-600 mb-2">Pas de fichier CSV ?</p>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-blue-600 hover:text-blue-800 flex items-center justify-center space-x-2 mx-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger un modèle</span>
                </button>
              </div>
            </div>
          )}

          {importStatus === 'uploading' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyse du fichier CSV...</p>
            </div>
          )}

          {importStatus === 'preview' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    {previewData.length} produits trouvés dans le fichier
                  </span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu des produits</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-3 py-2 text-left">Nom</th>
                        <th className="px-3 py-2 text-left">SKU</th>
                        <th className="px-3 py-2 text-left">Catégorie</th>
                        <th className="px-3 py-2 text-left">Stock</th>
                        <th className="px-3 py-2 text-left">Prix</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((product, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-3 py-2">{product.name}</td>
                          <td className="px-3 py-2">{product.sku || 'N/A'}</td>
                          <td className="px-3 py-2">{product.category || 'N/A'}</td>
                          <td className="px-3 py-2">{product.stock}</td>
                          <td className="px-3 py-2">€{product.price.toFixed(2)}</td>
                        </tr>
                      ))}
                      {previewData.length > 5 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-2 text-center text-gray-500">
                            ... et {previewData.length - 5} autres produits
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Importer {previewData.length} produits
                </button>
              </div>
            </div>
          )}

          {importStatus === 'importing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Import des produits en cours...</p>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Import terminé avec succès !
                  </span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  <p>• {importResults.success} produits importés</p>
                  {importResults.errors > 0 && (
                    <p>• {importResults.errors} erreurs rencontrées</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-medium">Erreur</span>
                </div>
                <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Réessayer
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
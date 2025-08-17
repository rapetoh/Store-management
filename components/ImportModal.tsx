'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface ImportResult {
  imported: number
  updated: number
  skipped: number
  errors: number
  errorMessages: string[]
}

export default function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [options, setOptions] = useState({
    skipDuplicates: true,
    updateExisting: false
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const products = parseCSV(text)
      
      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          products,
          options
        })
      })

      if (response.ok) {
        const result = await response.json()
        setImportResult({
          imported: result.summary.imported,
          updated: result.summary.updated,
          skipped: result.summary.skipped,
          errors: result.summary.errors,
          errorMessages: result.errors || []
        })
        
        if (result.summary.imported > 0 || result.summary.updated > 0) {
          onImportComplete()
        }
      } else {
        throw new Error('Import failed')
      }
    } catch (error) {
      console.error('Error importing products:', error)
      setImportResult({
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 1,
        errorMessages: ['Erreur lors de l\'import des produits']
      })
    } finally {
      setIsImporting(false)
    }
  }

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    const products = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map(v => v.replace(/"/g, '').trim())
      const product: any = {}

      headers.forEach((header, index) => {
        const value = values[index] || ''
        
        switch (header.toLowerCase()) {
          case 'nom':
            product.name = value
            break
          case 'description':
            product.description = value
            break
          case 'prix de vente (fcfa)':
          case 'prix (fcfa)':
            product.price = parseFloat(value) || 0
            break
          case 'prix d\'achat (fcfa)':
          case 'prix de revient (fcfa)':
            product.costPrice = parseFloat(value) || 0
            break
          case 'stock':
            product.stock = parseInt(value) || 0
            break
          case 'stock minimum':
            product.minStock = parseInt(value) || 0
            break
          case 'code-barres':
            product.barcode = value || undefined
            break
          case 'sku':
            product.sku = value || undefined
            break
          case 'catégorie':
            product.category = value || undefined
            break
          case 'tva':
            product.taxRate = value || undefined
            break
          case 'statut':
            product.isActive = value.toLowerCase() === 'actif'
            break
          case 'image url':
            product.image = value || undefined
            break
        }
      })

      if (product.name && product.price !== undefined) {
        products.push(product)
      }
    }

    return products
  }

  const handleClose = () => {
    setImportResult(null)
    setOptions({
      skipDuplicates: true,
      updateExisting: false
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Importer des produits</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!importResult ? (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Utilisez un fichier CSV avec les colonnes : Nom, Prix de vente (FCFA), Prix d'achat (FCFA), Stock</li>
                  <li>• Les colonnes optionnelles : Description, Code-barres, SKU, Catégorie</li>
                  <li>• Le fichier doit avoir un en-tête avec les noms des colonnes</li>
                </ul>
              </div>

              {/* Import Options */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Options d'import</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.skipDuplicates}
                      onChange={(e) => setOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ignorer les doublons</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.updateExisting}
                      onChange={(e) => setOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mettre à jour les produits existants</span>
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-4">
                  Glissez-déposez votre fichier CSV ici ou cliquez pour sélectionner
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={isImporting}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isImporting ? 'Import en cours...' : 'Sélectionner un fichier'}
                </button>
              </div>
            </>
          ) : (
            /* Import Results */
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {importResult.errors === 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                )}
                <h3 className="text-lg font-medium text-gray-900">Résultats de l'import</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">Importés</p>
                  <p className="text-2xl font-bold text-green-700">{importResult.imported}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Mis à jour</p>
                  <p className="text-2xl font-bold text-blue-700">{importResult.updated}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Ignorés</p>
                  <p className="text-2xl font-bold text-gray-700">{importResult.skipped}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-600">Erreurs</p>
                  <p className="text-2xl font-bold text-red-700">{importResult.errors}</p>
                </div>
              </div>

              {importResult.errorMessages.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Erreurs détectées :</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {importResult.errorMessages.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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
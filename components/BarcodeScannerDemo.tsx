'use client'

import { useState } from 'react'
import { Barcode, CheckCircle, AlertCircle } from 'lucide-react'
import { useBarcodeScanner } from '../hooks/useBarcodeScanner'

export default function BarcodeScannerDemo() {
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([])
  const [lastScanned, setLastScanned] = useState<string>('')

  const { barcodeBuffer, isScanning, clearBuffer } = useBarcodeScanner({
    onBarcodeDetected: (barcode) => {
      console.log('Barcode detected:', barcode)
      setLastScanned(barcode)
      setScannedBarcodes(prev => [barcode, ...prev.slice(0, 9)]) // Keep last 10
      clearBuffer()
    },
    minLength: 8,
    maxLength: 20,
    timeout: 150
  })

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Scanner Code-barres</h1>
        <p className="text-gray-600">Connectez votre scanner et scannez un produit</p>
      </div>

      {/* Scanner Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Barcode className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Statut du scanner</span>
          {isScanning && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Scanning...</span>
            </div>
          )}
        </div>
        <div className="text-sm text-blue-700">
          {isScanning 
            ? "Scanner actif - scannez un produit" 
            : "En attente du scanner - scannez un produit"
          }
        </div>
        {barcodeBuffer && (
          <div className="mt-2 text-xs text-blue-600">
            Code en cours: <span className="font-mono">{barcodeBuffer}</span>
          </div>
        )}
      </div>

      {/* Last Scanned */}
      {lastScanned && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Dernier code scanné</span>
          </div>
          <div className="text-lg font-mono text-green-700">{lastScanned}</div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Connectez votre scanner USB à l'ordinateur</li>
          <li>• Le scanner doit être configuré en mode "clavier"</li>
          <li>• Scannez un produit - le code apparaîtra automatiquement</li>
          <li>• Si le scanner ne fonctionne pas, tapez le code manuellement</li>
        </ul>
      </div>

      {/* History */}
      {scannedBarcodes.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Historique des scans</h3>
          <div className="space-y-1">
            {scannedBarcodes.map((barcode, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded">
                <span className="text-sm text-gray-500">#{index + 1}</span>
                <span className="font-mono text-sm">{barcode}</span>
                <span className="text-xs text-gray-400">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Troubleshooting */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-900">Dépannage</span>
        </div>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Vérifiez que le scanner est bien connecté</li>
          <li>• Assurez-vous que le scanner est en mode "clavier"</li>
          <li>• Testez le scanner dans un éditeur de texte</li>
          <li>• Redémarrez le scanner si nécessaire</li>
        </ul>
      </div>
    </div>
  )
} 
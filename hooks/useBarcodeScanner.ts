import { useState, useEffect, useCallback } from 'react'

interface UseBarcodeScannerOptions {
  onBarcodeDetected?: (barcode: string) => void
  minLength?: number
  maxLength?: number
  timeout?: number
}

export function useBarcodeScanner(options: UseBarcodeScannerOptions = {}) {
  const {
    onBarcodeDetected,
    minLength = 8,
    maxLength = 20,
    timeout = 100
  } = options

  const [barcodeBuffer, setBarcodeBuffer] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [lastKeyTime, setLastKeyTime] = useState(0)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const currentTime = Date.now()
    
    // Reset buffer if too much time has passed since last key
    if (currentTime - lastKeyTime > timeout) {
      setBarcodeBuffer('')
    }
    
    setLastKeyTime(currentTime)
    setIsScanning(true)

    // Handle different key types
    if (event.key === 'Enter') {
      // Barcode scanner typically sends Enter at the end
      if (barcodeBuffer.length >= minLength && barcodeBuffer.length <= maxLength) {
        const detectedBarcode = barcodeBuffer.trim()
        onBarcodeDetected?.(detectedBarcode)
        setBarcodeBuffer('')
        setIsScanning(false)
      }
    } else if (event.key === 'Tab' || event.key === 'Escape') {
      // Clear buffer on navigation keys
      setBarcodeBuffer('')
      setIsScanning(false)
    } else if (event.key.length === 1) {
      // Add character to buffer
      setBarcodeBuffer(prev => prev + event.key)
    }
  }, [barcodeBuffer, lastKeyTime, timeout, minLength, maxLength, onBarcodeDetected])

  useEffect(() => {
    // Add event listener
    document.addEventListener('keydown', handleKeyDown)
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // Auto-clear scanning state after timeout
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        setIsScanning(false)
      }, timeout + 50)
      
      return () => clearTimeout(timer)
    }
  }, [isScanning, timeout])

  return {
    barcodeBuffer,
    isScanning,
    clearBuffer: () => setBarcodeBuffer('')
  }
} 
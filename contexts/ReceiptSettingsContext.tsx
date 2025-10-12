'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ReceiptSettings {
  showLogo: boolean
  showTaxDetails: boolean
  showCashierName: boolean
  receiptFooter: string
  autoPrint: boolean
  printDuplicate: boolean
}

interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  siret: string
  vatNumber: string
}

interface ReceiptSettingsContextType {
  receiptSettings: ReceiptSettings
  companyInfo: CompanyInfo
  isLoading: boolean
  refreshSettings: () => Promise<void>
}

const defaultReceiptSettings: ReceiptSettings = {
  showLogo: true,
  showTaxDetails: true,
  showCashierName: true,
  receiptFooter: 'Merci de votre visite !',
  autoPrint: false,
  printDuplicate: false
}

const defaultCompanyInfo: CompanyInfo = {
  name: 'Mon Panier',
  address: '123 Rue du Commerce\nLomé, Togo',
  phone: '+228 22 23 45 67',
  email: 'contact@monpanier.tg',
  siret: '123456789',
  vatNumber: 'TG123456789'
}

const ReceiptSettingsContext = createContext<ReceiptSettingsContextType | undefined>(undefined)

export function ReceiptSettingsProvider({ children }: { children: ReactNode }) {
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>(defaultReceiptSettings)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo)
  const [isLoading, setIsLoading] = useState(true)

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const settings = await response.json()
        
        // Load receipt settings
        if (settings['receipt.showLogo'] !== undefined) {
          setReceiptSettings({
            showLogo: settings['receipt.showLogo'] === 'true',
            showTaxDetails: settings['receipt.showTaxDetails'] === 'true',
            showCashierName: settings['receipt.showCashierName'] === 'true',
            receiptFooter: settings['receipt.receiptFooter'] || 'Merci de votre visite !',
            autoPrint: settings['receipt.autoPrint'] === 'true',
            printDuplicate: settings['receipt.printDuplicate'] === 'true'
          })
        }
        
        // Load company info
        if (settings['company.name']) {
          setCompanyInfo({
            name: settings['company.name'] || defaultCompanyInfo.name,
            address: settings['company.address'] || defaultCompanyInfo.address,
            phone: settings['company.phone'] || defaultCompanyInfo.phone,
            email: settings['company.email'] || defaultCompanyInfo.email,
            siret: settings['company.siret'] || defaultCompanyInfo.siret,
            vatNumber: settings['company.vatNumber'] || defaultCompanyInfo.vatNumber
          })
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSettings = async () => {
    await loadSettings()
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <ReceiptSettingsContext.Provider value={{
      receiptSettings,
      companyInfo,
      isLoading,
      refreshSettings
    }}>
      {children}
    </ReceiptSettingsContext.Provider>
  )
}

export function useReceiptSettings() {
  const context = useContext(ReceiptSettingsContext)
  if (context === undefined) {
    throw new Error('useReceiptSettings must be used within a ReceiptSettingsProvider')
  }
  return context
}

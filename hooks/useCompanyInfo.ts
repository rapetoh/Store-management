import { useState, useEffect } from 'react'

interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  siret: string
  vatNumber: string
  logo?: string
}

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'StockFlow',
    address: '123 Rue du Commerce\nLomé, Togo',
    phone: '+228 91 234 567',
    email: 'contact@stockflow.tg',
    siret: 'TG123456789',
    vatNumber: 'TG123456789'
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadCompanyInfo = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/company')
      if (response.ok) {
        const data = await response.json()
        setCompanyInfo(data)
      }
    } catch (error) {
      console.error('Error loading company info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCompanyInfo()
  }, [])

  return {
    companyInfo,
    isLoading,
    refreshCompanyInfo: loadCompanyInfo
  }
} 
'use client'

import { useCompanyInfo } from '@/hooks/useCompanyInfo'

interface CompanyInfoProps {
  showLogo?: boolean
  showAddress?: boolean
  showContact?: boolean
  showLegal?: boolean
  className?: string
}

export default function CompanyInfo({ 
  showLogo = true, 
  showAddress = true, 
  showContact = true, 
  showLegal = false,
  className = '' 
}: CompanyInfoProps) {
  const { companyInfo, isLoading } = useCompanyInfo()

  if (isLoading) {
    return <div className={`text-gray-500 ${className}`}>Chargement...</div>
  }

  return (
    <div className={`text-center ${className}`}>
      {showLogo && (
        <div className="mb-2">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">
              {companyInfo.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
      
      <h1 className="text-xl font-bold text-gray-900 mb-1">
        {companyInfo.name}
      </h1>
      
      {showAddress && companyInfo.address && (
        <p className="text-sm text-gray-600 mb-1 whitespace-pre-line">
          {companyInfo.address}
        </p>
      )}
      
      {showContact && (
        <div className="text-sm text-gray-600 space-y-1">
          {companyInfo.phone && (
            <p>Tél: {companyInfo.phone}</p>
          )}
          {companyInfo.email && (
            <p>Email: {companyInfo.email}</p>
          )}
        </div>
      )}
      
      {showLegal && (
        <div className="text-xs text-gray-500 mt-2 space-y-1">
          {companyInfo.siret && (
            <p>Immatriculation: {companyInfo.siret}</p>
          )}
          {companyInfo.vatNumber && (
            <p>Numéro fiscal: {companyInfo.vatNumber}</p>
          )}
        </div>
      )}
    </div>
  )
} 
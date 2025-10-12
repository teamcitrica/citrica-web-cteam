'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface AvailabilityCache {
  [key: string]: any
}

interface AvailabilityContextType {
  cache: AvailabilityCache
  setCache: (key: string, value: any) => void
  getCache: (key: string) => any
  clearCache: () => void
}

const AvailabilityContext = createContext<AvailabilityContextType | undefined>(undefined)

export const AvailabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cache, setCacheState] = useState<AvailabilityCache>({})

  const setCache = useCallback((key: string, value: any) => {
    setCacheState((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const getCache = useCallback(
    (key: string) => {
      return cache[key]
    },
    [cache]
  )

  const clearCache = useCallback(() => {
    setCacheState({})
  }, [])

  return (
    <AvailabilityContext.Provider
      value={{
        cache,
        setCache,
        getCache,
        clearCache,
      }}
    >
      {children}
    </AvailabilityContext.Provider>
  )
}

export const useAvailability = () => {
  const context = useContext(AvailabilityContext)
  if (context === undefined) {
    throw new Error('useAvailability must be used within an AvailabilityProvider')
  }
  return context
}

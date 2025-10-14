'use client'

import { AvailabilityProvider } from '@/app/contexts/AvailabilityContext'

export default function ReservasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AvailabilityProvider>
      {children}
    </AvailabilityProvider>
  )
}

'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useSupabase } from '@/shared/context/supabase-context'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface TimeSlot {
  slot: string
  active: boolean
}

interface StudioAvailabilityDay {
  day_of_week: number
  is_active: boolean
  time_slots: TimeSlot[]
}

interface Booking {
  id: string
  booking_date: string
  time_slots: string[]
  status: string
  type_id: number
}

interface AvailabilityCache {
  [key: string]: any
}

interface AvailabilityContextType {
  // Cache genérico
  cache: AvailabilityCache
  setCache: (key: string, value: any) => void
  getCache: (key: string) => any
  clearCache: () => void

  // Datos específicos de disponibilidad (cached + real-time)
  studioAvailability: Map<number, StudioAvailabilityDay> // Map por day_of_week (0-6)
  bookings: Booking[]
  isLoading: boolean

  // Métodos helper
  getWeeklyAvailability: (dayOfWeek: number) => StudioAvailabilityDay | null
  refreshStudioAvailability: () => Promise<void>
  refreshBookings: () => Promise<void>
}

const AvailabilityContext = createContext<AvailabilityContextType | undefined>(undefined)

export const AvailabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { supabase } = useSupabase()
  const [cache, setCacheState] = useState<AvailabilityCache>({})
  const [studioAvailability, setStudioAvailability] = useState<Map<number, StudioAvailabilityDay>>(new Map())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cache genérico
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

  // Cargar studio_availability (UNA SOLA VEZ - 7 días)
  const refreshStudioAvailability = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('studio_availability')
        .select('day_of_week, is_active, time_slots')
        .order('day_of_week')

      if (error) {
        console.error('❌ Error loading studio_availability:', error)
        return
      }

      if (data) {
        const availabilityMap = new Map<number, StudioAvailabilityDay>()
        data.forEach((day: any) => {
          availabilityMap.set(day.day_of_week, {
            day_of_week: day.day_of_week,
            is_active: day.is_active,
            time_slots: day.time_slots || []
          })
        })
        setStudioAvailability(availabilityMap)
      }
    } catch (error) {
      console.error('❌ Error in refreshStudioAvailability:', error)
    }
  }, [supabase])

  // Cargar bookings activas
  const refreshBookings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, booking_date, time_slots, status, type_id')
        .in('status', ['confirmed', 'pending'])
        .not('booking_date', 'is', null)

      if (error) {
        console.error('❌ Error loading bookings:', error)
        return
      }

      if (data) {
        const validBookings: Booking[] = (data || [])
          .filter(booking =>
            booking.time_slots &&
            Array.isArray(booking.time_slots) &&
            booking.time_slots.length > 0
          )
          .map(booking => ({
            id: booking.id,
            booking_date: booking.booking_date,
            time_slots: booking.time_slots,
            status: booking.status,
            type_id: booking.type_id
          }))

        setBookings(validBookings)
      }
    } catch (error) {
      console.error('❌ Error in refreshBookings:', error)
    }
  }, [supabase])

  // Helper para obtener disponibilidad por día
  const getWeeklyAvailability = useCallback((dayOfWeek: number): StudioAvailabilityDay | null => {
    return studioAvailability.get(dayOfWeek) || null
  }, [studioAvailability])

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      await Promise.all([
        refreshStudioAvailability(),
        refreshBookings()
      ])
      setIsLoading(false)
    }

    loadInitialData()
  }, [refreshStudioAvailability, refreshBookings])

  // 🔥 REAL-TIME SUBSCRIPTIONS
  useEffect(() => {
    let studioChannel: RealtimeChannel | null = null
    let bookingsChannel: RealtimeChannel | null = null

    const setupRealtimeSubscriptions = async () => {
      // Subscription para studio_availability
      studioChannel = supabase
        .channel('studio_availability_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'studio_availability'
          },
          (payload) => {
            refreshStudioAvailability()
          }
        )
        .subscribe()

      // Subscription para bookings
      bookingsChannel = supabase
        .channel('bookings_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'bookings'
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newBooking = payload.new as any
              if (newBooking.time_slots && ['confirmed', 'pending'].includes(newBooking.status)) {
                setBookings(prev => [...prev, {
                  id: newBooking.id,
                  booking_date: newBooking.booking_date,
                  time_slots: newBooking.time_slots,
                  status: newBooking.status,
                  type_id: newBooking.type_id
                }])
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedBooking = payload.new as any
              setBookings(prev => prev.map(b =>
                b.id === updatedBooking.id
                  ? {
                      id: updatedBooking.id,
                      booking_date: updatedBooking.booking_date,
                      time_slots: updatedBooking.time_slots,
                      status: updatedBooking.status,
                      type_id: updatedBooking.type_id
                    }
                  : b
              ).filter(b => ['confirmed', 'pending'].includes(b.status)))
            } else if (payload.eventType === 'DELETE') {
              const deletedBooking = payload.old as any
              setBookings(prev => prev.filter(b => b.id !== deletedBooking.id))
            }
          }
        )
        .subscribe()
    }

    setupRealtimeSubscriptions()

    // Cleanup
    return () => {
      if (studioChannel) {
        supabase.removeChannel(studioChannel)
      }
      if (bookingsChannel) {
        supabase.removeChannel(bookingsChannel)
      }
    }
  }, [supabase, refreshStudioAvailability])

  return (
    <AvailabilityContext.Provider
      value={{
        cache,
        setCache,
        getCache,
        clearCache,
        studioAvailability,
        bookings,
        isLoading,
        getWeeklyAvailability,
        refreshStudioAvailability,
        refreshBookings,
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

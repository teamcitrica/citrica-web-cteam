'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/shared/context/supabase-context'

interface Booking {
  id: string
  booking_date: string
  time_slots: string[]
  status: string
}

export const useBookingsAvailability = () => {
  const { supabase } = useSupabase()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Definir todos los horarios disponibles
  const allTimeSlots = [
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM'
  ]

  // Obtener todas las reservas activas (tanto de clientes como bloqueos)
  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('bookings')
        .select('id, booking_date, time_slots, status, type_id')
        .neq('status', 'cancelled')
        .not('booking_date', 'is', null)

      if (error) {
        console.error('Error fetching bookings:', error)
        return []
      }

      // Filtrar solo las reservas con time_slots válidos
      const validBookings: Booking[] = (data || [])
        .filter(booking =>
          booking.time_slots &&
          Array.isArray(booking.time_slots) &&
          booking.time_slots.length > 0 &&
          !booking.time_slots.includes('00:00') // Excluir bloqueos de día completo
        )
        .map(booking => ({
          id: booking.id,
          booking_date: booking.booking_date,
          time_slots: booking.time_slots,
          status: booking.status
        }))

      setBookings(validBookings)
      return validBookings
    } catch (error) {
      console.error('Error in fetchBookings:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Obtener horarios ocupados para una fecha específica
  const getOccupiedSlots = useCallback((date: string): string[] => {
    if (!date) return []

    const occupiedSlots = bookings
      .filter(booking => {
        // Comparar solo la fecha (sin hora)
        const bookingDate = new Date(booking.booking_date).toISOString().split('T')[0]
        const selectedDate = new Date(date).toISOString().split('T')[0]
        return bookingDate === selectedDate
      })
      .flatMap(booking => booking.time_slots)

    return occupiedSlots
  }, [bookings])

  // Verificar si una fecha tiene todos los horarios ocupados
  const isDateFullyBooked = useCallback((date: string): boolean => {
    if (!date) return false

    const occupiedSlots = getOccupiedSlots(date)
    return occupiedSlots.length >= allTimeSlots.length
  }, [getOccupiedSlots, allTimeSlots.length])

  // Obtener horarios disponibles para una fecha
  const getAvailableSlots = useCallback((date: string): string[] => {
    if (!date) return allTimeSlots

    const occupiedSlots = getOccupiedSlots(date)
    return allTimeSlots.filter(slot => !occupiedSlots.includes(slot))
  }, [getOccupiedSlots, allTimeSlots])

  // Cargar reservas al montar el componente
  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  return {
    bookings,
    isLoading,
    allTimeSlots,
    fetchBookings,
    getOccupiedSlots,
    getAvailableSlots,
    isDateFullyBooked
  }
}

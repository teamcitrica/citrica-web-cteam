'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/shared/context/supabase-context'
import { useServerTime } from '@/hooks/use-server-time'

interface Booking {
  id: string
  booking_date: string
  time_slots: string[]
  status: string
  type_id: number
}

interface TimeSlot {
  slot: string
  active: boolean
}

interface StudioConfig {
  user_display_mode: '30min' | '1hour'
  allow_multiple_time_slots: boolean
}

export const useBookingsAvailability = () => {
  const { supabase } = useSupabase()
  const { serverToday, serverHours, serverMinutes } = useServerTime()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [studioConfig, setStudioConfig] = useState<StudioConfig>({
    user_display_mode: '1hour',
    allow_multiple_time_slots: true
  })

  // Mapeo de slots de 30 minutos a formato de usuario
  const convertSlotToUserFormat = (slot: string): string => {
    // Convertir "10:00" a "10:00 AM - 11:00 AM" (formato 1 hora)
    // o "10:00 AM - 10:30 AM" (formato 30 minutos)
    const [hours, minutes] = slot.split(':').map(Number)

    const formatTime = (h: number, m: number) => {
      const period = h >= 12 ? 'PM' : 'AM'
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
      return `${displayHour}:${String(m).padStart(2, '0')} ${period}`
    }

    if (studioConfig.user_display_mode === '1hour') {
      // Solo mostrar slots en punto (00:00)
      if (minutes === 0) {
        const endHour = hours + 1
        return `${formatTime(hours, 0)} - ${formatTime(endHour, 0)}`
      }
      return '' // No mostrar slots de 30 minutos
    } else {
      // Mostrar todos los slots de 30 minutos
      const endMinutes = minutes + 30
      const endHour = endMinutes >= 60 ? hours + 1 : hours
      const finalMinutes = endMinutes >= 60 ? 0 : endMinutes
      return `${formatTime(hours, minutes)} - ${formatTime(endHour, finalMinutes)}`
    }
  }

  // Convertir formato de usuario a slots de 30 minutos
  const convertUserFormatToSlots = (userSlot: string): string[] => {
    // "10:00 AM - 11:00 AM" -> ["10:00", "10:30"]
    // "1:00 PM - 2:00 PM" -> ["13:00", "13:30"]
    console.log('🔄 Convirtiendo slot:', userSlot);

    const match = userSlot.match(/(\d+):(\d+)\s+(AM|PM)/)
    if (!match) {
      console.error('❌ No se pudo parsear el slot:', userSlot);
      return []
    }

    const hours = parseInt(match[1])
    const minutes = parseInt(match[2])
    const period = match[3]

    let hour24 = hours
    if (period === 'PM' && hours !== 12) {
      hour24 = hours + 12
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0
    }

    const firstSlot = `${String(hour24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    const slots = [firstSlot]

    if (studioConfig.user_display_mode === '1hour') {
      // Incluir el siguiente slot de 30 minutos
      const secondSlot = `${String(hour24).padStart(2, '0')}:30`
      slots.push(secondSlot)
    }

    console.log('✅ Slots convertidos:', slots);
    return slots
  }

  // Cargar configuración del estudio
  const loadStudioConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('studio_config')
        .select('user_display_mode, allow_multiple_time_slots')
        .single()

      if (error) {
        console.log('No config found, using defaults')
        return
      }

      if (data) {
        setStudioConfig({
          user_display_mode: data.user_display_mode || '1hour',
          allow_multiple_time_slots: data.allow_multiple_time_slots ?? true
        })
      }
    } catch (error) {
      console.error('Error loading studio config:', error)
    }
  }, [supabase])

  // Obtener todas las reservas activas y bloqueos administrativos
  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('bookings')
        .select('id, booking_date, time_slots, status, type_id')
        .in('status', ['confirmed', 'pending']) // Incluir confirmadas y pendientes
        .not('booking_date', 'is', null)

      if (error) {
        console.error('Error fetching bookings:', error)
        return []
      }

      // Incluir tanto reservas de clientes (type_id=1) como bloqueos administrativos (type_id=2)
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
      return validBookings
    } catch (error) {
      console.error('Error in fetchBookings:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Obtener configuración semanal base para una fecha específica
  const getWeeklyAvailabilityForDate = useCallback(async (date: string) => {
    try {
      const targetDate = new Date(date + 'T00:00:00')
      const dayOfWeek = targetDate.getDay()

      const { data, error } = await supabase
        .from('studio_availability')
        .select('is_active, time_slots')
        .eq('day_of_week', dayOfWeek)
        .single()

      if (error || !data?.is_active) {
        return [] // Día no disponible
      }

      // Obtener solo los slots activos de la configuración semanal
      const activeSlots = (data.time_slots as TimeSlot[])
        .filter(slot => slot.active)
        .map(slot => slot.slot)

      return activeSlots
    } catch (error) {
      console.error('Error fetching weekly availability:', error)
      return []
    }
  }, [supabase])

  // Obtener slots disponibles base (desde configuración semanal)
  const getBaseAvailableSlots = useCallback(async (date: string) => {
    const weeklySlots = await getWeeklyAvailabilityForDate(date)

    // Convertir a formato de usuario
    const userFormatSlots = weeklySlots
      .map(slot => convertSlotToUserFormat(slot))
      .filter(slot => slot !== '') // Filtrar slots vacíos

    return userFormatSlots
  }, [getWeeklyAvailabilityForDate, studioConfig.user_display_mode])

  // Obtener horarios ocupados o bloqueados para una fecha específica
  const getOccupiedSlots = useCallback((date: string): string[] => {
    if (!date) return []

    // La fecha ya viene en formato YYYY-MM-DD como string
    const dateStr = date

    const occupiedInternalSlots = bookings
      .filter(booking => {
        // Comparar directamente el string de fecha (viene en formato YYYY-MM-DD)
        const bookingDate = booking.booking_date
        return bookingDate === dateStr
      })
      .flatMap(booking => {
        // Si es un bloqueo de día completo (00:00), bloquear todo
        if (booking.time_slots.includes('00:00')) {
          // Retornar todos los slots posibles en formato interno
          const allSlots = []
          for (let h = 0; h < 24; h++) {
            allSlots.push(`${String(h).padStart(2, '0')}:00`)
            allSlots.push(`${String(h).padStart(2, '0')}:30`)
          }
          return allSlots
        }
        return booking.time_slots
      })

    // Convertir slots internos a formato de usuario
    const occupiedUserSlots = occupiedInternalSlots
      .map(slot => convertSlotToUserFormat(slot))
      .filter(slot => slot !== '')

    return Array.from(new Set(occupiedUserSlots)) // Eliminar duplicados
  }, [bookings, studioConfig.user_display_mode])

  // Verificar si una fecha tiene todos los horarios ocupados o bloqueados
  const isDateFullyBooked = useCallback(async (date: string): Promise<boolean> => {
    if (!date) return false

    // La fecha ya viene en formato YYYY-MM-DD como string
    const dateStr = date

    // Verificar si hay un bloqueo de día completo
    const dayBlocks = bookings.filter(booking => {
      // Comparar directamente el string de fecha
      const bookingDate = booking.booking_date
      return bookingDate === dateStr && booking.time_slots.includes('00:00')
    })

    if (dayBlocks.length > 0) return true

    // Verificar si todos los slots disponibles están ocupados
    const availableSlots = await getBaseAvailableSlots(date)
    const occupiedSlots = getOccupiedSlots(date)

    if (availableSlots.length === 0) return true
    return availableSlots.every(slot => occupiedSlots.includes(slot))
  }, [bookings, getBaseAvailableSlots, getOccupiedSlots])

  // Obtener horarios disponibles para una fecha (considerando configuración semanal y bloqueos)
  const getAvailableSlots = useCallback(async (date: string): Promise<string[]> => {
    if (!date) return []

    const baseSlots = await getBaseAvailableSlots(date)
    const occupiedSlots = getOccupiedSlots(date)

    let availableSlots = baseSlots.filter(slot => !occupiedSlots.includes(slot))

    // Filtrar horarios pasados si la fecha seleccionada es HOY
    if (serverToday && serverHours !== null && serverMinutes !== null) {
      // Parsear la fecha para compararla con serverToday
      const [year, month, day] = date.split('-').map(Number)

      // Comparar si la fecha seleccionada es hoy
      const isToday = year === serverToday.year &&
                     month === serverToday.month &&
                     day === serverToday.day

      if (isToday) {
        // Filtrar horarios que ya pasaron
        availableSlots = availableSlots.filter(slot => {
          // Extraer la hora de inicio del slot (formato: "10:00 AM - 11:00 AM")
          const match = slot.match(/(\d+):(\d+)\s+(AM|PM)/)
          if (!match) return true

          const hours = parseInt(match[1])
          const minutes = parseInt(match[2])
          const period = match[3]

          // Convertir a formato 24 horas
          let hour24 = hours
          if (period === 'PM' && hours !== 12) {
            hour24 = hours + 12
          } else if (period === 'AM' && hours === 12) {
            hour24 = 0
          }

          // Comparar con la hora actual del servidor
          if (hour24 > serverHours) return true
          if (hour24 === serverHours && minutes > serverMinutes) return true
          return false
        })
      }
    }

    return availableSlots
  }, [getBaseAvailableSlots, getOccupiedSlots, serverToday, serverHours, serverMinutes])

  // Cargar configuración y reservas al montar
  useEffect(() => {
    loadStudioConfig()
    fetchBookings()
  }, [loadStudioConfig, fetchBookings])

  return {
    bookings,
    isLoading,
    studioConfig,
    fetchBookings,
    getOccupiedSlots,
    getAvailableSlots,
    isDateFullyBooked,
    loadStudioConfig,
    convertUserFormatToSlots,
    serverToday,
    serverHours,
    serverMinutes
  }
}

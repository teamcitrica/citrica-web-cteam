'use client'

import { useState, useCallback } from 'react'
import { useSupabase } from '@/shared/context/supabase-context'

export interface TimeSlot {
  slot: string
  active: boolean
}

export interface WeeklyAvailability {
  id: string
  day_of_week: number
  is_active: boolean
  time_slots: TimeSlot[]
}

export interface BlockedPeriod {
  id: string
  start_date: string
  end_date: string
  reason: string
  created_at: string
}

export const useAdminBookings = () => {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([])
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability[]>([])

  // Obtener todos los períodos bloqueados
  const getBlockedPeriods = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('type_id', 2) // type_id 2 = bloqueos administrativos
        .neq('status', 'cancelled')
        .order('booking_date', { ascending: true })

      if (error) {
        console.error('Error fetching blocked periods:', error)
        return { success: false, error }
      }

      setBlockedPeriods(data || [])
      return { success: true, data }
    } catch (error) {
      console.error('Error in getBlockedPeriods:', error)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Crear un período bloqueado (día completo)
  const createBlockedPeriod = useCallback(
    async (startDate: string, endDate: string, reason: string) => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .insert({
            booking_date: startDate,
            time_slots: ['00:00'], // 00:00 indica bloqueo de día completo
            type_id: 2, // Bloqueo administrativo
            status: 'confirmed',
            name: 'Administrador',
            email: 'admin@system.com',
            message: reason,
          })
          .select()

        if (error) {
          console.error('Error creating blocked period:', error)
          return { success: false, error }
        }

        await getBlockedPeriods()
        return { success: true, data }
      } catch (error) {
        console.error('Error in createBlockedPeriod:', error)
        return { success: false, error }
      }
    },
    [supabase, getBlockedPeriods]
  )

  // Crear un bloqueo de slot específico
  const createSlotBlock = useCallback(
    async (date: string, timeSlot: string, reason: string) => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .insert({
            booking_date: date,
            time_slots: [timeSlot],
            type_id: 2, // Bloqueo administrativo
            status: 'confirmed',
            name: 'Administrador',
            email: 'admin@system.com',
            message: reason,
          })
          .select()

        if (error) {
          console.error('Error creating slot block:', error)
          return { success: false, error }
        }

        await getBlockedPeriods()
        return { success: true, data }
      } catch (error) {
        console.error('Error in createSlotBlock:', error)
        return { success: false, error }
      }
    },
    [supabase, getBlockedPeriods]
  )

  // Eliminar un período bloqueado
  const deleteBlockedPeriod = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting blocked period:', error)
          return { success: false, error }
        }

        await getBlockedPeriods()
        return { success: true }
      } catch (error) {
        console.error('Error in deleteBlockedPeriod:', error)
        return { success: false, error }
      }
    },
    [supabase, getBlockedPeriods]
  )

  // Obtener configuración semanal
  const getWeeklyAvailability = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('studio_availability')
        .select('*')
        .order('day_of_week', { ascending: true })

      if (error) {
        console.error('Error fetching weekly availability:', error)
        return { success: false, error }
      }

      setWeeklyAvailability(data || [])
      return { success: true, data }
    } catch (error) {
      console.error('Error in getWeeklyAvailability:', error)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Actualizar disponibilidad de un día
  const updateDayAvailability = useCallback(
    async (
      dayOfWeek: number,
      isActive: boolean,
      timeSlots?: TimeSlot[]
    ) => {
      try {
        // Primero intentar actualizar
        const updateData: any = { is_active: isActive }
        if (timeSlots) {
          updateData.time_slots = timeSlots
        }

        const { data: existingData, error: fetchError } = await supabase
          .from('studio_availability')
          .select('*')
          .eq('day_of_week', dayOfWeek)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching day availability:', fetchError)
          return { success: false, error: fetchError }
        }

        if (existingData) {
          // Actualizar registro existente
          const { error } = await supabase
            .from('studio_availability')
            .update(updateData)
            .eq('day_of_week', dayOfWeek)

          if (error) {
            console.error('Error updating day availability:', error)
            return { success: false, error }
          }
        } else {
          // Crear nuevo registro
          const { error } = await supabase
            .from('studio_availability')
            .insert({
              day_of_week: dayOfWeek,
              is_active: isActive,
              time_slots: timeSlots || [],
            })

          if (error) {
            console.error('Error inserting day availability:', error)
            return { success: false, error }
          }
        }

        await getWeeklyAvailability()
        return { success: true }
      } catch (error) {
        console.error('Error in updateDayAvailability:', error)
        return { success: false, error }
      }
    },
    [supabase, getWeeklyAvailability]
  )

  // Alternar un slot de tiempo específico
  const toggleTimeSlot = useCallback(
    async (dayOfWeek: number, timeSlot: string, isActive: boolean) => {
      try {
        const { data: dayConfig, error: fetchError } = await supabase
          .from('studio_availability')
          .select('*')
          .eq('day_of_week', dayOfWeek)
          .single()

        if (fetchError) {
          console.error('Error fetching day config:', fetchError)
          return { success: false, error: fetchError }
        }

        const updatedSlots = dayConfig.time_slots.map((slot: TimeSlot) =>
          slot.slot === timeSlot ? { ...slot, active: isActive } : slot
        )

        const { error } = await supabase
          .from('studio_availability')
          .update({ time_slots: updatedSlots })
          .eq('day_of_week', dayOfWeek)

        if (error) {
          console.error('Error toggling time slot:', error)
          return { success: false, error }
        }

        await getWeeklyAvailability()
        return { success: true }
      } catch (error) {
        console.error('Error in toggleTimeSlot:', error)
        return { success: false, error }
      }
    },
    [supabase, getWeeklyAvailability]
  )

  // Aplicar preset semanal
  const applyWeeklyPreset = useCallback(
    async (config: any) => {
      try {
        setIsLoading(true)

        // Si el preset tiene configuración para "everyday"
        if (config.everyday) {
          const { start, end, active } = config.everyday

          // Aplicar a todos los días de la semana (0-6)
          for (let day = 0; day <= 6; day++) {
            // Generar slots de 30 minutos entre start y end
            const timeSlots: TimeSlot[] = []
            const [startHour, startMin] = start.split(':').map(Number)
            const [endHour, endMin] = end.split(':').map(Number)

            for (let hour = 0; hour < 24; hour++) {
              for (let min = 0; min < 60; min += 30) {
                const slotTime = hour * 60 + min
                const startTime = startHour * 60 + startMin
                const endTime = endHour * 60 + endMin

                const slot = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
                const isActive = slotTime >= startTime && slotTime < endTime && active

                timeSlots.push({ slot, active: isActive })
              }
            }

            await updateDayAvailability(day, active, timeSlots)
          }
        }

        return { success: true }
      } catch (error) {
        console.error('Error applying weekly preset:', error)
        return { success: false, error }
      } finally {
        setIsLoading(false)
      }
    },
    [updateDayAvailability]
  )

  // Activar/Desactivar período por lotes
  const togglePeriodBatch = useCallback(
    async (startDate: string, endDate: string, action: 'activate' | 'deactivate') => {
      try {
        setIsLoading(true)

        if (action === 'deactivate') {
          // Crear bloqueo para el período completo
          const start = new Date(startDate)
          const end = new Date(endDate)

          // Crear un bloqueo para cada día en el rango
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0]
            await createBlockedPeriod(dateStr, dateStr, `Período bloqueado: ${startDate} a ${endDate}`)
          }
        } else {
          // Eliminar todos los bloqueos en el período
          const { data: blocksToRemove, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('type_id', 2)
            .gte('booking_date', startDate)
            .lte('booking_date', endDate)
            .neq('status', 'cancelled')

          if (error) {
            console.error('Error fetching blocks to remove:', error)
            return { success: false, error }
          }

          if (blocksToRemove && blocksToRemove.length > 0) {
            for (const block of blocksToRemove) {
              await deleteBlockedPeriod(block.id)
            }
          }
        }

        await getBlockedPeriods()
        return { success: true }
      } catch (error) {
        console.error('Error in togglePeriodBatch:', error)
        return { success: false, error }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, createBlockedPeriod, deleteBlockedPeriod, getBlockedPeriods]
  )

  // Cerrar todo (emergencia)
  const emergencyCloseAll = useCallback(
    async () => {
      try {
        setIsLoading(true)

        // Desactivar todos los días de la semana
        for (let day = 0; day <= 6; day++) {
          await updateDayAvailability(day, false)
        }

        return { success: true }
      } catch (error) {
        console.error('Error in emergencyCloseAll:', error)
        return { success: false, error }
      } finally {
        setIsLoading(false)
      }
    },
    [updateDayAvailability]
  )

  return {
    isLoading,
    blockedPeriods,
    weeklyAvailability,
    getBlockedPeriods,
    createBlockedPeriod,
    createSlotBlock,
    deleteBlockedPeriod,
    getWeeklyAvailability,
    updateDayAvailability,
    toggleTimeSlot,
    applyWeeklyPreset,
    togglePeriodBatch,
    emergencyCloseAll,
  }
}

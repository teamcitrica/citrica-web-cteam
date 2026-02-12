'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/shared/context/supabase-context'

export type ReservaEstado = 'confirmed' | 'cancelled' | 'pending' | 'reminder'

export interface Reserva {
  id: string
  name: string
  email: string
  message: string
  description?: string
  booking_date: string | null
  time_slots: string[]
  status: ReservaEstado
  type_id: number
  created_at: string
}

export const useReservas = () => {
  const { supabase } = useSupabase()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshFlag, setRefreshFlag] = useState(0)

  // Increment flag to trigger a refetch
  const refreshReservas = useCallback(() => {
    setRefreshFlag((prev) => prev + 1)
  }, [])

  const fetchReservas = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('type_id', 1) // Solo reservas de clientes (no bloqueos administrativos)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error al obtener reservas:', fetchError)
        console.error('Detalles del error:', {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code,
        })
        return
      }
      setReservas(data || [])
    } catch (err) {
      console.error('Error en fetchReservas:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Fetch on mount and whenever refreshReservas is called
  useEffect(() => {
    fetchReservas()
  }, [fetchReservas, refreshFlag])

  const deleteReserva = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error al eliminar reserva:', error)
          return { error }
        }

        refreshReservas()
        return { error: null }
      } catch (err) {
        console.error('Error en deleteReserva:', err)
        return { error: err }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, refreshReservas]
  )

  const updateReservaStatus = useCallback(
    async (id: string, status: ReservaEstado) => {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ status })
          .eq('id', id)

        if (error) {
          console.error('Error al actualizar estado de reserva:', error)
          return { error }
        }

        refreshReservas()
        return { error: null }
      } catch (err) {
        console.error('Error en updateReservaStatus:', err)
        return { error: err }
      }
    },
    [supabase, refreshReservas]
  )

  const createReminder = useCallback(
    async (data: { name: string; booking_date: string; time_slots: string[]; message?: string; description?: string }) => {
      try {
        setIsLoading(true)
        const { error } = await supabase
          .from('bookings')
          .insert([{
            name: data.name,
            booking_date: data.booking_date,
            time_slots: data.time_slots,
            message: data.message || '',
            description: data.description || '',
            email: '',
            status: 'reminder' as ReservaEstado,
            type_id: 1,
          }])

        if (error) {
          console.error('Error al crear recordatorio:', error)
          return { error }
        }

        refreshReservas()
        return { error: null }
      } catch (err) {
        console.error('Error en createReminder:', err)
        return { error: err }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, refreshReservas]
  )

  const updateReserva = useCallback(
    async (id: string, data: Partial<Pick<Reserva, 'name' | 'email' | 'message' | 'description' | 'booking_date' | 'time_slots' | 'status'>>) => {
      try {
        setIsLoading(true)
        const { error } = await supabase
          .from('bookings')
          .update(data)
          .eq('id', id)

        if (error) {
          console.error('Error al actualizar reserva:', error)
          return { error }
        }

        refreshReservas()
        return { error: null }
      } catch (err) {
        console.error('Error en updateReserva:', err)
        return { error: err }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, refreshReservas]
  )

  return {
    reservas,
    isLoading,
    refreshReservas,
    fetchReservas,
    deleteReserva,
    updateReservaStatus,
    updateReserva,
    createReminder,
  }
}

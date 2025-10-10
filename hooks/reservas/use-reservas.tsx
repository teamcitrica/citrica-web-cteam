'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/shared/context/supabase-context'

export type ReservaEstado = 'pendiente' | 'confirmada' | 'cancelada'

export interface Reserva {
  id: string
  name: string
  email: string
  message: string
  date: string | null
  time_slot: string | null
  status: ReservaEstado
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
        .from('contact')
        .select('*')
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
          .from('contact')
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
          .from('contact')
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

  return {
    reservas,
    isLoading,
    refreshReservas,
    fetchReservas,
    deleteReserva,
    updateReservaStatus,
  }
}

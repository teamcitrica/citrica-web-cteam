'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/shared/context/supabase-context'

export interface Lead {
  id: string
  name: string
  email: string
  message: string
  time_slot: string | null
  date: string | null
  status: string
  type_id: number
  created_at: string
  phone?: string
  phoneCode?: string
  origin?: string
}

export const useLeadsCRUD = () => {
  const { supabase } = useSupabase()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshFlag, setRefreshFlag] = useState(0)

  const refreshLeads = useCallback(() => {
    setRefreshFlag((prev) => prev + 1)
  }, [])

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('type_id', 2)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al obtener leads:', error)
        return
      }
      setLeads(data || [])
    } catch (err) {
      console.error('Error en fetchLeads:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads, refreshFlag])

  const deleteLead = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        const { error } = await supabase
          .from('leads')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error al eliminar lead:', error)
          return { error }
        }

        refreshLeads()
        return { error: null }
      } catch (err) {
        console.error('Error en deleteLead:', err)
        return { error: err }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, refreshLeads]
  )

  return {
    leads,
    isLoading,
    refreshLeads,
    deleteLead,
  }
}

'use client'

import { useState, useCallback } from 'react'
import { useSupabase } from '@/shared/context/supabase-context'

export interface LeadNote {
  id: number
  lead_id: number
  user_id: string
  note: string
  created_at: string
  user_email?: string
}

export const useLeadNotes = () => {
  const { supabase } = useSupabase()
  const [notes, setNotes] = useState<LeadNote[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotes = useCallback(async (leadId: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al obtener notas:', error)
        return
      }

      // Obtener email del usuario actual para identificar sus notas
      const { data: { user } } = await supabase.auth.getUser()
      const currentUserEmail = user?.email || ''

      const notesWithEmail = (data || []).map((n: LeadNote) => ({
        ...n,
        user_email: n.user_id === user?.id ? currentUserEmail : 'Admin',
      }))

      setNotes(notesWithEmail)
    } catch (err) {
      console.error('Error en fetchNotes:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const addNote = useCallback(async (leadId: string, note: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'No autenticado' }

      const { error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: parseInt(leadId),
          user_id: user.id,
          note,
        })

      if (error) {
        console.error('Error al agregar nota:', error)
        return { error }
      }

      await fetchNotes(leadId)
      return { error: null }
    } catch (err) {
      console.error('Error en addNote:', err)
      return { error: err }
    }
  }, [supabase, fetchNotes])

  const deleteNote = useCallback(async (noteId: number, leadId: string) => {
    try {
      const { error } = await supabase
        .from('lead_notes')
        .delete()
        .eq('id', noteId)

      if (error) {
        console.error('Error al eliminar nota:', error)
        return { error }
      }

      await fetchNotes(leadId)
      return { error: null }
    } catch (err) {
      console.error('Error en deleteNote:', err)
      return { error: err }
    }
  }, [supabase, fetchNotes])

  return {
    notes,
    isLoading,
    fetchNotes,
    addNote,
    deleteNote,
  }
}

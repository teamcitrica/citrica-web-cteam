'use client'

import { useCallback } from 'react'
import { useSupabase } from '@/shared/context/supabase-context'

export type UserDisplayMode = '30min' | '1hour'

export interface StudioConfigOptions {
  user_display_mode?: UserDisplayMode
  allow_multiple_time_slots?: boolean
}

export const useStudioConfig = () => {
  const { supabase } = useSupabase()

  // Obtener el modo de visualización para usuarios
  const getUserDisplayMode = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('studio_config')
        .select('user_display_mode')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user display mode:', error)
        return { success: false, error, mode: '1hour' as UserDisplayMode }
      }

      return {
        success: true,
        mode: (data?.user_display_mode as UserDisplayMode) || '1hour',
      }
    } catch (error) {
      console.error('Error in getUserDisplayMode:', error)
      return { success: false, error, mode: '1hour' as UserDisplayMode }
    }
  }, [supabase])

  // Actualizar el modo de visualización para usuarios
  const updateUserDisplayMode = useCallback(
    async (mode: UserDisplayMode) => {
      try {
        // Verificar si existe configuración
        const { data: existingConfig, error: fetchError } = await supabase
          .from('studio_config')
          .select('*')
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching config:', fetchError)
          return { success: false, error: fetchError }
        }

        if (existingConfig) {
          // Actualizar configuración existente
          const { error } = await supabase
            .from('studio_config')
            .update({ user_display_mode: mode })
            .eq('id', existingConfig.id)

          if (error) {
            console.error('Error updating user display mode:', error)
            return { success: false, error }
          }
        } else {
          // Crear nueva configuración
          const { error } = await supabase
            .from('studio_config')
            .insert({ user_display_mode: mode })

          if (error) {
            console.error('Error inserting user display mode:', error)
            return { success: false, error }
          }
        }

        return { success: true }
      } catch (error) {
        console.error('Error in updateUserDisplayMode:', error)
        return { success: false, error }
      }
    },
    [supabase]
  )

  // Obtener configuración de selección múltiple de horarios
  const getAllowMultipleTimeSlots = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('studio_config')
        .select('allow_multiple_time_slots')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching allow_multiple_time_slots:', error)
        return { success: false, error, allowed: true }
      }

      return {
        success: true,
        allowed: data?.allow_multiple_time_slots !== false, // Default true
      }
    } catch (error) {
      console.error('Error in getAllowMultipleTimeSlots:', error)
      return { success: false, error, allowed: true }
    }
  }, [supabase])

  // Actualizar configuración de selección múltiple de horarios
  const updateAllowMultipleTimeSlots = useCallback(
    async (allowed: boolean) => {
      try {
        // Verificar si existe configuración
        const { data: existingConfig, error: fetchError } = await supabase
          .from('studio_config')
          .select('*')
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching config:', fetchError)
          return { success: false, error: fetchError }
        }

        if (existingConfig) {
          // Actualizar configuración existente
          const { error } = await supabase
            .from('studio_config')
            .update({ allow_multiple_time_slots: allowed })
            .eq('id', existingConfig.id)

          if (error) {
            console.error('Error updating allow_multiple_time_slots:', error)
            return { success: false, error }
          }
        } else {
          // Crear nueva configuración
          const { error } = await supabase
            .from('studio_config')
            .insert({ allow_multiple_time_slots: allowed })

          if (error) {
            console.error('Error inserting allow_multiple_time_slots:', error)
            return { success: false, error }
          }
        }

        return { success: true }
      } catch (error) {
        console.error('Error in updateAllowMultipleTimeSlots:', error)
        return { success: false, error }
      }
    },
    [supabase]
  )

  // Obtener toda la configuración
  const getStudioConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('studio_config')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching studio config:', error)
        return {
          success: false,
          error,
          config: {
            user_display_mode: '1hour' as UserDisplayMode,
            allow_multiple_time_slots: true,
          },
        }
      }

      return {
        success: true,
        config: {
          user_display_mode: (data?.user_display_mode as UserDisplayMode) || '1hour',
          allow_multiple_time_slots: data?.allow_multiple_time_slots !== false,
        },
      }
    } catch (error) {
      console.error('Error in getStudioConfig:', error)
      return {
        success: false,
        error,
        config: {
          user_display_mode: '1hour' as UserDisplayMode,
          allow_multiple_time_slots: true,
        },
      }
    }
  }, [supabase])

  return {
    getUserDisplayMode,
    updateUserDisplayMode,
    getAllowMultipleTimeSlots,
    updateAllowMultipleTimeSlots,
    getStudioConfig,
  }
}

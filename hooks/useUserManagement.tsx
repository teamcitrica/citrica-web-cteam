// hooks/useUserManagement.ts - VERSIÓN CORREGIDA
'use client'
import { useSupabase } from '@/shared/context/supabase-context'
import { addToast } from "@heroui/toast"


export const useUserManagement = () => {
  const { supabase } = useSupabase()

  const updateUser = async (userId: string, updates: {
    first_name?: string
    last_name?: string
    role_id?: number
    phone?: string
    avatar_url?: string
    is_active?: boolean
  }) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()

    if (error) {
      addToast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        color: "danger",
      })
      return { success: false, error }
    }

    addToast({
      title: "Éxito",
      description: "Usuario actualizado correctamente",
      color: "success",
    })
    
    return { success: true, data }
  }



  // Actualizar perfil propio (usuario logueado)
  const updateMyProfile = async (updates: {
    first_name?: string
    last_name?: string
    phone?: string
    avatar_url?: string
  }) => {
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) {
      addToast({
        title: "Error",
        description: "No se pudo obtener la información del usuario",
        color: "danger",
      })
      return { success: false }
    }

    return await updateUser(userData.user.id, updates)
  }

  const getUserWithRole = async (userId?: string) => {
    const { data, error } = await supabase
      .rpc('get_user_with_role', { user_id: userId })
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    
    return data?.[0] || null
  }

  const deactivateUser = async (userId: string) => {
    const { data, error } = await supabase
      .rpc('deactivate_user', { user_id: userId })

    if (error) {
      addToast({
        title: "Error",
        description: "No se pudo desactivar el usuario",
        color: "danger",
      })
      return { success: false, error }
    }

    addToast({
      title: "Usuario desactivado",
      description: "El usuario ya no podrá iniciar sesión",
      color: "success",
    })
    
    return { success: true }
  }

  const deleteUser = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      addToast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        color: "danger",
      })
      return { success: false, error }
    }

    addToast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado completamente",
      color: "success",
    })
    
    return { success: true }
  }

  const getAllUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        roles(name, description)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting users:', error)
      return []
    }

    return data || []
  }

  const getRoles = async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('id')

    if (error) {
      console.error('Error getting roles:', error)
      return []
    }

    return data || []
  }

  return {
    getUserWithRole,
    updateUser,
    updateMyProfile,
    deactivateUser,
    deleteUser,
    getAllUsers,
    getRoles
  }
}
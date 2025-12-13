"use client";
import { useEffect, useState, useCallback } from "react";

import { useSupabase } from "@/shared/context/supabase-context";
import { UserType } from "@/shared/types/types";

export const useUserCRUD = () => {
  const { supabase } = useSupabase();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Leer: Traer todos los usuarios de la tabla
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("users")
         .select(`
        *,
        company:company_id (
          id,
          name
        ),
        role:role_id (
          id,
          name
        )
      `);

      if (error) {
        console.error("Error al obtener usuarios:", error);

        return;
      }

      // Obtener el conteo de accesos a proyectos para cada usuario
      const usersWithAccessCount = await Promise.all(
        (data || []).map(async (user) => {
          const { count } = await supabase
            .from("proyect_acces")
            .select("*", { count: "exact", head: true })
            .eq("users_id", user.id);

          return {
            ...user,
            user_metadata: {
              ...user.user_metadata,
              project_access_count: count || 0,
            },
          };
        })
      );

      setUsers(usersWithAccessCount);
    } catch (err) {
      console.error("Error en fetchUsers:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔹 Obtener usuario autenticado
  const fetchUserById = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*,role:name")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener usuario:", error);

        return null;
      }

      return data;
    } catch (err) {
      console.error("Error en fetchUserById:", err);

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Crear usuario con autenticación
  const createUser = async (
    newUser: Partial<UserType> & { password: string },
  ) => {
    try {
      setIsLoading(true);

      // 1️⃣ Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email!,
        password: newUser.password!,
        options: {
          data: {
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role_id: newUser.role_id,
          },
        },
      });

      if (authError) {
        console.error("Error al autenticar usuario:", authError);

        return;
      }

      // 2️⃣ Guardar usuario en la tabla 'users'
      const { data, error } = await supabase.from("users").insert([
        {
          id: authData.user?.id, // Asigna el ID de Auth
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          role_id: newUser.role_id,
          company_id: newUser.company_id,
        },
      ]);

      if (error) {
        console.error("Error al crear usuario en la BD:", error);

        return;
      }

      fetchUsers();

      return data;
    } catch (err) {
      console.error("Error en createUser:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Actualizar usuario
  const updateUser = async (id: string, updatedFields: Partial<UserType>) => {
    try {
      setIsLoading(true);

      // Remover campos que no deben ser actualizados directamente en la tabla users
      const safeFields = { ...updatedFields };
      delete (safeFields as any).password;
      delete (safeFields as any).user_metadata;
      delete (safeFields as any).name;
      delete (safeFields as any).role; // Eliminar el objeto role anidado
      delete (safeFields as any).avatar_url; // Por si acaso
      delete (safeFields as any).id; // No actualizar el ID
      delete (safeFields as any).created_at; // No actualizar created_at
      delete (safeFields as any).full_name; // Es una columna generada, no se puede actualizar

      console.log("🔵 Campos seguros a actualizar:", safeFields);
      console.log("🔵 ID del usuario a actualizar:", id);

      // Verificar usuario autenticado actual
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log("👤 Usuario autenticado actual:", currentUser?.id);

      // Verificar role_id del usuario actual
      const { data: currentUserData } = await supabase
        .from("users")
        .select("id, role_id, email")
        .eq("id", currentUser?.id)
        .single();
      console.log("🔑 Datos del usuario actual en la tabla:", currentUserData);

      const { data, error } = await supabase
        .from("users")
        .update(safeFields)
        .eq("id", id)
        .select();

      console.log("🟡 Respuesta de Supabase - data:", data);
      console.log("🟡 Respuesta de Supabase - error:", error);

      if (error) {
        console.error("❌ Error al actualizar usuario:", error);
        console.error("❌ Error completo:", JSON.stringify(error, null, 2));
        throw new Error(`Error al actualizar: ${error.message || JSON.stringify(error)}`);
      }

      if (!data || data.length === 0) {
        console.warn("⚠️ Actualización sin datos retornados - Posible problema de permisos RLS");
        throw new Error("No se pudo actualizar el usuario - sin datos retornados");
      }

      console.log("✅ Usuario actualizado correctamente:", data);
      await fetchUsers();

      return data;
    } catch (err: any) {
      console.error("❌ Error inesperado en updateUser:", err);
      console.error("❌ Error message:", err?.message);
      console.error("❌ Error stack:", err?.stack);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Eliminar usuario (hard delete - eliminación permanente de auth.users y public.users)
  const deleteUser = async (id: string) => {
    try {
      setIsLoading(true);

      console.log("🔴 Intentando eliminar usuario con ID:", id);

      // Llamar a la API Route que elimina de auth.users y public.users
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Error al eliminar usuario:", result.error);
        throw new Error(result.error || 'Error al eliminar usuario');
      }

      console.log("✅ Usuario eliminado correctamente de auth.users y public.users");
      await fetchUsers();

      return { success: true };
    } catch (err) {
      console.error("❌ Error en deleteUser:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Crear usuario por rol (usando API Route para no cerrar la sesión actual)
  const createUserByRole = async (user_data: any, role_id: string) => {
    try {
      setIsLoading(true);
      console.log("Creating user with role_id:", role_id);

      // Llamar a la API Route que usa Service Role Key
      // Esto NO cierra la sesión del usuario actual
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user_data.email,
          password: user_data.password,
          first_name: user_data.first_name,
          last_name: user_data.last_name,
          role_id: Number(role_id),
          company_id: user_data.company_id ? Number(user_data.company_id) : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Error creating user:", result.error);
        throw new Error(result.error || 'Error al crear usuario');
      }

      console.log("✅ Usuario creado exitosamente:", result.user?.id);

      // Refrescar la lista de usuarios
      await fetchUsers();

      return { data: result.user, error: null };
    } catch (err: any) {
      console.error("Error en createUserByRole:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Actualizar usuario por rol (usando API Route con Service Role Key)
  const updateUserByRole = async (user_id: string, user_data: Partial<UserType>, role_id: string) => {
    try {
      setIsLoading(true);

      if (!user_id) {
        throw new Error("user_id es requerido");
      }

      if (!role_id) {
        throw new Error("role_id es requerido");
      }

      // Preparar datos a actualizar
      const updatePayload: any = {
        role_id: Number(role_id),
      };

      if (user_data) {
        if (user_data.first_name !== undefined) updatePayload.first_name = user_data.first_name;
        if (user_data.last_name !== undefined) updatePayload.last_name = user_data.last_name;
        if (user_data.email !== undefined) updatePayload.email = user_data.email;
        if (user_data.company_id !== undefined) updatePayload.company_id = user_data.company_id;
        if (user_data.active_users !== undefined) updatePayload.active_users = user_data.active_users;
      }

      console.log("🟢 Actualizando usuario con ID:", user_id);
      console.log("🟢 Payload a actualizar:", updatePayload);

      // Llamar a la API Route que usa Service Role Key
      const response = await fetch('/api/admin/update-user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          user_data: updatePayload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Error al actualizar usuario:", result.error);
        throw new Error(result.error || 'Error al actualizar usuario');
      }

      console.log("✅ Usuario actualizado exitosamente:", result.user);
      await fetchUsers();

      return { data: result.user, error: null };
    } catch (err: any) {
      console.error("Error inesperado en updateUserByRole:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Recuperar contraseña
  const getPasswordRecovery = async (email: string) => {
    try {
      return await supabase.auth.resetPasswordForEmail(email);
    } catch (err) {
      console.error("Error al recuperar la contraseña", err);
      throw err;
    }
  };

  // 🔹 Cambiar contraseña
  const setPassword = async (new_password: string, accessToken: string, refreshToken: string) => {
    try {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      return await supabase.auth.updateUser({ password: new_password });
    } catch (err) {
      console.error("Error al actualizar la contraseña:", err);
      throw err;
    }
  };

  // 🔹 Refresh function (alias de fetchUsers con useCallback para evitar loops)
  const refreshUsers = useCallback(async () => {
    console.log("🔵 refreshUsers llamado, ejecutando fetchUsers...");
    await fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    fetchUsers,
    refreshUsers,
    fetchUserById,
    createUser,
    createUserByRole,
    updateUser,
    updateUserByRole,
    deleteUser,
    getPasswordRecovery,
    setPassword,
  };
};

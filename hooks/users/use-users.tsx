"use client";
import { useEffect, useState } from "react";

import { useSupabase } from "@/shared/context/supabase-context";
import { UserType } from "@/shared/types/types";

export const useUserCRUD = () => {
  const { supabase } = useSupabase();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Leer: Traer todos los usuarios de la tabla
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*,role:roles(name)");

      if (error) {
        console.error("Error al obtener usuarios:", error);

        return;
      }
      setUsers(data);
    } catch (err) {
      console.error("Error en fetchUsers:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
      const { data, error } = await supabase
        .from("users")
        .update(updatedFields)
        .eq("id", id);

      if (error) {
        console.log("error creando usuario");
        console.error("Error al actualizar usuario:", error);

        return;
      }

      fetchUsers();
      console.log("llamando usuarios despues de creacion");

      return data;
    } catch (err) {
      console.log("error update usuario");
      console.error("Error en updateUser:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Eliminar usuario (también de Supabase Auth)
  const deleteUser = async (id: string) => {
    try {
      setIsLoading(true);

      // 1️⃣ Eliminar de Supabase Auth (requiere servicio de admin)
      const { error: authError } = await supabase.auth.admin.deleteUser(id);

      if (authError) {
        console.error("Error al eliminar usuario en Auth:", authError);

        return;
      }

      // 2️⃣ Eliminar de la tabla 'users'
      const { error } = await supabase.from("users").delete().eq("id", id);

      if (error) {
        console.error("Error al eliminar usuario en la BD:", error);

        return;
      }

      fetchUsers();
    } catch (err) {
      console.error("Error en deleteUser:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};

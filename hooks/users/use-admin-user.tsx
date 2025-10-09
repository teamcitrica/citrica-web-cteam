import { useEffect, useState, useCallback } from "react";

import { useUserCRUD } from "./use-users";

import { useSupabase } from "@/shared/context/supabase-context";
import { UserType, NewUserType } from "@/shared/types/types";

export const useAdminUser = () => {
  const [error, setError] = useState("");
  const { updateUser } = useUserCRUD();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();
  const [refreshFlag, setRefreshFlag] = useState(0);

  // Increment flag to trigger a refetch
  const refreshUsers = useCallback(() => {
    setRefreshFlag((prev) => prev + 1);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*, role:roles(name)");

      if (fetchError) {
        console.error("Error al obtener usuarios:", fetchError);
        console.error("Detalles del error:", {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code,
        });

        return;
      }
      setUsers(data || []);
    } catch (err) {
      console.error("Error en fetchUsers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Fetch on mount and whenever refreshUsers is called
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshFlag]);

  // Create user - SOLO crear en auth, el trigger hace el resto
  const createUserByRole = useCallback(
    async (user_data: NewUserType, role_id: string) => {
      setIsLoading(true);
      try {
        console.log("Creating user with role_id:", role_id);

        // Registrar usuario con signUp - el trigger de Supabase insertará automáticamente en public.users
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: user_data.email,
          password: user_data.password,
          options: {
            emailRedirectTo: undefined,
            data: {
              first_name: user_data.first_name,
              last_name: user_data.last_name,
              role_id: Number(role_id),
            },
          },
        });

        // Verificar si hay error crítico (no el de email validation que es solo advertencia)
        if (signUpError && !signUpError.message?.includes("validate email")) {
          console.error("Error creating user in auth:", signUpError);
          setError(signUpError.message || "Error al crear usuario");
          setIsLoading(false);

          return { data: null, error: signUpError };
        }

        // Si hay error de validación de email pero el usuario fue creado, solo advertir
        if (signUpError) {
          console.warn("Email validation warning (user was created):", signUpError.message);
        }

        console.log("User created in auth.users:", authData?.user?.id);
        console.log("Trigger will insert user into public.users automatically");

        // Esperar a que el trigger inserte el registro en public.users
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsLoading(false);
        refreshUsers();

        return { data: authData, error: null };
      } catch (err) {
        console.error("Error en createUserByRole:", err);
        setError("Error inesperado al crear usuario");
        setIsLoading(false);

        return { data: null, error: err };
      }
    },
    [refreshUsers, supabase],
  );

  // Update user and refresh list
  const updateUserByRole = useCallback(
    async (user_id?: string, user_data?: UserType, role_id?: string) => {
      setIsLoading(true);
      try {
        if (!user_id) {
          return { data: null, error: new Error("user_id es requerido") };
        }

        // Actualizar en public.users
        const publicPayload: Partial<UserType> = {
          role_id: Number(role_id),
          updated_at: new Date().toISOString(),
        };

        if (user_data) {
          Object.assign(publicPayload, {
            first_name: user_data.first_name,
            last_name: user_data.last_name,
            email: user_data.email,
            full_name: `${user_data.first_name} ${user_data.last_name}`,
          });
        }

        console.log("Updating user with payload:", publicPayload);

        await updateUser(user_id, publicPayload);
        refreshUsers();

        return { data: null, error: null };
      } catch (err) {
        console.error("Error en updateUserByRole:", err);

        return { data: null, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [updateUser, refreshUsers],
  );

  // Other utilities
  const getPasswordRecovery = useCallback(
    async (email: string) => {
      try {
        return await supabase.auth.resetPasswordForEmail(email);
      } catch (err) {
        console.error("Error al recuperar la contraseña", err);
      }
    },
    [supabase.auth],
  );

  const setPassword = useCallback(
    async (new_password: string, accessToken: string, refreshToken: string) => {
      try {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        return await supabase.auth.updateUser({ password: new_password });
      } catch (err) {
        console.error("Error al actualizar la contraseña:", err);
      }
    },
    [supabase.auth],
  );

  return {
    users,
    isLoading,
    refreshUsers,
    fetchUsers,
    createUserByRole,
    updateUserByRole,
    getPasswordRecovery,
    setPassword,
    error,
  };
};

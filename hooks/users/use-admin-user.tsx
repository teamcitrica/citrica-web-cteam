import { createClient } from "@supabase/supabase-js";
import { useEffect, useState, useCallback } from "react";

import { useUserCRUD } from "./use-users";

import { useSupabase } from "@/shared/context/supabase-context";
import { UserType, NewUserType } from "@/shared/types/types";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service_role_key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;
let adminAuthClient: any = null;

if (supabase_url && service_role_key) {
  const supabase = createClient(supabase_url, service_role_key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  adminAuthClient = supabase.auth.admin;
}

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
        console.log(
          "Creating user with role_id:",
          role_id,
          "type:",
          typeof role_id,
        );

        const payload = {
          email: user_data.email,
          password: user_data.password,
          email_confirm: true,
          user_metadata: {
            name: `${user_data.first_name} ${user_data.last_name}`,
            first_name: user_data.first_name,
            last_name: user_data.last_name,
            role_id: Number(role_id),
            is_switchable: user_data.is_switchable || false,
            email_verified: true,
          },
        };

        console.log("Auth payload:", JSON.stringify(payload, null, 2));

        const info = await adminAuthClient?.createUser(payload);
        const { data, error: createError } = info || {};

        if (createError) {
          console.error("Error creating user in auth:", createError);
          setError(createError.message || "Error al crear usuario");

          return { data: null, error: createError };
        }

        console.log("User created in auth.users:", data?.user?.id);

        // Insertar o actualizar en la tabla public.users
        if (data?.user?.id) {
          const { error: insertError } = await supabase
            .from("users")
            .upsert({
              id: data.user.id,
              email: user_data.email,
              first_name: user_data.first_name,
              last_name: user_data.last_name,
              full_name: `${user_data.first_name} ${user_data.last_name}`,
              role_id: Number(role_id),
              is_active: true,
              is_switchable: user_data.is_switchable || false,
            });

          if (insertError) {
            console.error("Error inserting into public.users:", insertError);
          } else {
            console.log("User inserted into public.users successfully");
          }
        }

        // Esperar un momento y refrescar
        await new Promise((resolve) => setTimeout(resolve, 500));

        setIsLoading(false);
        refreshUsers();

        return { data, error: createError };
      } catch (err) {
        console.error("Error en createUserByRole:", err);
        setError("Error inesperado al crear usuario");
        setIsLoading(false);

        return { data: null, error: err };
      }
    },
    [refreshUsers],
  );

  // Update user and refresh list
  const updateUserByRole = useCallback(
    async (user_id?: string, user_data?: UserType, role_id?: string) => {
      setIsLoading(true);
      try {
        let updatePayload: any = {
          user_metadata: {
            role_id: Number(role_id), // Convertir a número
          },
        };

        if (user_data) {
          updatePayload = {
            email: user_data.email,
            user_metadata: {
              name: `${user_data.first_name} ${user_data.last_name}`,
              first_name: user_data.first_name,
              last_name: user_data.last_name,
              role_id: Number(role_id), // Convertir a número
            },
          };
        }

        console.log("Updating user with payload:", updatePayload);

        const result = await adminAuthClient?.updateUserById(
          user_id,
          updatePayload,
        );
        const { data, error: updateError } = result || {};

        if (updateError) {
          setError(updateError.message || "Error al actualizar usuario");

          return { data: null, error: updateError };
        }

        // Actualizar en public.users (esto activará el trigger)
        if (data?.user && user_id) {
          const publicPayload: Partial<UserType> = {
            role_id: Number(role_id),
            updated_at: new Date().toISOString(),
          };

          if (user_data) {
            Object.assign(publicPayload, {
              first_name: user_data.first_name,
              last_name: user_data.last_name,
              email: user_data.email,
              name: `${user_data.first_name} ${user_data.last_name}`,
            });
          }

          await updateUser(data.user.id, publicPayload);
          refreshUsers();
        }

        return { data, error: null };
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

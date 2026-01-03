"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { User, type Session } from "@supabase/auth-helpers-nextjs";
import { AuthError, WeakPassword } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import { useSupabase } from "./supabase-context";

interface AuthValue {
  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<{
    respData: {
      user: User;
      session: Session;
      weakPassword?: WeakPassword | undefined;
    } | null;
    respError: AuthError | null;
  }>;
  signUpWithPassword: (
    email: string,
    password: string,
    userData: { first_name: string; last_name: string }
  ) => Promise<{
    respData: any;
    respError: AuthError | null;
  }>;
  signOut: () => void;
  userSession: Session | null;
  getUserInfo: (id: string) => void;
  userInfo: {
    id: string;
    role_id?: number;
    first_name?: string;
    last_name?: string;
    name?: string;
    is_switchable?: boolean;
  } | null;
  changeRole: (v: number) => void;
  isInitializing: boolean;
}

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

const AuthContext = createContext<AuthValue>({} as AuthValue);

export const AuthContextProvider = ({ children }: { children: any }) => {
  const { supabase } = useSupabase();
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const [lastUserIdFetched, setLastUserIdFetched] = useState<string | null>(null);

  const changeRole = (newrole: number) => {
    const newUser = {
      ...userInfo,
      role_id: newrole,
    };

    setUserInfo(newUser);
  };

  // Función para iniciar sesión con correo y contraseña
  const signInWithPassword = async (email: string, password: string) => {
    let respData = null;
    let respError = null;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error !== null) {
        respError = error;
        console.log("error ", error);
      } else {
        respData = data;
        console.log("DATA!! ", data);

        if (data.user && data.session) {
          console.log(data.user.id);

          // Validar si el usuario tiene acceso activo
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, active_users')
            .eq('id', data.user.id)
            .single();

          if (userError) {
            console.error("Error al obtener datos del usuario:", userError);
            respError = {
              message: "Error al verificar los datos del usuario. Intenta nuevamente.",
              name: "UserDataError",
              status: 500,
            } as AuthError;
            await supabase.auth.signOut({ scope: 'local' });
            return { respData: null, respError };
          }

          // Validar que active_users sea true
          if (!userData || userData.active_users !== true) {
            console.log("Acceso denegado: usuario sin acceso activo");

            // Cerrar la sesión
            await supabase.auth.signOut({ scope: 'local' });

            // Crear error personalizado
            respError = {
              message: "Usuario sin acceso al sistema",
              name: "AccessDenied",
              status: 403,
            } as AuthError;

            return { respData: null, respError };
          }

          console.log("✅ Acceso validado correctamente");

          setUserSession(data.session);
          await getUserInfo(data.user.id);
        }
      }
    } catch (error) {
      console.error("Error inesperado en signInWithPassword:", error);
      // Si hay una excepción, asegurarse de establecer respError
      if (!respError) {
        respError = {
          message: "Intenta nuevamente más tarde.",
          name: "UnexpectedError",
          status: 500,
        } as AuthError;
      }
    }

    return { respData, respError };
  };

  // Función para registrar un nuevo usuario
  const signUpWithPassword = async (
    email: string,
    password: string,
    userData: { first_name: string; last_name: string }
  ) => {
    let respData = null;
    let respError = null;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role_id: 1,
          },
        },
      });

      if (error !== null) {
        respError = error;
        console.log("Signup error:", error);
      } else {
        respData = data;
        console.log("Signup successful:", data);

        if (data.session && data.user) {
          setUserSession(data.session);
          const userId = data.user.id;
          // Esperar un poco para que el trigger de la base de datos cree el usuario
          setTimeout(async () => {
            await getUserInfo(userId);
          }, 500);
        }
      }
    } catch (error) {
      console.log("Signup catch error:", error);
      respError = error as AuthError;
    }

    return { respData, respError };
  };

  // Función para cerrar sesión con manejo de errores mejorado
  const signOut = async () => {
    console.log("LOGOUT - Iniciando proceso de cierre de sesión");

    try {
      // Intentar logout con scope global primero
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) {
        console.warn("Error en logout global:", error);

        // Si falla el global (403 u otro error), intentar local
        const { error: localError } = await supabase.auth.signOut({ scope: 'local' });

        if (localError) {
          console.error("Error en logout local:", localError);
        } else {
          console.log("✅ Logout local exitoso");
        }
      } else {
        console.log("✅ Logout global exitoso");
      }
    } catch (error) {
      console.error("Error inesperado en signOut:", error);
    } finally {
      // SIEMPRE limpiar el estado local, incluso si el logout falla
      setUserSession(null);
      setUserInfo(null);
      setLastUserIdFetched(null);
      console.log("✅ Estado local limpiado");
    }
  };

  // Función para obtener la información del usuario
  const getUserInfo = async (id: string) => {
    // Evitar llamadas duplicadas - verificar si ya se está cargando O si ya se cargó este usuario
    if (isLoadingUserInfo || lastUserIdFetched === id) {
      console.log("getUserInfo - ignorando llamada duplicada para usuario:", id);
      return;
    }

    console.log("llamando..");
    setIsLoadingUserInfo(true);
    setLastUserIdFetched(id);

    try {
      const { data: userData, error } = await supabase
        .rpc('get_user_with_role', { user_id: id })

      if (error) {
        console.error('Error con función get_user_with_role:', error);
        setLastUserIdFetched(null);
        return;
      }

      if (userData && userData.length > 0) {
        console.log("DATA USER ****", userData[0]);
        setUserInfo(userData[0]);
      } else {
        console.log('No se encontró información del usuario - cerrando sesión');
        // Si el usuario fue eliminado de la base de datos, cerrar la sesión
        setUserInfo(null);
        setUserSession(null);
        setLastUserIdFetched(null);
        // Cerrar sesión en Supabase también
        await supabase.auth.signOut({ scope: 'local' });
      }

    } catch (error) {
      console.error('Error general obteniendo usuario:', error);
      setLastUserIdFetched(null);
    } finally {
      setIsLoadingUserInfo(false);
    }
  };

  // useEffect para suscribirse a los cambios de autenticación
  useEffect(() => {
    console.log("CHECO USER x");

    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      if (session) {
        getUserInfo(session.user.id).finally(() => {
          setIsInitializing(false);
        });
      } else {
        setIsInitializing(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("SUPA BASE evento", event);
        console.log("SUPA BASE SESION", session);

        // Evitar procesar INITIAL_SESSION ya que lo manejamos arriba
        if (event === 'INITIAL_SESSION') {
          return;
        }

        // SIGNED_IN ya es manejado por signInWithPassword, no hacer nada aquí
        if (event === 'SIGNED_IN') {
          return;
        }

        // Manejar TOKEN_REFRESHED
        if (event === 'TOKEN_REFRESHED') {
          if (session) {
            setUserSession(session);
            // Reset lastUserIdFetched para permitir que getUserInfo se ejecute en el próximo refresh
            setLastUserIdFetched(null);
          }
          return;
        }

        // Manejar SIGNED_OUT
        if (event === 'SIGNED_OUT') {
          setUserSession(null);
          setUserInfo(null);
          setLastUserIdFetched(null);
          return;
        }

        // Para otros eventos
        if (session !== null) {
          setUserSession(session);
        } else {
          setUserSession(null);
          setUserInfo(null);
          setLastUserIdFetched(null);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signInWithPassword,
        signUpWithPassword,
        userInfo,
        getUserInfo,
        signOut,
        userSession,
        changeRole,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};

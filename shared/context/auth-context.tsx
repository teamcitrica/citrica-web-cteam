'use client'
import { createContext, useState, useContext, useEffect } from 'react'
import { User, type Session } from '@supabase/auth-helpers-nextjs'
import { useSupabase } from "./supabase-context"
import { AuthError, WeakPassword } from '@supabase/supabase-js';

// Hook para limpiar datos expirados
const useStorageCleanup = () => {
  useEffect(() => {
    const cleanupExpiredData = () => {
      try {
        const savedSession = localStorage.getItem('supabase-session');
        if (savedSession) {
          const session = JSON.parse(savedSession);
          const expiresAt = session.expires_at;
          
          if (expiresAt && Date.now() / 1000 > expiresAt) {
            console.log('Limpiando datos expirados del localStorage');
            localStorage.removeItem('supabase-session');
            localStorage.removeItem('user-info');
          }
        }
      } catch (error) {
        console.error('Error limpiando localStorage:', error);
        localStorage.removeItem('supabase-session');
        localStorage.removeItem('user-info');
      }
    };

    cleanupExpiredData();
    const interval = setInterval(cleanupExpiredData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
};

interface AuthValue {
  signInWithPassword: (email:string, password:string) => Promise<{ respData: any; respError: AuthError | null; }>,
  signUpWithPassword: (email: string, password: string, userData: { first_name: string, last_name: string }) => Promise<{ respData: any; respError: AuthError | null; }>,
  signOut: () => void,
  userSession: Session | null,
  checkUser: () => void,
  getUserInfo: (id:string) => void,
  userInfo: any | null,
  isLoading: boolean,
}

const AuthContext = createContext<AuthValue>({} as AuthValue)

export const AuthContextProvider = ({ children }:{children: any}) => {
  const { supabase } = useSupabase()
  
  // Usar hook de limpieza
  useStorageCleanup();
  
  // Inicializar estado con datos persistidos
  const [userSession, setUserSession] = useState<Session | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSession = localStorage.getItem('supabase-session');
        return savedSession ? JSON.parse(savedSession) : null;
      } catch (error) {
        console.error('Error parsing saved session:', error);
        return null;
      }
    }
    return null;
  });
  
  const [userInfo, setUserInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUserInfo = localStorage.getItem('user-info');
        return savedUserInfo ? JSON.parse(savedUserInfo) : null;
      } catch (error) {
        console.error('Error parsing saved user info:', error);
        return null;
      }
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Función para persistir sesión
  const persistSession = (session: Session | null) => {
    if (typeof window !== 'undefined') {
      if (session) {
        localStorage.setItem('supabase-session', JSON.stringify(session));
      } else {
        localStorage.removeItem('supabase-session');
      }
    }
  };

  // Función para persistir userInfo
  const persistUserInfo = (userInfo: any) => {
    if (typeof window !== 'undefined') {
      if (userInfo) {
        localStorage.setItem('user-info', JSON.stringify(userInfo));
      } else {
        localStorage.removeItem('user-info');
      }
    }
  };

  const getUserInfo = async (id: string) => {
    console.log('Obteniendo info del usuario:', id);
    
    try {
      const { data: userData, error } = await supabase
        .rpc('get_user_with_role', { user_id: id })

      if (error) {
        console.error('Error con función get_user_with_role:', error);
        return;
      }

      if (userData && userData.length > 0) {
        console.log('Usuario obtenido exitosamente:', userData[0]);
        setUserInfo(userData[0]);
        persistUserInfo(userData[0]); // Persistir datos del usuario
      } else {
        console.log('No se encontró información del usuario');
      }
      
    } catch (error) {
      console.error('Error general obteniendo usuario:', error);
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    let respData = null;
    let respError = null;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({email, password})
      
      if (error !== null) {
        respError = error;
        console.log('Login error:', error)
      } else {
        respData = data;
        console.log('Login successful:', data)

        if(data.user && data.session){
          setUserSession(data.session);
          persistSession(data.session); // Persistir sesión
          await getUserInfo(data.user.id);
        }
      }
    } catch (error) {
      console.log('Login catch error:', error)
      respError = error as AuthError
    }
    
    return {respData, respError}
  }

  const signUpWithPassword = async (email: string, password: string, userData: { first_name: string, last_name: string }) => {
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
            role_id: 1
          }
        }
      })
      
      if (error !== null) {
        respError = error;
        console.log('Signup error:', error)
      } else {
        respData = data;
        console.log('Signup successful:', data)

        if (data.session && data.user) {
          setUserSession(data.session);
          persistSession(data.session); // Persistir sesión
          const userId = data.user.id;
          setTimeout(async () => {
            await getUserInfo(userId);
          }, 500);
        }
      }
    } catch (error) {
      console.log('Signup catch error:', error)
      respError = error as AuthError
    }
    
    return { respData, respError }
  }

  const signOut = async () => {
    console.log('LOGOUT');
    await supabase.auth.signOut();
    setUserSession(null);
    setUserInfo(null);
    // Limpiar datos persistidos
    persistSession(null);
    persistUserInfo(null);
  }

  const checkUser = () => {
    console.log('Configurando listener de auth...');
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session existe:', !!session)
      
      // Solo procesar ciertos eventos para evitar loops
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log('Procesando evento de auth:', event);
        
        if (session !== null) {
          setUserSession(session);
          persistSession(session);
          // Solo obtener userInfo si no lo tenemos o es diferente usuario
          if (!userInfo || userInfo.id !== session.user.id) {
            await getUserInfo(session.user.id);
          }
        } else {
          setUserSession(null);
          setUserInfo(null);
          persistSession(null);
          persistUserInfo(null);
        }
      }
    })
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }

  // Verificar sesión inicial al montar el componente
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticación...');
        console.log('Sesión persistida:', userSession ? 'Existe' : 'No existe');
        console.log('UserInfo persistido:', userInfo ? 'Existe' : 'No existe');
        
        // SIEMPRE verificar con Supabase primero
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión de Supabase:', error);
          // Limpiar datos inválidos
          setUserSession(null);
          setUserInfo(null);
          persistSession(null);
          persistUserInfo(null);
          return;
        }

        if (session) {
          console.log('Sesión válida encontrada en Supabase');
          // Actualizar estado con la sesión válida
          setUserSession(session);
          persistSession(session);
          
          // Si no tenemos userInfo o es diferente usuario, obtenerlo
          if (!userInfo || userInfo.id !== session.user.id) {
            console.log('Obteniendo información del usuario...');
            await getUserInfo(session.user.id);
          } else {
            console.log('Usando userInfo persistido');
          }
        } else {
          console.log('No hay sesión válida, limpiando datos...');
          // No hay sesión válida, limpiar todo
          setUserSession(null);
          setUserInfo(null);
          persistSession(null);
          persistUserInfo(null);
        }
        
      } catch (error) {
        console.error('Error inicializando auth:', error);
        // En caso de error, limpiar todo
        setUserSession(null);
        setUserInfo(null);
        persistSession(null);
        persistUserInfo(null);
      } finally {
        console.log('Finalizando inicialización auth');
        setIsLoading(false); // Finalizar carga inicial
      }
    };

    // Pequeño delay para evitar race conditions
    const timeoutId = setTimeout(() => {
      initializeAuth();
    }, 100);
    
    // Configurar listener para cambios (pero sin interferir con la inicialización)
    const unsubscribe = checkUser();
    
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []) // Dependencias vacías para ejecutar solo una vez

  return (
    <AuthContext.Provider value={{ 
      signInWithPassword, 
      signUpWithPassword,
      userInfo, 
      getUserInfo, 
      signOut, 
      userSession, 
      checkUser,
      isLoading // Exponer estado de carga
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const UserAuth = () => {
  return useContext(AuthContext)
}
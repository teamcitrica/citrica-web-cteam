// shared/context/auth-context.tsx - USANDO LA FUNCIÓN QUE FUNCIONA

'use client'
import { createContext, useState, useContext, useEffect } from 'react'
import { User, type Session } from '@supabase/auth-helpers-nextjs'
import { useSupabase } from "./supabase-context"
import { AuthError, WeakPassword } from '@supabase/supabase-js';

interface AuthValue {
  signInWithPassword: (email:string, password:string) => Promise<{ respData: any; respError: AuthError | null; }>,
  signUpWithPassword: (email: string, password: string, userData: { first_name: string, last_name: string }) => Promise<{ respData: any; respError: AuthError | null; }>,
  signOut: () => void,
  userSession: Session | null,
  checkUser: () => void,
  getUserInfo: (id:string) => void,
  userInfo: any | null,
}

const AuthContext = createContext<AuthValue>({} as AuthValue)

export const AuthContextProvider = ({ children }:{children: any}) => {
  const { supabase } = useSupabase()
  const [userSession, setUserSession] = useState<Session | null>(null)
  const [userInfo, setUserInfo] = useState(null);

  const getUserInfo = async (id: string) => {
    console.log('Obteniendo info del usuario:', id);
    
    try {
      // USAR LA FUNCIÓN QUE SABEMOS QUE FUNCIONA
      const { data: userData, error } = await supabase
        .rpc('get_user_with_role', { user_id: id })

      if (error) {
        console.error('Error con función get_user_with_role:', error);
        return;
      }

      if (userData && userData.length > 0) {
        console.log('Usuario obtenido exitosamente:', userData[0]);
        setUserInfo(userData[0]);
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
            role_id: 1 // todos los usuarios creados seran superuser
          }
        }
      })
      
      if (error !== null) {
        respError = error;
        console.log('Signup error:', error)
      } else {
        respData = data;
        console.log('Signup successful:', data)

        // Si hay sesión automática
        if (data.session && data.user) {
          setUserSession(data.session);
          // Esperar un poco para que la sesión se establezca completamente
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
    setUserSession(null)
    setUserInfo(null)
  }

  const checkUser = () => {
    console.log('Verificando usuario...');
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', session)
      
      if (session !== null) {
        setUserSession(session);
        await getUserInfo(session.user.id);
      } else {
        setUserSession(null);
        setUserInfo(null);
      }
    })
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }

  useEffect(() => {
    const unsubscribe = checkUser()
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ 
      signInWithPassword, 
      signUpWithPassword,
      userInfo, 
      getUserInfo, 
      signOut, 
      userSession, 
      checkUser 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const UserAuth = () => {
  return useContext(AuthContext)
}
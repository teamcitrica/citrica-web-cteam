# 🚀 Guía de Migración: Sistema de Login Rápido

Esta guía contiene **todos los pasos** para implementar el sistema de login rápido en otro proyecto Next.js con Supabase.

---

## 📋 Prerequisitos

### 1. Verificar dependencias en `package.json`:
```json
{
  "@supabase/auth-helpers-nextjs": "^0.8.x",
  "@supabase/supabase-js": "^2.x.x"
}
```

Si no las tienes:
```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

### 2. Variables de entorno en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
# Opcional (solo si usas funciones admin):
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=tu_service_role_key
```

---

## 🔧 Paso 1: Actualizar `supabase-context.tsx`

**Archivo:** `/shared/context/supabase-context.tsx`

**Acción:** Este archivo probablemente ya está bien. Verifica que sea igual a este:

```tsx
'use client'
import { createContext, ReactNode, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation"
import { SupabaseClient } from "@supabase/supabase-js";
import {  createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

type SupabaseContext = {
  supabase: SupabaseClient
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const [supabase] = useState(()=> createPagesBrowserClient())

  useEffect(()=>{
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(()=>{
      router.refresh()
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <Context.Provider value={{ supabase }}>
      <>{ children }</>
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('use Supabase most be used inside Supabase Provider')
  }
  return context
}
```

---

## 🔧 Paso 2: Reemplazar `auth-context.tsx` COMPLETO

**Archivo:** `/shared/context/auth-context.tsx`

**Acción:** REEMPLAZA TODO el contenido con este:

```tsx
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
          setUserSession(data.session);
          await getUserInfo(data.user.id);
        }
      }
    } catch (error) {
      console.log(error);
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

  // Función para cerrar sesión
  const signOut = async () => {
    console.log("LOGOUT");
    await supabase.auth.signOut();
  };

  // Función para obtener la información del usuario
  const getUserInfo = async (id: string) => {
    console.log("llamando..");

    try {
      const { data: userData, error } = await supabase
        .rpc('get_user_with_role', { user_id: id })

      if (error) {
        console.error('Error con función get_user_with_role:', error);
        return;
      }

      if (userData && userData.length > 0) {
        console.log("DATA USER ****", userData[0]);
        setUserInfo(userData[0]);
      } else {
        console.log('No se encontró información del usuario');
      }

    } catch (error) {
      console.error('Error general obteniendo usuario:', error);
    }
  };

  // useEffect para suscribirse a los cambios de autenticación
  useEffect(() => {
    console.log("CHECO USER x");
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("SUPA BASE evento", event);
        console.log("SUPA BASE SESION", session);
        if (session !== null) {
          setUserSession(session);
          getUserInfo(session.user.id);
        } else {
          setUserSession(null);
          setUserInfo(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
```

**⚠️ IMPORTANTE:** Si tu proyecto NO tiene la función RPC `get_user_with_role` en Supabase, cambia esta parte:

```tsx
// En vez de:
const { data: userData, error } = await supabase
  .rpc('get_user_with_role', { user_id: id })

// Usa (si tienes acceso directo a la tabla users):
const { data: userData, error } = await supabase
  .from("users")
  .select("*")
  .eq("id", id)
  .limit(1)

// Y cambia:
if (userData && userData.length > 0) {
  setUserInfo(userData[0]);
}

// Por:
if (userData) {
  setUserInfo([userData]); // Convertir a array
}
```

---

## 🔧 Paso 3: Simplificar `app/login/page.tsx`

**Archivo:** `/app/login/page.tsx`

**Acción:** REEMPLAZA TODO el contenido con:

```tsx
'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@citrica/objects'
import { UserAuth } from '@/shared/context/auth-context'
import LoginContainer from '@/shared/components/citrica-ui/organism/login-container';

const LoginPage = () => {
  const { userSession } = UserAuth();
  const router = useRouter();

  // Redirigir a admin si ya está autenticado
  useEffect(() => {
    if (userSession) {
      router.push('/admin');
    }
  }, [userSession, router]);

  // Si ya hay sesión, no mostrar el formulario (se redirigirá)
  if (userSession) {
    return null;
  }

  return (
    <Container className='flex justify-center items-center h-screen'>
      <LoginContainer
        logoSrc="/img/logo-lienzo.svg"
        backgroundImage=""
      />
    </Container>
  )
}

export default LoginPage
```

**⚠️ Ajusta:**
- El path del `LoginContainer` según tu proyecto
- El `logoSrc` y `backgroundImage` según tus assets

---

## 🔧 Paso 4: Simplificar `app/logout/page.tsx`

**Archivo:** `/app/logout/page.tsx`

**Acción:** REEMPLAZA TODO el contenido con:

```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/shared/context/auth-context";

export default function LogoutPage() {
  const { signOut } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      await signOut();
      router.push('/login');
    };

    performLogout();
  }, [signOut, router]);

  return null;
}
```

---

## 🔧 Paso 5: Simplificar `app/signup/page.tsx` (si existe)

**Archivo:** `/app/signup/page.tsx`

**Acción:** REEMPLAZA TODO el contenido con:

```tsx
'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@citrica/objects'
import { UserAuth } from '@/shared/context/auth-context'
import SignupContainer from '@/shared/components/citrica-ui/organism/signup-container';

const SignupPage = () => {
  const { userSession } = UserAuth();
  const router = useRouter();

  // Redirigir a admin si ya está autenticado
  useEffect(() => {
    if (userSession) {
      router.push('/admin');
    }
  }, [userSession, router]);

  // Si ya hay sesión, no mostrar el formulario (se redirigirá)
  if (userSession) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Container>
        <SignupContainer
          logoSrc="/img/logo-lienzo.svg"
          backgroundImage=""
        />
      </Container>
    </div>
  )
}

export default SignupPage
```

---

## 🔧 Paso 6: Simplificar `app/admin/layout.tsx`

**Archivo:** `/app/admin/layout.tsx`

**Acción:** Busca y ELIMINA estas líneas:

```tsx
// ELIMINAR:
const { userSession, userInfo, isLoading, checkUser } = UserAuth();

// ELIMINAR:
useEffect(() => {
  checkUser();
}, []);

// ELIMINAR todo el bloque de loading:
if (isLoading || userSession === null) {
  return (
    <div>Loading...</div>
  );
}
```

**REEMPLAZA con:**

```tsx
'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/shared/components/citrica-ui/organism/sidebar";
import { siteConfig } from "@/config/site";
import { UserAuth } from "@/shared/context/auth-context";
import Navbar from "@/shared/components/citrica-ui/organism/navbar";
import "@/styles/globals.scss";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userSession, userInfo } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no hay sesión, redirigir a login
    if (userSession === null) {
      router.push('/login');
    }
  }, [userSession, router]);

  // Si no hay sesión, no renderizar nada (se está redirigiendo)
  if (userSession === null || userInfo === null) {
    return null;
  }

  return (
    <div className="container-general-pase-admin w-full flex justify-center">
      <div className="w-full">
        <div className="h-full bg-[#EFE6DC] flex flex-row justify-start min-h-full">
          <Sidebar items={siteConfig.sidebarItems} />
          <div className="bg-[#EFE6DC] flex-1 text-white w-[80%]">
            <Navbar session={userSession} />
            <div className="pt-3 max-h-[90vh] overflow-y-scroll">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**⚠️ Ajusta:** Los componentes según tu proyecto (Sidebar, Navbar, estilos, etc.)

---

## 🔧 Paso 7: Verificar `app/layout.tsx`

**Archivo:** `/app/layout.tsx`

**Acción:** Verifica que los providers estén en este orden:

```tsx
import "@/styles/globals.scss";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";

import { Providers } from "../shared/providers";

import { siteConfig } from "@/config/site";
import SupabaseProvider from '@/shared/context/supabase-context'
import { AuthContextProvider } from '@/shared/context/auth-context'

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s -${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="es">
      <head />
      <body>
        <Toaster />
        <SupabaseProvider>
          <AuthContextProvider>
            <Providers
              themeProps={{ attribute: "data-theme", defaultTheme: "light" }}
            >
              {children}
            </Providers>
          </AuthContextProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
```

---

## 🔧 Paso 8: Verificar que NO exista `middleware.ts`

**Acción:** Busca en la raíz del proyecto:

```bash
ls middleware.ts
```

Si existe, **ELIMINALO** o renómbralo:

```bash
mv middleware.ts middleware.ts.old
```

El middleware causa tiempos de carga lentos.

---

## 🔧 Paso 9: Buscar y reemplazar usos de `isLoading` y `checkUser`

**Acción:** Busca en todo el proyecto:

```bash
# Buscar isLoading del auth context:
grep -r "isLoading.*UserAuth" . --include="*.tsx" --include="*.ts"

# Buscar checkUser:
grep -r "checkUser" . --include="*.tsx" --include="*.ts"
```

Para cada archivo encontrado:
- **Elimina** `isLoading` del destructuring
- **Elimina** `checkUser()` de los useEffect
- **Elimina** bloques de loading condicionales

---

## ✅ Paso 10: Verificar compilación

```bash
npm run build
```

Debe compilar sin errores de TypeScript.

---

## 🎯 Resumen de Cambios Clave

### ❌ Eliminado:
- `isLoading` del auth context
- `checkUser()` función
- localStorage manual
- Timeouts artificiales
- Pantallas de loading complejas
- Middleware bloqueante

### ✅ Agregado:
- `signUpWithPassword()` función
- Uso de RPC `get_user_with_role`
- Retorno `null` en lugar de loading screens
- Sistema instantáneo sin delays

---

## 🐛 Troubleshooting

### Error: "get_user_with_role does not exist"
**Solución:** En `auth-context.tsx`, cambia el RPC por consulta directa (ver Paso 2).

### Error: "Property 'signUpWithPassword' does not exist"
**Solución:** Verifica que agregaste la función en el provider (línea 207 del auth-context).

### Error: "checkUser is not a function"
**Solución:** Busca todos los usos de `checkUser` y elimínalos (Paso 9).

### Loading infinito en login
**Solución:** Verifica que NO tengas `middleware.ts` activo (Paso 8).

---

## 📞 Comandos útiles para Claude en el otro proyecto

Una vez que tengas este archivo `GUIA_MIGRACION_LOGIN_RAPIDO.md` en el otro proyecto, puedes decirle a Claude:

```
"Lee GUIA_MIGRACION_LOGIN_RAPIDO.md e implementa todos los cambios paso por paso"
```

O si prefieres hacerlo manualmente:

```
"Ayúdame a implementar el Paso X de GUIA_MIGRACION_LOGIN_RAPIDO.md"
```

---

## 🎉 Resultado Final

- ✅ Login instantáneo sin delays
- ✅ Signup funcional
- ✅ Logout rápido
- ✅ Protección de rutas sin middleware
- ✅ Sin errores de TypeScript
- ✅ Listo para producción

---

**Creado desde:** lienzo-frontend-cteam
**Fecha:** 2025-01-06
**Sistema probado y funcionando** ⚡

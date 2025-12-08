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
    } = supabase.auth.onAuthStateChange((event)=>{
      // Solo refrescar en eventos críticos, no en todos los cambios
      if (event === 'SIGNED_OUT') {
        router.refresh()
      }
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
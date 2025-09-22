'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Col } from '@citrica/objects'
import Text from '@ui/atoms/text'
import { Input } from "@heroui/input"
import { addToast } from "@heroui/toast"
import { UserAuth } from '@/shared/context/auth-context'
import { useForm } from "react-hook-form";
import { Divider, Link, CircularProgress } from "@heroui/react";
import { Eye } from "lucide-react";

type FormValues = {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  message: string;
};

const LoginPage = () => {
  const { register, handleSubmit } = useForm<FormValues>();
  const { signInWithPassword, userSession, isLoading: authLoading } = UserAuth();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Redireccionar si ya hay sesión activa
  useEffect(() => {
    // Solo redirigir cuando no esté cargando y haya sesión
    if (!authLoading && userSession) {
      console.log('Usuario ya autenticado, redirigiendo...');
      router.push('/admin');
    }
  }, [userSession, authLoading, router]);

  const onSubmit = async (data: FormValues) => {
    if (!data.email || !data.password) {
      addToast({
        title: "Error",
        description: "Por favor completa todos los campos",
        color: "danger",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const { respData, respError } = await signInWithPassword(data.email, data.password)
      
      if (respError) {
        addToast({
          title: "Error de autenticación",
          description: respError.message || "Credenciales incorrectas",
          color: "danger",
        })
      } else if (respData?.user) {
        addToast({
          title: "Bienvenido",
          description: "Has iniciado sesión correctamente",
          color: "success",
        })
        router.push('/admin')
      }
    } catch (error) {
      console.error('Login error:', error)
      addToast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        color: "danger",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading mientras verifica la autenticación
  if (authLoading) {
    return (
      <Container className='flex justify-center items-center h-screen'>
        <div className="text-center flex justify-center items-center w-full">
          <CircularProgress aria-label="Verificando sesión..." size="lg" />
          {/* <p className="mt-4 text-gray-600">Verificando sesión...</p> */}
        </div>
      </Container>
    )
  }

  // Si hay sesión activa, no mostrar el formulario (se redirigirá)
  if (userSession) {
    return (
      <Container className='flex justify-center items-center h-screen w-full'>
        <div className="text-center flex justify-center items-center w-full">
          <CircularProgress aria-label="Redirigiendo..." size="lg" />
          {/* <p className="mt-4 text-gray-600">Redirigiendo...</p> */}
        </div>
      </Container>
    )
  }

  return (
    <>
      <Container className='flex justify-center items-center h-screen'>
        <div className="w-[968px] flex justify-center">
          <div className='container-inputs'>
            <img className='w-[54px] ' src="/img/citrica-logo.png" alt="" />
            <h2 className='text-login-welcome'>BIENVENIDO</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                type="text"
                variant="bordered"
                placeholder="Email"
                {...register("email")}
                disabled={isLoading}
                classNames={{
                  base: "!w-full !max-w-[312px]", 
                  input: ["!shadow-none", "placeholder:text-[#999999]"],
                  inputWrapper: [
                    "h-[56px]",
                    "bg-transparent",
                    "border-[rgba(235,235,235,1)]",
                    "rounded-[15px]",
                    "mt-[12px]",
                    "mb-[20px]",
                  ],
                }}
              />
              <Input
                type={showPassword ? "text" : "password"}
                variant="bordered"
                placeholder="Password"
                className="max-w-[312px]"
                {...register("password")}
                disabled={isLoading}
                classNames={{
                  base: "w-full max-w-[312px]",
                  input: ["!shadow-none", "placeholder:text-[#999999]"],
                  inputWrapper: [
                    "h-[56px]",
                    "bg-transparent",
                    "border-[rgba(235,235,235,1)]",
                    "rounded-[15px]",
                    "mb-[24px]",
                  ],
                }}
                endContent={
                  <Eye
                    className="text-[#66666666] cursor-pointer w-5 h-5"
                    onClick={() => setShowPassword((prev) => !prev)}
                  />
                }
              />
              <Link className="w-full">
                <button 
                  type="submit" 
                  className="bottom-login"
                  disabled={isLoading}
                  style={{ 
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Accediendo...' : 'Acceder'}
                </button>
              </Link>
            </form>

            <div className="w-[312px] h-[94px] mt-[24px] flex flex-col justify-center items-center">
              <Link href="/forgot-password">
                <span className='text-forgot-password'>¿Olvidaste tu contraseña?</span>
              </Link>
              <Divider className="w-[210px] h-[1px] bg-[#E5E7EB] mt-[14px]"></Divider>
            </div>
          </div>
          <div className='bg-login not-sm'></div>
        </div>
      </Container>
    </>
  )
}

export default LoginPage
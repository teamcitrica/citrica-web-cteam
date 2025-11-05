'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@citrica/objects'
import { Input } from "@heroui/input"
import { addToast } from "@heroui/toast"
import { UserAuth } from '@/shared/context/auth-context'
import { useForm } from "react-hook-form"
import { Divider, Link } from "@heroui/react"
import { Eye } from "lucide-react"
import Button from '@/shared/components/citrica-ui/molecules/button'
import { Text } from '@/shared/components/citrica-ui'

type FormValues = {
  password: string;
  email: string;
};

const LoginPage = () => {
  const { register, handleSubmit } = useForm<FormValues>();
  const { signInWithPassword, userSession, isInitializing } = UserAuth();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir a admin si ya está autenticado (solo una vez)
  useEffect(() => {
    if (!isInitializing && userSession) {
      router.replace('/admin');
    }
  }, [userSession, isInitializing, router]);

  // Si está inicializando o ya hay sesión, no mostrar el formulario
  if (isInitializing || userSession) {
    return null;
  }

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

  return (
    <>
      <Container noPadding noLimit className='flex justify-center items-center h-screen bg-[#0F172A]'>
        <div className="w-[968px] flex justify-center">
          <div className='container-inputs'>
            <img className='w-[54px] ' src="/img/citrica-logo.png" alt="" />
            <h2 className='text-login-welcome mt-3'>BIENVENIDO</h2>
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
              <Button
                type="submit"
                variant="primary"
                size="lg"
                label={isLoading ? 'Accediendo...' : 'Acceder'}
                disabled={isLoading}
                isLoading={isLoading}
                fullWidth={true}
                className="max-w-[312px]"
              />
            </form>

            <div className="w-[312px] h-[94px] mt-[24px] flex flex-col justify-center items-center">
              <Link href="/forgot-password">
                <Text variant='label' color='#0F172A' >¿Olvidaste tu contraseña?</Text>
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

'use client'
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addToast } from "@heroui/toast"
import { UserAuth } from '@/shared/context/auth-context'
import { Button, Text, Input, Icon } from 'citrica-ui-toolkit'
import { Container } from '@/styles/07-objects/objects'

const LoginPage = () => {
  const { signInWithPassword, userSession, isInitializing } = UserAuth();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      addToast({
        title: "Error",
        description: "Por favor ingresa tu correo y contraseña.",
        color: "danger",
      })
      return
    }

    setIsLoading(true)

    try {
      const { respData, respError } = await signInWithPassword(email, password)

      if (respError) {
        addToast({
          title: "Error al iniciar sesión",
          description: respError.message || "Correo o contraseña incorrectos.",
          color: "danger",
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      addToast({
        title: "Error",
        description: "Intenta nuevamente más tarde.",
        color: "danger",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container className="w-[968px] flex justify-center !flex-nowrap">
      <div className='container-inputs'>
        <img className='w-[80px] pb-3 items-center' src="/img/citrica-logo.png" alt="Logo" />
        <h2 className='text-center mb-1'>
          <Text color="#FF5B00" variant="headline">
            ¡Bienvenido!
          </Text>
        </h2>
        <span>
           <Text variant="body">
            Ingresa tu correo electrónico y tu clave
          </Text>
        </span>
        <form onSubmit={onSubmit} className='flex flex-col justify-center gap-5 mt-7'>
          <Input
            label="Email"
            type="email"
            placeholder="Correo electónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            variant="faded"
            classNames={{
              inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
              label: "!text-[#FF5B00]",
              input: "placeholder:text-[#A7BDE2] !text-[#265197]",
            }}
          />
          <Input
            label="Clave"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            variant="faded"
            classNames={{
              inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
              label: "!text-[#FF5B00]",
              input: "placeholder:text-[#A7BDE2] !text-[#265197]",
            }}
            endContent={
              <Icon name="Eye"
                className="text-[#66666666] cursor-pointer w-5 h-5"
                onClick={() => setShowPassword((prev) => !prev)}
              />
            }
          />
          <Button
            onClick={onSubmit}
            variant="primary"
            label={isLoading ? 'Accediendo...' : 'Iniciar sesión'}
            disabled={isLoading}
            isLoading={isLoading}
            fullWidth={true}
            className='mt-2'
          />
        </form>

        <div className="w-[312px] mt-4 flex flex-col justify-center items-center">
          <Divider className="w-[210px] h-[1px] bg-[#E5E7EB] mt-[14px] mb-2"></Divider>
          <Link href="/forgot-password">
            <Text variant="label" textColor='color-primary'>
              ¿Olvidaste tu contraseña?
            </Text>
          </Link>
        </div>
      </div>
      <div className='bg-login not-sm'></div>
    </Container>
  )
}

export default LoginPage

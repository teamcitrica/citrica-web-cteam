'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Text, Input, Container, Col } from 'citrica-ui-toolkit'
import { Card, CardBody } from "@heroui/card"
import { addToast } from "@heroui/toast"
import { UserAuth } from '@/shared/context/auth-context'

const SignupPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signUpWithPassword, userSession, isInitializing } = UserAuth()
  const router = useRouter()

  // Redirigir a admin si ya está autenticado
  useEffect(() => {
    if (!isInitializing && userSession) {
      router.push('/admin');
    }
  }, [userSession, isInitializing, router]);

  // Si está inicializando o ya hay sesión, no mostrar el formulario
  if (isInitializing || userSession) {
    return null;
  }

  const handleSignup = async () => {
    if (!email || !password || !firstName || !lastName) {
      addToast({
        title: "Error",
        description: "Por favor completa todos los campos",
        color: "danger",
      })
      return
    }

    if (password !== confirmPassword) {
      addToast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        color: "danger",
      })
      return
    }

    if (password.length < 6) {
      addToast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        color: "danger",
      })
      return
    }

    setIsLoading(true)

    try {
      const { respData, respError } = await signUpWithPassword(
        email,
        password,
        { first_name: firstName, last_name: lastName }
      )

      if (respError) {
        addToast({
          title: "Error de registro",
          description: respError.message,
          color: "danger",
        })
      } else if (respData?.user) {
        if (respData.session) {
          addToast({
            title: "¡Registro exitoso!",
            description: "Bienvenido a la plataforma",
            color: "success",
          })
          router.push('/admin')
        } else {
          addToast({
            title: "Registro completado",
            description: "Ahora puedes iniciar sesión",
            color: "success",
          })
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Container>
        <Col cols={{ lg: 4, md: 3, sm: 4 }} className="mx-auto">
          <Card className="p-6">
            <CardBody className="space-y-6">
              <div className="text-center">
                <Text variant="headline" textColor="color-on-container">
                  Crear Cuenta
                </Text>
                <Text variant="body" textColor="color-on-container" className="mt-2">
                  Completa los datos para registrarte
                </Text>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="Nombre"
                    placeholder="Tu nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    variant="faded"
                    required
                    disabled={isLoading}
                    classNames={{
                      inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                      label: "!text-[#265197]",
                      input: "placeholder:text-[#A7BDE2] !text-[#265197]",
                    }}
                  />
                  <Input
                    type="text"
                    label="Apellido"
                    placeholder="Tu apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    variant="faded"
                    required
                    disabled={isLoading}
                    classNames={{
                      inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                      label: "!text-[#265197]",
                      input: "placeholder:text-[#A7BDE2] !text-[#265197]",
                    }}
                  />
                </div>

                <Input
                  type="email"
                  label="Email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="faded"
                  required
                  disabled={isLoading}
                  classNames={{
                    inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                    label: "!text-[#265197]",
                    input: "placeholder:text-[#A7BDE2] !text-[#265197]",
                  }}
                />

                <Input
                  type="password"
                  label="Contraseña"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="faded"
                  required
                  disabled={isLoading}
                  classNames={{
                    inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                    label: "!text-[#265197]",
                    input: "placeholder:text-[#A7BDE2] !text-[#265197]",
                  }}
                />

                <Input
                  type="password"
                  label="Confirmar Contraseña"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="faded"
                  required
                  disabled={isLoading}
                  classNames={{
                    inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                    label: "!text-[#265197]",
                    input: "placeholder:text-[#A7BDE2] !text-[#265197]",
                  }}
                />

                <Button
                  onPress={handleSignup}
                  label={isLoading ? "Registrando..." : "Crear Cuenta"}
                  variant="primary"
                  textVariant="body"
                />
              </div>

              <div className="text-center">
                <Text variant="label" textColor="color-on-container">
                  ¿Ya tienes cuenta?{" "}
                  <span
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() => router.push('/login')}
                  >
                    Inicia sesión aquí
                  </span>
                </Text>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Container>
    </div>
  )
}

export default SignupPage

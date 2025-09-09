'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Col } from '@citrica/objects'
import Text from '@ui/atoms/text'
import Button from '@ui/molecules/button'
import { Input } from "@heroui/input"
import { Card, CardBody } from "@heroui/card"
import { addToast } from "@heroui/toast"
import { useSupabase } from '@/shared/context/supabase-context'

const SignupPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { supabase } = useSupabase()
  const router = useRouter()

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
      // Registrar usuario (sin confirmación de email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role_id: 2 // rol user por defecto
          }
        }
      })
      
      if (error) {
        addToast({
          title: "Error de registro",
          description: error.message,
          color: "danger",
        })
      } else if (data.user) {
        // Verificar si el usuario está confirmado automáticamente
        if (data.session) {
          // Usuario logueado automáticamente
          addToast({
            title: "¡Registro exitoso!",
            description: "Bienvenido a la plataforma",
            color: "success",
          })
          
          // Redirigir a /admin inmediatamente
          router.push('/admin')
        } else {
          // Si por alguna razón no hay sesión automática
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
                    variant="bordered"
                    isRequired
                    isDisabled={isLoading}
                  />
                  <Input
                    type="text"
                    label="Apellido"
                    placeholder="Tu apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    variant="bordered"
                    isRequired
                    isDisabled={isLoading}
                  />
                </div>

                <Input
                  type="email"
                  label="Email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="bordered"
                  isRequired
                  isDisabled={isLoading}
                />

                <Input
                  type="password"
                  label="Contraseña"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="bordered"
                  isRequired
                  isDisabled={isLoading}
                />

                <Input
                  type="password"
                  label="Confirmar Contraseña"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="bordered"
                  isRequired
                  isDisabled={isLoading}
                />

                <Button
                  onClick={handleSignup}
                  label={isLoading ? "Registrando..." : "Crear Cuenta"}
                  variant="primary"
                  color="primary"
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
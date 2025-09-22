'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Col } from '@citrica/objects'
import Text from '@ui/atoms/text'
import { Input } from "@heroui/input"
import { addToast } from "@heroui/toast"
import { UserAuth } from '@/shared/context/auth-context'
import { useForm } from "react-hook-form";
import { Divider, Link } from "@heroui/react";
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
  const { signInWithPassword } = UserAuth();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  


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
                  <button type="submit" className="bottom-login">
                    Acceder
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
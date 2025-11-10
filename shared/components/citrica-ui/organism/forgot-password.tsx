'use client';
import React, { useState } from 'react'
import { Container } from '@/styles/07-objects/objects';
import Text from '../atoms/text';
import Input from "../atoms/input";
import { Divider, Link } from "@heroui/react";
import Button from '../molecules/button';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Container className='w-[968px] flex justify-center items-center !flex-nowrap'>
      <div className='container-inputs'>
        <img className='w-[80px] pb-3 items-center' src="/img/citrica-logo.png" alt="Logo" />
        <h2 className='mb-4'>
          <Text variant='body' weight='bold'>
            ¿Tienes problemas para iniciar sesión?
          </Text>
        </h2>
        <p className='mb-6'>
          <Text variant='label' className="text-forgot-password">
            Ingresa tu correo para recuperar tu contraseña
          </Text>
        </p>
        <form className='flex flex-col justify-center'>
          <Input
            type="email"
            placeholder="Correo electrónico"
            required
            description='Te enviaremos un enlace para restablecer tu contraseña.'
            className='mb-2'
          />
          <Button 
            type="submit"
            variant='primary'
            label={isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          />
        </form>

        <div className="w-[312px] h-[94px] mt-4 flex flex-col justify-center items-center">
          <Divider className="w-[210px] h-[1px] bg-[#E5E7EB] mt-[14px] mb-2"></Divider>
          <Link href="/login">
            <Text variant="body" textColor='color-black'>
              Regresar
            </Text>
          </Link>
        </div>
      </div>
      <div className='bg-login not-sm'></div>
    </Container>
  )
}

export default ForgotPasswordPage
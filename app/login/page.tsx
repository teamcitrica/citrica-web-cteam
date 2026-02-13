'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from 'citrica-ui-toolkit';
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
    <Container className='container-background w-full h-screen flex justify-center items-center'>
      <div className="light-top-right"></div>
      <div className="ellipse2-top"></div>
      <img src="/img/line-top.svg" alt="" className="line-top" />
      <LoginContainer />
      <div className="light-bottom-left"></div>
      <div className="ellipse2-bottom"></div>
      <img src="/img/line-bottom.svg" alt="" className="line-bottom" />
    </Container>
  )
}

export default LoginPage

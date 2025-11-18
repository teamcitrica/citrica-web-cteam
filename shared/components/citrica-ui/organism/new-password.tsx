"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Container } from "@/styles/07-objects/objects";
import Text from "../atoms/text";
import Input from "../atoms/input";
import Icon from "../atoms/icon";
import Button from "../molecules/button";
import Modal from "../molecules/modal";
import { Divider, Link } from "@heroui/react";

type FormValues = {
  password: string;
};

const NewPasswordPage = () => {
  const supabase = createClientComponentClient();
  const { register, handleSubmit } = useForm<FormValues>();
  const router = useRouter();
  const params = useSearchParams();

  const [isValidRecovery, setIsValidRecovery] = useState(false);
  const [checked, setChecked] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Verificar si el link es válido y viene con token de recuperación
  useEffect(() => {
    const token = params.get("access_token");
    const type = params.get("type");

    if (token && type === "recovery") {
      setIsValidRecovery(true);
    }

    setChecked(true);
  }, [params]);

  const onSubmit = async (data: FormValues) => {
    if (!isValidRecovery) {
      alert("Link inválido o expirado.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      console.error("Error al cambiar contraseña:", error.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setShowSuccessModal(true);
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    router.push('/login');
  };

  // Si todavía no verificamos el token → no renderizamos nada
  if (!checked) return null;

  return (
    <Container className="w-[968px] flex justify-center !flex-nowrap">
      <div className="container-inputs">
        <img className='w-[80px] pb-3 items-center' src="/img/citrica-logo.png" alt="Logo" />

        <h2 className='text-center mb-4'>
          <Text textColor="white" variant="body">
            Crea una nueva contraseña
          </Text>
        </h2>

        {!isValidRecovery && (
          <p className="text-red-500 text-center mb-4">
            Enlace inválido o expirado.
          </p>
        )}

        {isValidRecovery && (
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col justify-center gap-4'>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              {...register("password")}
              disabled={isLoading}
              required
              endContent={
                <Icon name="Eye"
                  size={12}
                  className="text-[#66666666] cursor-pointer"
                  onClick={() => setShowPassword(prev => !prev)}
                />
              }
            />

            <Button
              type="submit"
              variant="primary"
              label={isLoading ? "Guardando..." : "Guardar contraseña"}
              disabled={isLoading}
              isLoading={isLoading}
            />
          </form>
        )}

        <div className="w-[312px] mt-4 flex flex-col justify-center items-center">
          <Divider className="w-[210px] h-[1px] bg-[#E5E7EB] mt-[14px] mb-2"></Divider>
          <Link href="/login">
            <Text variant="body" textColor='color-primary'>
              Volver al inicio de sesión
            </Text>
          </Link>
        </div>
      </div>

      <div className="bg-login not-sm"></div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="sm"
        hideCloseButton={true}
        isDismissable={true}
        className="text-center"
      >
        <div className="flex flex-col items-center py-6 px-4">
          <div className="flex items-center justify-center mb-4">
            <Icon name='CircleCheckBig' size={32} color="var(--color-primary)" />
          </div>

          <h3 className="mb-3">
            <Text variant="title" weight="bold">
              ¡Contraseña restablecida exitosamente!
            </Text>
          </h3>

          <p className="mb-6">
            <Text variant="body" textColor='color-on-secondary'>
              Ya puedes iniciar sesión con tu nueva contraseña.
            </Text>
          </p>

          <Button
            variant="primary"
            label="Ir al inicio de sesión"
            fullWidth
            className="mb-4"
            onClick={handleGoToLogin}
          />
        </div>
      </Modal>
    </Container>
  );
};

export default NewPasswordPage;

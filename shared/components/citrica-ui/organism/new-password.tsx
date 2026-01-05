"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Container } from "@/styles/07-objects/objects";
import Input from "../atoms/input";
import Icon from "../atoms/icon";
import { Text, Button } from "citrica-ui-toolkit";
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

  /** ---------------------------------------------------------
   *  PASO 1: Validar token de recuperación
   * --------------------------------------------------------*/
useEffect(() => {
  const init = async () => {
    try {
      // LOG: Mostrar TODA la URL y parámetros
      console.log("📍 URL completa:", window.location.href);
      console.log("📍 Search params:", window.location.search);
      console.log("📍 Hash:", window.location.hash);

      // Obtener TODOS los parámetros
      const allParams: Record<string, string> = {};
      params.forEach((value, key) => {
        allParams[key] = value;
      });
      console.log("📍 Todos los parámetros:", allParams);

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log("✅ Sesión activa encontrada");
        setIsValidRecovery(true);
        setChecked(true);
        return;
      }

      const accessToken = params.get("access_token");
      const type = params.get("type");

      console.log("🔍 Parámetros específicos:", {
        accessToken: accessToken ? `presente (${accessToken})` : "ausente",
        type
      });

      if (accessToken && type === "recovery") {
        console.log("✅ Token de recovery encontrado, verificando OTP...");


        if (/^\d{6}$/.test(accessToken)) {
          console.log("Token es un OTP de 6 dígitos, usando verifyOtp");


          const savedEmail = typeof window !== 'undefined'
            ? localStorage.getItem('password_reset_email')
            : null;

          if (!savedEmail) {
            console.error("❌ No se encontró el email guardado");
            setIsValidRecovery(false);
            setChecked(true);
            return;
          }

          const { data, error } = await supabase.auth.verifyOtp({
            email: savedEmail,
            token: accessToken,
            type: 'recovery',
          });

          if (error) {
            console.error("❌ Error verifyOtp:", error);
            setIsValidRecovery(false);
          } else if (data.session) {
            console.log("✅ Sesión creada con OTP");

            localStorage.removeItem('password_reset_email');
            setIsValidRecovery(true);
          } else {
            console.error("❌ No se pudo crear sesión con OTP");
            setIsValidRecovery(false);
          }
        } else {
          console.log("Token parece ser JWT, intentando setSession");
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: accessToken,
          });

          if (error) {
            console.error("❌ Error setSession:", error);
            setIsValidRecovery(false);
          } else {
            console.log("✅ Sesión creada con JWT");
            setIsValidRecovery(true);
          }
        }
        setChecked(true);
        return;
      }

      const tokenHash = params.get("token_hash");
      if (tokenHash && type === "recovery") {
        console.log("✅ Token hash de recovery encontrado, validando sesión...");
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: { session: newSession } } = await supabase.auth.getSession();

        if (newSession) {
          console.log("✅ Sesión creada exitosamente");
          setIsValidRecovery(true);
        } else {
          console.error("❌ No se pudo crear sesión con token_hash");
          setIsValidRecovery(false);
        }
        setChecked(true);
        return;
      }

      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash;
        const paramsHash = new URLSearchParams(hash.replace("#", "?"));
        const hashAccessToken = paramsHash.get("access_token");
        const hashType = paramsHash.get("type");

        console.log("🔍 Hash params:", { accessToken: hashAccessToken ? "presente" : "ausente", type: hashType });

        if (hashAccessToken && hashType === "recovery") {
          const { error } = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashAccessToken,
          });

          if (error) {
            console.error("❌ Error setSession:", error);
            setIsValidRecovery(false);
          } else {
            console.log("✅ Sesión creada desde hash");
            setIsValidRecovery(true);
          }
          setChecked(true);
          return;
        }
      }
      console.error("❌ No se encontró token de recuperación válido");
      setIsValidRecovery(false);
      setChecked(true);
    } catch (error) {
      console.error("❌ Error en init:", error);
      setIsValidRecovery(false);
      setChecked(true);
    }
  };

  init();
}, [params, supabase]);


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
                <Icon
                  name="Eye"
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
          <Divider className="w-[210px] h-[1px] bg-[#E5E7EB] mt-[14px] mb-2" />
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
            onPress={handleGoToLogin}
          />
        </div>
      </Modal>
    </Container>
  );
};

export default NewPasswordPage;

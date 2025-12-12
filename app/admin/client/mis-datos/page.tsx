"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/shared/context/supabase-context";
import { useUserAssets } from "@/hooks/user-assets/use-user-assets";
import { Spinner } from "@heroui/react";
import { Col, Container } from "@/styles/07-objects/objects";

export default function MisDatosPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { supabase } = useSupabase();

  // Obtener el usuario actual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    getCurrentUser();
  }, [supabase]);

  // Obtener los assets del usuario
  const { assets, isLoading: isLoadingAssets } = useUserAssets(currentUser?.id);

  // Redirigir al primer asset si existe
  useEffect(() => {
    if (!isLoadingAssets && assets.length > 0) {
      router.push(`/admin/client/mis-datos/${assets[0].id}`);
    }
  }, [assets, isLoadingAssets, router]);

  // Mostrar spinner mientras carga
  if (isLoadingAssets) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Si no hay assets, mostrar mensaje
  if (assets.length === 0) {
    return (
      <Container>
        <Col cols={{ lg: 12, md: 6, sm: 4 }}>
          <div className="p-4">
            <h1 className="text-2xl font-bold text-[#265197] mb-6">
              Mis Datos
            </h1>
            <p className="text-gray-600">
              No tienes acceso a ningún proyecto o asset en este momento.
            </p>
          </div>
        </Col>
      </Container>
    );
  }

  // Si hay assets, se redirigirá automáticamente al primero
  return null;
}

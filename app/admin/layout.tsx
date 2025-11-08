'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/shared/components/citrica-ui/organism/sidebar";
import { siteConfig } from "@/config/site";
import { UserAuth } from "@/shared/context/auth-context";
import Navbar from "@/shared/components/citrica-ui/organism/navbar";
import "@/styles/globals.scss";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userSession, userInfo, isInitializing } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir si ya terminó de inicializar y no hay sesión
    if (!isInitializing && userSession === null) {
      router.push('/login');
    }
  }, [userSession, isInitializing, router]);

  // Si está inicializando o no hay sesión, no renderizar nada
  if (isInitializing || userSession === null) {
    return null;
  }

  // Determinar qué items del sidebar mostrar según el rol
  const sidebarItems = userInfo?.role_id === 4
    ? siteConfig.sidebarItemsRole4
    : siteConfig.sidebarItems;

  return (
    <div className="container-general-pase-admin w-full flex justify-center">
      <div className="w-full max-w-[1920px]">
        <div className="h-full bg-[#FFFFFF] flex flex-row justify-start min-h-full">
          <Sidebar items={sidebarItems} session={userSession} />
          <div className="bg-[#FAF9F6] flex-1 text-white w-[80%] ">
            <Navbar session={userSession} />
            <div className="pt-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

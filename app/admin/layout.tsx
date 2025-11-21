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

  // Siempre llamar el hook, pero con undefined si no hay roleId
  const roleId = userInfo?.role_id ? Number(userInfo.role_id) : null;


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
  const sidebarItems = roleId
    ? siteConfig.sidebarItems.filter(item =>
        item.allowedRoles?.includes(roleId)
      )
    : [];

  
  return (
    <div className="container-general-pase-admin w-full flex justify-center">
      <div className="w-full">
        <div className="h-full bg-[#ECF0F9] flex flex-row justify-start min-h-full">
          <Sidebar items={sidebarItems} session={userSession} />
          <div className="bg-[#ECF0F9] flex-1 text-white w-[80%] ">
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

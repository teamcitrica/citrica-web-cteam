'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/shared/components/citrica-ui/organism/sidebar";
import { siteConfig } from "@/config/site";
import { UserAuth } from "@/shared/context/auth-context";
import Navbar from "@/shared/components/citrica-ui/organism/navbar";
import { useRoleData } from "@/hooks/role/use-role-data";
import "@/styles/globals.scss";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userSession, userInfo, isInitializing } = UserAuth();
  const router = useRouter();

  // Siempre llamar el hook, pero con undefined si no hay roleId
  const roleId = userInfo?.role_id;
  const { credentials, isLoading: isLoadingRoleData } = useRoleData(roleId);

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
  let sidebarItems = siteConfig.sidebarItems; // Default

  // Rol 4: Sidebar específico (CMS)
  if (roleId === 4) {
    sidebarItems = siteConfig.sidebarItemsRole4;
  }
  // Roles >= 5: Sidebar dinámico basado en credenciales
  else if (roleId && roleId >= 5) {
    if (isLoadingRoleData) {
      sidebarItems = [{ title: "Cargando...", icon: "Settings", href: "#" }];
    } else if (credentials && credentials.table_name) {
      sidebarItems = [
        {
          title: credentials.table_name,
          icon: "ClipboardCheck",
          href: `/admin/role-data/${roleId}`,
        }
      ];
    } else {
      sidebarItems = [{ title: "Sin configuración", icon: "Settings", href: "#" }];
    }
  }

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

'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/shared/components/citrica-ui/organism/sidebar";
import { siteConfig } from "@/config/site";
import { UserAuth } from "@/shared/context/auth-context";
import Navbar from "@/shared/components/citrica-ui/organism/navbar";
import { useUserAssets } from "@/hooks/user-assets/use-user-assets";

import "@/styles/globals.scss";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userSession, userInfo, isInitializing } = UserAuth();
  const router = useRouter();
  const [sidebarItemsWithAssets, setSidebarItemsWithAssets] = useState<any[]>([]);

  // Siempre llamar el hook, pero con undefined si no hay roleId
  const roleId = userInfo?.role_id ? Number(userInfo.role_id) : null;

  // Obtener los assets del usuario
  const { assets, isLoading: isLoadingAssets } = useUserAssets(userSession?.user?.id);

  useEffect(() => {
    // Solo redirigir si ya terminó de inicializar y no hay sesión
    if (!isInitializing && userSession === null) {
      router.push('/login');
    }
  }, [userSession, isInitializing, router]);

  useEffect(() => {
    // Determinar qué items del sidebar mostrar según el rol
    const baseItems = roleId
      ? siteConfig.sidebarItems.filter(item =>
          item.allowedRoles?.includes(roleId)
        )
      : [];

    // Si hay assets y el usuario tiene el rol de cliente (ROL_CLIENTE = 12)
    if (assets.length > 0 && roleId === 12) {
      const itemsWithAssets = baseItems.map(item => {
        // Si es el item "PROYECTOS", agregar los assets como subitems
        if (item.title === "PROYECTOS") {
          return {
            ...item,
            subItems: assets.map(asset => ({
              title: asset.name || "Sin nombre",
              href: `/admin/client/mis-datos/${asset.id}`,
            })),
          };
        }
        return item;
      });
      setSidebarItemsWithAssets(itemsWithAssets);
    } else {
      setSidebarItemsWithAssets(baseItems);
    }
  }, [roleId, assets]);

  // Si está inicializando o no hay sesión, no renderizar nada
  if (isInitializing || userSession === null) {
    return null;
  }


  return (
    <div className="container-general-pase-admin w-full flex justify-center">
      <div className="w-full">
        <div className="h-full bg-[#ECF0F9] flex flex-row justify-start min-h-full">
          <Sidebar items={sidebarItemsWithAssets} session={userSession} />
          <div className="bg-[#ECF0F9] flex-1 text-white w-[80%] ">
            <Navbar session={userSession} />
            <div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

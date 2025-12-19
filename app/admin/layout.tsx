'use client'
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [sidebarItemsWithAssets, setSidebarItemsWithAssets] = useState<any[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

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
    // Verificar permisos de ruta basados en los allowedRoles del sidebar
    if (!isInitializing && userSession && roleId && pathname) {
      // Buscar si la ruta actual coincide con algún item del sidebar
      const userHasAccess = siteConfig.sidebarItems.some(item => {
        // Verificar si la ruta actual comienza con el href del item
        const routeMatches = pathname.startsWith(item.href);
        // Verificar si el rol del usuario está en allowedRoles
        const roleAllowed = item.allowedRoles?.includes(roleId);

        // Si la ruta coincide, el rol debe estar permitido
        if (routeMatches) {
          return roleAllowed;
        }

        // También verificar subitems
        if (item.subItems && item.subItems.length > 0) {
          return item.subItems.some(subItem => {
            const subRouteMatches = pathname.startsWith(subItem.href);
            return subRouteMatches && roleAllowed;
          });
        }

        return false;
      });

      setHasAccess(userHasAccess);

      // Si no tiene acceso, redirigir según el rol
      if (!userHasAccess) {
        // Admin (rol 1) va a CRM
        if (roleId === 1) {
          router.push('/admin/crm/contactos');
        }
        // Cliente (rol 12) va a sus proyectos
        else if (roleId === 12) {
          router.push('/admin/client/mis-datos');
        }
        // Otros roles van a login
        else {
          router.push('/login');
        }
      }
    } else if (!isInitializing && userSession && roleId) {
      // Si no hay pathname aún, permitir acceso temporalmente
      setHasAccess(true);
    }
  }, [pathname, roleId, userSession, isInitializing, router]);

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

  // Si está inicializando, no hay sesión, o no tiene acceso, no renderizar nada
  if (isInitializing || userSession === null || hasAccess === false) {
    return null;
  }

  // Si aún no se ha verificado el acceso, no renderizar
  if (hasAccess === null) {
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

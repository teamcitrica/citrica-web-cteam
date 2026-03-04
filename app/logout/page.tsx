"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Text } from "citrica-ui-toolkit";

import { UserAuth } from "@/shared/context/auth-context";

export default function LogoutPage() {
  const { signOut } = UserAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut();
    router.push("/login");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#265197] rounded-2xl p-8 w-[340px] flex flex-col items-center gap-5 shadow-2xl">
        <img
          alt="Citrica Logo"
          className="h-10 w-auto"
          src="/img/citrica-logo.png"
        />

        <div className="text-center space-y-2">
          <Text as="h2" variant="title" className="!text-white" weight="bold">
            ¿Deseas cerrar sesión?
          </Text>
          <Text as="p" variant="body" className="!text-white/60 text-sm">
            Puedes volver a iniciar sesión en cualquier momento.
          </Text>
        </div>

        <div className="w-full space-y-3">
          <button
            className="w-full py-3 rounded-full bg-white text-[#265197] font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
            disabled={isLoading}
            onClick={handleLogout}
          >
            {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
          <button
            className="w-full py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            disabled={isLoading}
            onClick={handleCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

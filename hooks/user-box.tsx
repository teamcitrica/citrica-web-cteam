"use client";
import { UserAuth } from "@/shared/context/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { DropCitrica, DropdownItemConfig } from "@/shared/components/citrica-ui/organism/drop-citrica";

export const UserBox = () => {
  const { userInfo, signOut } = UserAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesión cerrada correctamente");
    router.push("/login");
  };

  const fullName = `${userInfo?.first_name || ""} ${userInfo?.last_name || ""}`.trim();

  // Configurar los items del dropdown
  const dropdownItems: DropdownItemConfig[] = [
    {
      key: "logout",
      label: "Cerrar sesión",
      onClick: handleLogout,
      icon: "LogOut",
      color: "default",
      className: "flex justify-center pl-[16px] py-[13px] text-[#265197] hover:bg-[#265197] hover:text-white transition-colors"
    }
  ];

  const handleItemClick = (key: string, item: DropdownItemConfig) => {
    // El manejo ya está en las funciones específicas de cada item
    // Pero puedes agregar lógica adicional aquí si necesitas
    console.log(`Clicked on: ${key}`);
  };

  return (
    <DropCitrica
      userName={fullName || "Usuario"}
      userAvatar={undefined} // Si tienes avatar del usuario, pásalo aquí
      items={dropdownItems}
      onItemClick={handleItemClick}
      triggerBackgroundColor="transparent"
      avatarSize={40}
      dropdownWidth="241px"
      dropdownHeight="96px"
      placement="bottom-start"
      showUserName={true}
      triggerClassName=""
    />
  );
};
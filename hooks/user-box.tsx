"use client";
import { UserAuth } from "@/shared/context/auth-context";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { toast } from "react-hot-toast";
import Icon from "@/shared/components/citrica-ui/atoms/icon";

export const UserBox = () => {
  const { userInfo, signOut } = UserAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesión cerrada correctamente");
    router.push("/login");
  };

  const fullName = `${userInfo?.first_name || ""} ${userInfo?.last_name || ""}`.trim();

  return (
    <Dropdown>
      <DropdownTrigger>
        <div className="flex items-center gap-2 rounded-full pl-1 pr-2 cursor-pointer bg-[#E9E6DD]">
          <div className="bg-white rounded-full p-[2px]">
            <Avatar
              isBordered={false}
              className="w-[40px] h-[40px]"
            />
          </div>
          <Icon name="ChevronDown" size={16} className="text-gray-600" />
        </div>
      </DropdownTrigger>

      <DropdownMenu aria-label="Opciones de usuario"
        classNames={{
          base: "w-[241px] h-[96px] p-0",
        }}
      >

        <DropdownItem key="name" className="bg-[#FAF9F6] pl-[16px] py-[13px] w-full text-name-users">
          {fullName || "Usuario"}
        </DropdownItem>
        <DropdownItem
          key="logout"
          className="flex justify-center pl-[16px] py-[13px] text-danger"
          color="danger"
          onClick={handleLogout}
          startContent={<Icon name="LogOut" size={16} />}
        >
          Cerrar sesión
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

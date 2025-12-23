"use client";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Divider,
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import { UserType } from "@/shared/types/types";
import Text from "@/shared/components/citrica-ui/atoms/text";
import Icon from "@/shared/components/citrica-ui/atoms/icon";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import { useUserCRUD } from "@/hooks/users/use-users";

interface AccessCredentialsModalProps {
  user: UserType;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AccessCredentialsModal({
  user,
  onClose,
  onSuccess,
}: AccessCredentialsModalProps) {
  const { updateUserByRole } = useUserCRUD();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isActive = user.active_users === true;
  const userName = user.full_name || user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim();

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      title: `${label} copiado`,
      description: `${label} ha sido copiado al portapapeles`,
      color: "success",
    });
  };

  const handleToggleAccess = async () => {
    if (!user.id) return;

    setIsLoading(true);
    const newActiveStatus = !isActive;

    try {
      await updateUserByRole(
        user.id,
        { active_users: newActiveStatus },
        String(user.role_id),
      );

      addToast({
        title: newActiveStatus ? "Acceso activado" : "Acceso desactivado",
        description: `El acceso al sistema para ${userName} ha sido ${newActiveStatus ? "activado" : "desactivado"}`,
        color: "success",
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error al cambiar acceso:", error);
      addToast({
        title: "Error",
        description: "No se pudo cambiar el acceso del usuario",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      className="w-[360px]"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="rounded-full flex items-center justify-center overflow-hidden" style={{ width: '46px', height: '46px' }}>
              <img src="/avatar-logueo-citrica.png" alt="Avatar" width="46" height="46" />
            </div>
            <div className="flex flex-col">
              <Text variant="body" weight="bold" color="#265197">{userName || "Sin nombre"}</Text>
              <Text variant="label" weight="bold" color="#678CC5">{user.cargo || "-"}</Text>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="bg-[#EEF1F7] rounded-xl">
          <div className="flex flex-col gap-4">
            {/* Información del usuario */}
            <div className="flex flex-row gap-2">
              <Text variant="body" weight="bold" color="#265197">Empresa</Text>
              <Text variant="body" weight="bold" color="#265197">{user.company?.name || "-"}</Text>
            </div>
            <div className="flex flex-col gap-1">
              <Text variant="label" color="#678CC5">Rol</Text>
              <Text variant="body" color="#16305A">{user.role?.name || "-"}</Text>
            </div>

            {/* Email de Acceso */}
            <div className="flex flex-col">
              <Text variant="label" color="#678CC5">Email de Acceso</Text>
              <div className="flex items-center gap-2">
                <Text variant="body" color="#333" className="flex-1 font-mono text-sm">
                  {user.email || "-"}
                </Text>
                {user.email && (
                  <Tooltip content="Copiar email">
                    <div
                      className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={() => handleCopyToClipboard(user.email || "", "Email")}
                    >
                      <Icon name="Copy" color="#678CC5" size={20} />
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>

            <Divider className="bg-[#A7BDE2]" />

            {/* Estado del Usuario */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex flex-row gap-2">
                <Text variant="body" weight="bold" color="#265197">Acceso:</Text>
                <div className="flex flex-row gap-1">
                  <Icon
                    size={20}
                    className={`${isActive ? "text-[#10E5A4]" : "text-[#F04242]"}`}
                    name={isActive ? "ShieldCheck" : "ShieldX"}
                  />
                  <Text variant="body" weight="bold" color={isActive ? "#059669" : "#DC2626"}>
                    {isActive ? "Habilitado" : "Inhabilitado"}
                  </Text>
                </div>
              </div>

              <Text variant="label" color="#678CC5">
                {isActive ? "" : "Este usuario tiene el acceso inhabilitado. Puedes reactivarlo para permitirle iniciar sesión nuevamente."}
              </Text>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between">
          <ButtonCitricaAdmin
            variant="secondary"
            onPress={onClose}
            className="w-[162px]"
          >
            Cerrar
          </ButtonCitricaAdmin>

          {isActive ? (
            <ButtonCitricaAdmin
              variant="primary"
              className="bg-[#F04242] w-[162px] !border-0"
              onPress={handleToggleAccess}
              isLoading={isLoading}
            >
              Inhabilitar
            </ButtonCitricaAdmin>
          ) : (
            <ButtonCitricaAdmin
              variant="primary"
              className="bg-[#10E5A4] text-[#16305A] w-[162px] !border-0"
              onPress={handleToggleAccess}
              isLoading={isLoading}
            >
              Habilitar
            </ButtonCitricaAdmin>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

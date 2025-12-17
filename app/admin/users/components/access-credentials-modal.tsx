"use client";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
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
          <h3 className="text-lg font-semibold text-[#265197]">
            Credenciales de Acceso
          </h3>
        </ModalHeader>

        <ModalBody className="bg-[#EEF1F7] rounded-xl">
          <div className="flex flex-col gap-4">
            {/* Información del usuario */}
            <div className="flex flex-col gap-1">
              <Text variant="label" color="#666">Nombre del Usuario</Text>
              <Text variant="body" color="#265197" weight="bold">{userName || "-"}</Text>
            </div>

            {/* Email de Acceso */}
            <div className="flex flex-col gap-2">
              <Text variant="label" color="#666">Email de Acceso</Text>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <Icon className="w-4 h-4 text-gray-500" name="Mail" />
                <Text variant="body" color="#333" className="flex-1 font-mono text-sm">
                  {user.email || "-"}
                </Text>
                {user.email && (
                  <Tooltip content="Copiar email">
                    <div
                      className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={() => handleCopyToClipboard(user.email || "", "Email")}
                    >
                      <Icon name="Copy" className="text-gray-500 w-4 h-4" />
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Rol */}
            <div className="flex flex-col gap-2">
              <Text variant="label" color="#666">Rol</Text>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <Icon className="w-4 h-4 text-gray-500" name="ShieldCheck" />
                <Text variant="body" color="#333" className="flex-1">
                  {user.role?.name || "-"}
                </Text>
              </div>
            </div>

            {/* Empresa */}
            {user.company && (
              <div className="flex flex-col gap-2">
                <Text variant="label" color="#666">Empresa</Text>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                  <Icon className="w-4 h-4 text-gray-500" name="Building" />
                  <Text variant="body" color="#333" className="flex-1">
                    {user.company.name || "-"}
                  </Text>
                </div>
              </div>
            )}

            {/* Estado del Usuario */}
            <div className="flex items-center gap-2 p-3 rounded-lg border" style={{
              backgroundColor: isActive ? '#f0fdf4' : '#fef2f2',
              borderColor: isActive ? '#86efac' : '#fca5a5'
            }}>
              <Icon
                className={`w-5 h-5 ${isActive ? "text-green-600" : "text-red-600"}`}
                name={isActive ? "CheckCircle" : "XCircle"}
              />
              <Text variant="body" color={isActive ? "#059669" : "#DC2626"}>
                {isActive ? "Acceso activo al sistema" : "Acceso desactivado"}
              </Text>
            </div>

            {!isActive && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Este usuario tiene el acceso desactivado. Puede reactivarlo para permitirle iniciar sesión nuevamente.
                </p>
              </div>
            )}
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
              className="bg-[#42668A] w-[162px]"
              onPress={handleToggleAccess}
              isLoading={isLoading}
            >
              Quitar Acceso
            </ButtonCitricaAdmin>
          ) : (
            <ButtonCitricaAdmin
              variant="primary"
              className="bg-[#42668A] w-[162px]"
              onPress={handleToggleAccess}
              isLoading={isLoading}
            >
              Reactivar Acceso
            </ButtonCitricaAdmin>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

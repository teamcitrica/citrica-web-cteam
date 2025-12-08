"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { addToast } from "@heroui/toast";

import { useUserRole } from "@/hooks/role/use-role";
import { useUserCRUD } from "@/hooks/users/use-users";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { InputCitricaAdmin, SelectCitricaAdmin, ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import { SelectItem } from "@heroui/react";
import Text from "@/shared/components/citrica-ui/atoms/text";

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CreateUserModal = ({
  isOpen,
  onClose,
}: CreateUserModalProps) => {
  const { createUserByRole, isLoading } = useUserCRUD();
  const { roles, fetchRoles } = useUserRole();
  const { companies, fetchCompanies } = useCompanyCRUD();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "contraseña",
    role_id: "",
    company_id: "",
  });

  useEffect(() => {
    fetchRoles();
    fetchCompanies();
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.role_id
    ) {
      addToast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos obligatorios",
        color: "warning",
      });
      return;
    }

    const newUser = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      company_id: formData.company_id ? Number(formData.company_id) : undefined,
    };

    try {
      await createUserByRole(newUser, formData.role_id);

      addToast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
        color: "success",
      });

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "contraseña",
        role_id: "",
        company_id: "",
      });
      onClose();
    } catch (error: any) {
      console.error("Error al crear el usuario:", error);

      const errorMessage = error?.message || String(error);

      if (errorMessage.includes("already") ||
          errorMessage.includes("duplicate") ||
          errorMessage.includes("already been registered")) {
        addToast({
          title: "Error",
          description: "El email ya está registrado. Por favor, intente con otro email.",
          color: "danger",
        });
      } else {
        addToast({
          title: "Error",
          description: `Ocurrió un error al crear el usuario: ${errorMessage}`,
          color: "danger",
        });
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      placement="center"
      backdrop="opaque"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <Text variant="headline" color="#265197">Crear Usuario</Text>
        </ModalHeader>

        <ModalBody>
          <div className="flex flex-col gap-4">
            <InputCitricaAdmin
              label="Nombre"
              placeholder="Ingrese el nombre"
              value={formData.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />

            <InputCitricaAdmin
              label="Apellido"
              placeholder="Ingrese el apellido"
              value={formData.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />

            <InputCitricaAdmin
              label="Email"
              type="email"
              placeholder="Ingrese el email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <InputCitricaAdmin
              label="Contraseña"
              type="password"
              placeholder="Ingrese la contraseña"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />

            <SelectCitricaAdmin
              label="Rol"
              placeholder="Seleccione un rol"
              selectedKeys={formData.role_id ? [formData.role_id] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleChange("role_id", selected);
              }}
            >
              {roles.map((role) => (
                <SelectItem
                  key={String(role.id)}
                  classNames={{
                    base: "!border-none data-[hover=true]:bg-gray-100 data-[hover=true]:!border-none data-[selectable=true]:focus:bg-gray-200 data-[selectable=true]:focus:!border-none !outline-none",
                    wrapper: "!border-none",
                  }}
                  style={{
                    border: 'none',
                    borderColor: 'transparent',
                    borderWidth: '0',
                  } as React.CSSProperties}
                >
                  {role.name}
                </SelectItem>
              ))}
            </SelectCitricaAdmin>

            {formData.role_id && Number(formData.role_id) !== 1 && (
              <SelectCitricaAdmin
                label="Empresa"
                placeholder="Seleccione una empresa"
                selectedKeys={formData.company_id ? [formData.company_id] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  handleChange("company_id", selected);
                }}
              >
                {companies.map((company) => (
                  <SelectItem
                    key={String(company.id)}
                    classNames={{
                      base: "!border-none data-[hover=true]:bg-gray-100 data-[hover=true]:!border-none data-[selectable=true]:focus:bg-gray-200 data-[selectable=true]:focus:!border-none !outline-none",
                      wrapper: "!border-none",
                    }}
                    style={{
                      border: 'none',
                      borderColor: 'transparent',
                      borderWidth: '0',
                    } as React.CSSProperties}
                  >
                    {company.name || "Sin nombre"}
                  </SelectItem>
                ))}
              </SelectCitricaAdmin>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <ButtonCitricaAdmin
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </ButtonCitricaAdmin>
          <ButtonCitricaAdmin
            variant="primary"
            style={{ backgroundColor: "#42668A" }}
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Guardar Usuario
          </ButtonCitricaAdmin>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateUserModal;

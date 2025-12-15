"use client";

import { useEffect, useState } from "react";
import { addToast } from "@heroui/toast";
import { Eye, EyeOff } from "lucide-react";

import { useUserRole } from "@/hooks/role/use-role";
import { useUserCRUD } from "@/hooks/users/use-users";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { UserType } from "@/shared/types/types";
import { InputCitricaAdmin, SelectCitricaAdmin, ButtonCitricaAdmin, DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import { SelectItem } from "@heroui/react";
import Text from "@/shared/components/citrica-ui/atoms/text";

type UserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user?: UserType | null; // Si existe user, es modo editar; si es null/undefined, es modo crear
};

const UserFormModal = ({ isOpen, onClose, onSuccess, user }: UserFormModalProps) => {
  const isEditMode = !!user;
  const { createUserByRole, updateUserByRole, isLoading } = useUserCRUD();
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

  const [originalData, setOriginalData] = useState({
    first_name: "",
    last_name: "",
    role_id: "",
    company_id: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    email: false,
    password: false,
    role_id: false,
  });

  useEffect(() => {
    fetchRoles();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (isEditMode && user) {
      const userData = {
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        password: "contraseña",
        role_id: user.role_id?.toString() || "",
        company_id: user.company_id?.toString() || "",
      };
      setFormData(userData);
      setOriginalData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role_id: user.role_id?.toString() || "",
        company_id: user.company_id?.toString() || "",
      });
    } else {
      // Resetear formulario en modo crear
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role_id: "",
        company_id: "",
      });
      setOriginalData({
        first_name: "",
        last_name: "",
        role_id: "",
        company_id: "",
      });
    }
    // Limpiar errores al cambiar de modo
    setErrors({
      first_name: false,
      last_name: false,
      email: false,
      password: false,
      role_id: false,
    });
  }, [user, isEditMode]);

  // Verificar si hay cambios en el formulario (solo para modo editar)
  const hasChanges = () => {
    if (!isEditMode) return true;
    return (
      formData.first_name !== originalData.first_name ||
      formData.last_name !== originalData.last_name ||
      formData.role_id !== originalData.role_id ||
      formData.company_id !== originalData.company_id
    );
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      first_name: !formData.first_name.trim(),
      last_name: !formData.last_name.trim(),
      email: !formData.email.trim(),
      password: !isEditMode && !formData.password.trim(),
      role_id: !formData.role_id,
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error);

    if (hasErrors) {
      addToast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos obligatorios",
        color: "warning",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (isEditMode) {
      // Modo editar
      const updatedUser: Partial<UserType> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        role_id: Number(formData.role_id),
        company_id: formData.company_id ? Number(formData.company_id) : undefined,
      };

      try {
        const result = await updateUserByRole(user!.id!, updatedUser as UserType, formData.role_id);

        if (result?.error) {
          addToast({
            title: "Error al actualizar",
            description: "No se pudo actualizar el usuario. Por favor, intente nuevamente.",
            color: "danger",
          });
          return;
        }

        addToast({
          title: "Usuario actualizado",
          description: "El usuario ha sido actualizado correctamente",
          color: "success",
        });
        onSuccess?.();
        onClose();
      } catch (error) {
        console.error("Error inesperado al editar el usuario:", error);
        addToast({
          title: "Error inesperado",
          description: "Por favor, intente nuevamente.",
          color: "danger",
        });
      }
    } else {
      // Modo crear
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
        onSuccess?.();
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
    }
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Editar Usuario" : "Crear Usuario"}
      size="lg"
      footer={
        <>
          <ButtonCitricaAdmin
            variant="secondary"
            onPress={onClose}
          >
            Cancelar
          </ButtonCitricaAdmin>
          <ButtonCitricaAdmin
            variant="primary"
            style={{ backgroundColor: "#42668A" }}
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={isEditMode && !hasChanges()}
          >
            {isEditMode ? "Actualizar Usuario" : "Guardar Usuario"}
          </ButtonCitricaAdmin>
        </>
      }
    >
      <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
        {/* Campos fake para engañar al autofill del navegador */}
        <input type="text" name="fake_username" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} tabIndex={-1} />
        <input type="password" name="fake_password" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} tabIndex={-1} />

            <div className="flex flex-col gap-4">
              <InputCitricaAdmin
                label="Nombre *"
                placeholder="Ingrese el nombre"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                isInvalid={errors.first_name}
                errorMessage={errors.first_name ? "El nombre es obligatorio" : ""}
                autoComplete="off"
                name="user_first_name_modal"
              />

              <InputCitricaAdmin
                label="Apellido *"
                placeholder="Ingrese el apellido"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                isInvalid={errors.last_name}
                errorMessage={errors.last_name ? "El apellido es obligatorio" : ""}
                autoComplete="off"
                name="user_last_name_modal"
              />

              <InputCitricaAdmin
                label="Email *"
                type="email"
                placeholder="Ingrese el email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                isDisabled={isEditMode}
                isInvalid={errors.email}
                errorMessage={errors.email ? "El email es obligatorio" : ""}
                autoComplete="off"
                name="user_email_modal"
              />

              {!isEditMode && (
                <InputCitricaAdmin
                  label="Contraseña *"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese la contraseña"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  isInvalid={errors.password}
                  errorMessage={errors.password ? "La contraseña es obligatoria" : ""}
                  autoComplete="new-password"
                  name="user_password_modal"
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <EyeOff className="text-2xl text-default-400 pointer-events-none" size={20} />
                      ) : (
                        <Eye className="text-2xl text-default-400 pointer-events-none" size={20} />
                      )}
                    </button>
                  }
                />
              )}

            <SelectCitricaAdmin
              label="Rol *"
              placeholder="Seleccione un rol"
              selectedKeys={formData.role_id && roles.some(r => String(r.id) === formData.role_id) ? [formData.role_id] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleChange("role_id", selected);
              }}
              isInvalid={errors.role_id}
              errorMessage={errors.role_id ? "El rol es obligatorio" : ""}
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
                selectedKeys={formData.company_id && companies.some(c => String(c.id) === formData.company_id) ? [formData.company_id] : []}
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
          </form>
    </DrawerCitricaAdmin>
  );
};

export default UserFormModal;

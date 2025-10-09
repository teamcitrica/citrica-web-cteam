"use client";

import { useEffect, useState } from "react";

import { useUserRole } from "@/hooks/role/use-role";
import { useAdminUser } from "@/hooks/users/use-admin-user";
import { Input } from "@/shared/components/citrica-ui";

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CreateUserModal = ({
  isOpen,
  onClose,
}: CreateUserModalProps) => {
  const { createUserByRole, isLoading } = useAdminUser();
  const { roles, fetchRoles } = useUserRole();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "contraseña",
    role_id: "",
    is_switchable: false,
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.role_id
    ) {
      alert("Todos los campos son obligatorios");

      return;
    }

    const newUser = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      is_switchable: formData.is_switchable,
      role_id: formData.role_id,
    };

    try {
      const { data, error } = await createUserByRole(newUser, formData.role_id);

      if (error) {
        switch (error.status) {
          case 422:
            alert("El email ya está registrado. Intente con otro.");
            break;
          default:
            alert("Ocurrió un error al crear el usuario. Intente nuevamente.");
            console.error("Error no manejado:", error);
        }

        return;
      }

      alert("Usuario agregado correctamente");
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "contraseña",
        role_id: "",
        is_switchable: false,
      });
      // Cerrar el modal tras crear el usuario
      onClose();
    } catch (error) {
      console.error("Error inesperado al crear el usuario:", error);
      alert("Error inesperado. Por favor, intente nuevamente.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-md p-6 w-full max-w-md relative">
        {/* Botón de cerrar */}
        <button className="absolute top-2 right-2 text-black" onClick={onClose}>
          X
        </button>
        <div className="flex flex-col gap-4">
          <Input
            name="first_name"
            placeholder="Primer nombre"
            type="text"
            value={formData.first_name}
            onChange={handleChange}
          />
          <Input
            name="last_name"
            placeholder="Apellido"
            type="text"
            value={formData.last_name}
            onChange={handleChange}
          />
          <Input
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            name="password"
            placeholder="Contraseña"
            type="text"
            value={formData.password}
            onChange={handleChange}
          />
          <select
            className="border rounded-md p-2 text-black"
            name="role_id"
            value={formData.role_id}
            onChange={handleChange}
          >
            <option value="">Selecciona un rol</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {(formData.role_id === "4" || formData.role_id === "7") && (
            <label className="flex items-center gap-2 text-black">
              <input
                checked={formData.is_switchable}
                className="w-4 h-4"
                name="is_switchable"
                type="checkbox"
                onChange={handleChange}
              />
              ¿Este usuario podrá alternar entre Cajero y Mesero?
            </label>
          )}

          <button
            className="mt-4 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Guardar Usuario
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;

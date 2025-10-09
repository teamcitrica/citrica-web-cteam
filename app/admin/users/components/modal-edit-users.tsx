"use client";

import { useEffect, useState } from "react";


import { useUserRole } from "@/hooks/role/use-role";
import { useAdminUser } from "@/hooks/users/use-admin-user";
import { UserType } from "@/shared/types/types";
import { Input } from "@/shared/components/citrica-ui";

type EditUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserType; // Usuario a editar
};

const EditUserModal = ({ isOpen, onClose, user }: EditUserModalProps) => {
  const { updateUserByRole } = useAdminUser();
  const { roles, fetchRoles } = useUserRole();

  const [formData, setFormData] = useState({
    name: user.name,
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    password: "",
    role_id: user.role_id.toString() || "",
    is_switchable: user.is_switchable || false,
  });

  // Cargar los roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, []);

  // Actualizar el formulario si la información del usuario cambia
  useEffect(() => {
    setFormData({
      name: user.name,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      password: "",
      role_id: user.role_id.toString() || "",
      is_switchable: user.is_switchable || false,
    });
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
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

    // Construir el objeto actualizado según la definición de NewUserType
    const updatedUser: UserType = {
      name: `${formData.first_name} ${formData.last_name}`,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      user_metadata: {
        name: `${formData.first_name} ${formData.last_name}`,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role_id: formData.role_id,
      },
      role_id: Number(formData.role_id),
      ...(formData.password && { password: formData.password }),
      is_switchable: formData.is_switchable,
    };

    try {
      // Llamada a la función updateUserByRole, pasando user.id, updatedUser, company_id ("1") y el role_id
      await updateUserByRole(user.id, updatedUser, formData.role_id);
      alert("Usuario actualizado correctamente");
      onClose();
    } catch (error) {
      console.error("Error inesperado al editar el usuario:", error);
      alert("Error inesperado. Por favor, intente nuevamente.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-md p-6 w-full max-w-md relative">
        {/* Botón para cerrar el modal */}
        <button className="absolute top-2 right-2 text-black" onClick={onClose}>
          X
        </button>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Editar Usuario</h2>
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
            placeholder="Contraseña (dejar en blanco para mantener actual)"
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
            Editar Usuario
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;

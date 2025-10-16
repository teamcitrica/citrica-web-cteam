"use client";

import { useEffect, useState } from "react";
import { addToast } from "@heroui/toast";

import { useUserRole } from "@/hooks/role/use-role";
import { useUserCRUD } from "@/hooks/users/use-users";
import { UserType } from "@/shared/types/types";
import { Input } from "@/shared/components/citrica-ui";

type EditUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserType; // Usuario a editar
};

const EditUserModal = ({ isOpen, onClose, user }: EditUserModalProps) => {
  const { updateUserByRole } = useUserCRUD();
  const { roles, fetchRoles } = useUserRole();

  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    role_id: user.role_id.toString() || "",
  });

  // Cargar los roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Actualizar el formulario si la información del usuario cambia
  useEffect(() => {
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      role_id: user.role_id.toString() || "",
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
      addToast({
        title: "Campos requeridos",
        description: "Todos los campos son obligatorios",
        color: "warning",
      });

      return;
    }

    // Construir el objeto actualizado
    const updatedUser: Partial<UserType> = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      role_id: Number(formData.role_id),
    };

    console.log("Datos a actualizar:", updatedUser);
    console.log("ID del usuario:", user.id);
    console.log("Role ID:", formData.role_id);

    try {
      // Llamada a la función updateUserByRole, pasando user.id, updatedUser y el role_id
      const result = await updateUserByRole(user.id!, updatedUser as UserType, formData.role_id);

      console.log("Resultado de la actualización:", result);

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
      onClose();
    } catch (error) {
      console.error("Error inesperado al editar el usuario:", error);
      addToast({
        title: "Error inesperado",
        description: "Por favor, intente nuevamente.",
        color: "danger",
      });
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

"use client";

import { useState } from "react";
import { addToast } from "@heroui/toast";
import { useUserRole } from "@/hooks/role/use-role";
import { Input } from "citrica-ui-toolkit";

type CreateRoleModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CreateRoleModal = ({ isOpen, onClose }: CreateRoleModalProps) => {
  const { createRole } = useUserRole();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      addToast({
        title: "Campos requeridos",
        description: "Todos los campos son obligatorios",
        color: "warning",
      });

      return;
    }

    try {
      const result = await createRole(formData);

      if (result?.success) {
        // Limpiar formulario
        setFormData({
          name: "",
          description: "",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error inesperado al crear el rol:", error);
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
          <h2 className="text-xl font-bold text-black">Crear Nuevo Rol</h2>

          <Input
            name="name"
            placeholder="Nombre del rol"
            type="text"
            value={formData.name}
            onChange={handleChange}
            variant="faded"
            classNames={{
              inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
              label: "!text-[#265197]",
              input: "placeholder:text-[#A7BDE2] !text-[#265197]",
            }}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">
              Descripción
            </label>
            <textarea
              name="description"
              placeholder="Descripción del rol"
              value={formData.description}
              onChange={handleChange}
              className="border rounded-md p-2 text-black min-h-[100px]"
            />
          </div>

          <button
            className="mt-4 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Crear Rol
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoleModal;

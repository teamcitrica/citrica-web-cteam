"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import AttachCredentialsModal from "./components/modal-attach-credentials";

export default function AdjuntarCredencialesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Adjuntar Credenciales</h1>
          <p className="text-gray-600 mt-2">
            Configura las credenciales de Supabase para los roles
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onPress={() => setIsModalOpen(true)}
        >
          Adjuntar Credenciales
        </Button>
      </div>

      {/* Modal para adjuntar credenciales */}
      <AttachCredentialsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

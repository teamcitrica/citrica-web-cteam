"use client";

import { useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Switch } from "@heroui/switch";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Divider } from "@heroui/divider";

import { Text, Button, Icon } from "citrica-ui-toolkit";

import type { ServiceType } from "../page";

const columns = [
  { name: "NOMBRE", uid: "name", sortable: true },
  { name: "DESCRIPCIÓN", uid: "description" },
  { name: "ESTADO", uid: "is_active" },
  { name: "ACCIONES", uid: "actions" },
];

interface ServiceTypesTableProps {
  types: ServiceType[];
  onEdit: (type: ServiceType) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
}

export default function ServiceTypesTable({
  types,
  onEdit,
  onDelete,
  onToggleActive,
}: ServiceTypesTableProps) {
  const [typeToDelete, setTypeToDelete] = useState<ServiceType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = useCallback((type: ServiceType) => {
    setTypeToDelete(type);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = () => {
    if (!typeToDelete) return;
    onDelete(typeToDelete.id);
    setIsDeleteModalOpen(false);
    setTypeToDelete(null);
  };

  const renderCell = useCallback(
    (type: ServiceType, columnKey: React.Key) => {
      switch (columnKey) {
        case "name":
          return (
            <Text color="#1F2937" variant="label" weight="bold">
              {type.name}
            </Text>
          );
        case "description":
          return (
            <Text color="#4B5563" variant="label">
              {type.description || "-"}
            </Text>
          );
        case "is_active":
          return (
            <Switch
              classNames={{
                base: "group !bg-transparent transition-colors",
                wrapper:
                  "bg-gray-300 group-data-[selected=true]:bg-[#265197] rounded-full transition-colors",
                thumb: "!bg-white",
              }}
              color="default"
              isSelected={type.is_active}
              size="sm"
              onChange={() => onToggleActive(type.id)}
            />
          );
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Tooltip content="Editar">
                <button
                  className="text-lg cursor-pointer active:opacity-50 text-default-400 hover:text-blue-500"
                  onClick={() => onEdit(type)}
                >
                  <Icon name="Edit" size={20} />
                </button>
              </Tooltip>
              <Dropdown shouldBlockScroll={false}>
                <DropdownTrigger>
                  <button className="text-lg cursor-pointer active:opacity-50 text-default-400">
                    <Icon name="MoreVertical" size={20} />
                  </button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Acciones tipo de servicio"
                  onAction={(key) => {
                    if (key === "delete") handleDelete(type);
                  }}
                >
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<Icon name="Trash2" size={16} />}
                  >
                    Eliminar
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return null;
      }
    },
    [onEdit, onToggleActive, handleDelete],
  );

  return (
    <>
      <Table aria-label="Tabla de tipos de servicio" isStriped>
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "end" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent="No hay tipos de servicio creados" items={types}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        size="md"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTypeToDelete(null);
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 mt-4">
            <div className="flex items-center justify-center mb-2">
              <Icon color="#F04242" name="TriangleAlert" size={28} />
            </div>
            <h2 className="text-center">
              <Text color="#F04242" variant="title" weight="bold">
                Eliminar Tipo de Servicio
              </Text>
            </h2>
          </ModalHeader>
          <ModalBody>
            <p>
              <Text color="#1F1F1F" variant="body">
                ¿Estás seguro de que deseas eliminar el tipo{" "}
                <span className="font-semibold">
                  {typeToDelete?.name}
                </span>
                ?
              </Text>
            </p>
            <p className="mb-2">
              <Text color="#1F1F1F" variant="label">
                Si hay servicios con este tipo, no se podrá eliminar.
              </Text>
            </p>
            <Divider className="bg-[#94A3B8]" />
          </ModalBody>
          <ModalFooter>
            <div className="flex gap-3 justify-end">
              <Button
                isAdmin
                className="w-[162px]"
                variant="secondary"
                onPress={() => {
                  setIsDeleteModalOpen(false);
                  setTypeToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                isAdmin
                className="bg-[#F04242] w-[162px] !border-0"
                variant="primary"
                onPress={confirmDelete}
              >
                Eliminar
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

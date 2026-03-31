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

import type { Service, ServiceType } from "../page";

const columns = [
  { name: "NOMBRE", uid: "name", sortable: true },
  { name: "TIPO DE SERVICIO", uid: "typeId" },
  { name: "MONTO REF.", uid: "referenceAmount" },
  { name: "ESTADO", uid: "is_active" },
  { name: "ACCIONES", uid: "actions" },
];

interface ServicesTableProps {
  services: Service[];
  serviceTypes: ServiceType[];
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
}

export default function ServicesTable({
  services,
  serviceTypes,
  onEdit,
  onDelete,
  onToggleActive,
}: ServicesTableProps) {
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = useCallback((service: Service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = () => {
    if (!serviceToDelete) return;
    onDelete(serviceToDelete.id);
    setIsDeleteModalOpen(false);
    setServiceToDelete(null);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const renderCell = useCallback(
    (service: Service, columnKey: React.Key) => {
      switch (columnKey) {
        case "name":
          return (
            <Text color="#1F2937" variant="label" weight="bold">
              {service.name}
            </Text>
          );
        case "typeId":
          const typeName = serviceTypes.find((t) => t.id === service.typeId)?.name || "Sin tipo";

          return (
            <Text color="#4B5563" variant="label">
              {typeName}
            </Text>
          );
        case "referenceAmount":
          return (
            <Text color="#374151" variant="label" weight="medium">
              {formatAmount(service.referenceAmount)}
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
              isSelected={service.is_active}
              size="sm"
              onChange={() => onToggleActive(service.id)}
            />
          );
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Tooltip content="Editar">
                <button
                  className="text-lg cursor-pointer active:opacity-50 text-default-400 hover:text-blue-500"
                  onClick={() => onEdit(service)}
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
                  aria-label="Acciones servicio"
                  onAction={(key) => {
                    if (key === "delete") handleDelete(service);
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
    [onEdit, onToggleActive, handleDelete, serviceTypes],
  );

  return (
    <>
      <Table aria-label="Tabla de servicios" isStriped>
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
        <TableBody emptyContent="No hay servicios creados" items={services}>
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
          setServiceToDelete(null);
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 mt-4">
            <div className="flex items-center justify-center mb-2">
              <Icon color="#F04242" name="TriangleAlert" size={28} />
            </div>
            <h2 className="text-center">
              <Text color="#F04242" variant="title" weight="bold">
                Eliminar Servicio
              </Text>
            </h2>
          </ModalHeader>
          <ModalBody>
            <p>
              <Text color="#1F1F1F" variant="body">
                ¿Estás seguro de que deseas eliminar el servicio{" "}
                <span className="font-semibold">
                  {serviceToDelete?.name}
                </span>
                ?
              </Text>
            </p>
            <p className="mb-2">
              <Text color="#1F1F1F" variant="label">
                Esta acción no se puede deshacer.
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
                  setServiceToDelete(null);
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

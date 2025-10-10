"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Pagination,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { Button } from "@heroui/react";
import Icon from "@ui/atoms/icon";

import CreateUserModal from "../test-crud/create-user-modal";

import UserDetailModal from "./components/modal-details-users";
import EditUserModal from "./components/modal-edit-users";

import { UserType } from "@/shared/types/types";
import { useAdminUser } from "@/hooks/users/use-admin-user";
import Text from "@/shared/components/citrica-ui/atoms/text";
import { useUserRole } from "@/hooks/role/use-role";

const columns = [
  { name: "NOMBRE", uid: "nombre", sortable: true },
  { name: "ROL", uid: "rol", sortable: true },
  { name: "ACCIONES", uid: "actions" },
];
const INITIAL_VISIBLE_COLUMNS = ["nombre", "rol", "actions"];
const ITEMS_PER_PAGE = 15; // Cantidad de usuarios por página

interface CardUsersSuperProps {
  users: UserType[];
  refresh: any;
}

export default function CardUsersSuper({
  users,
  refresh,
}: CardUsersSuperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<Set<React.Key>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Estado para manejar los modales
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { refreshUsers } = useAdminUser();

  type LocalSortDescriptor = {
    column: string;
    direction: "ascending" | "descending";
  };

  const { roles, isLoading: rolesLoading, fetchRoles } = useUserRole();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    if (users.length > 0) {
      setIsLoading(false);
    }
  }, [users, refresh]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Re-fetch list
    refreshUsers();
  };

  const [sortDescriptor, setSortDescriptor] = useState<LocalSortDescriptor>({
    column: "nombre",
    direction: "ascending",
  });

  const headerColumns = useMemo(() => {
    if (visibleColumns.has("all")) return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredUsers = useMemo(() => {
    // Filtrar siempre para no mostrar usuarios con role_id === 5
    const usersWithoutRole5 = users.filter((user) => user.role_id !== 5);
    let filtered = usersWithoutRole5;

    // Si se selecciona un rol y no es "Todos", filtrar por el nombre del rol
    if (selectedRole && selectedRole !== "Todos") {
      filtered = filtered.filter(
        (user) => user.role?.name.toLowerCase() === selectedRole.toLowerCase(),
      );
    }

    // Filtro por búsqueda en el input
    if (searchTerm.trim()) {
      filtered = filtered.filter((user) => {
        const userName = user.full_name || user.name || `${user.first_name} ${user.last_name}`;
        return userName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filtered;
  }, [users, searchTerm, selectedRole, refresh]);

  // Ordenar usuarios por nombre
  const sortedItems = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const first = (a.full_name || a.name || `${a.first_name} ${a.last_name}`).toLowerCase();
      const second = (b.full_name || b.name || `${b.first_name} ${b.last_name}`).toLowerCase();
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredUsers, sortDescriptor]);

  // Calcular cantidad de páginas
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);

  // Obtener usuarios para la página actual
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;

    return sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedItems, page]);

  const handleViewUser = useCallback((user: UserType) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditUser = useCallback((user: UserType) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  // esta es la funcion que me filtra el buscador anotar pendiente
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const renderCell = useCallback(
    (user: UserType, columnKey: React.Key) => {
      switch (columnKey) {
        case "nombre":
          return (
            <div className="flex items-center gap-2 text-black">
              {user.full_name || user.name || `${user.first_name} ${user.last_name}`}
            </div>
          );
        case "rol":
          return (
            <p className="text-sm text-black capitalize">{user.role?.name}</p>
          );
        case "actions":
          return (
            <div className="flex items-end justify-center w-full gap-2">
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handleViewUser(user)}
              >
                <Icon className="w-5 h-5" name="Eye" />
              </button>
              <button
                className="text-green-500 hover:text-green-700"
                onClick={() => handleEditUser(user)}
              >
                <Icon className="w-5 h-5" name="SquarePen" />
              </button>
              <button className="text-red-500 hover:text-red-700">
                <Icon className="w-5 h-5" name="Trash2" />
              </button>
            </div>
          );
        default:
          return null;
      }
    },
    [handleViewUser, handleEditUser],
  );

  return isLoading ? (
    <div className="w-full h-40 flex justify-center items-center">
      <Spinner color="secondary" size="md" />
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      <div className="container-blue-principal">
        <div className="flex items-center gap-6">
          <Input
            className="text-[#3E688E] min-w-[268px]  "
            classNames={{
              inputWrapper:
                "!bg-[#F4F4F5] !text-[#3E688E] !placeholder-[#719BC1] input-ui-pro input-ui-pro",
              mainWrapper: "",
            }}
            placeholder="Buscar por nombre"
            startContent={
              <Icon className="mr-2" color="#719BC1" name="Search" />
            }
            value={searchTerm}
            variant="faded"
            onChange={handleSearchChange}
          />

          <Select
            aria-label="Seleccionar rol"
            className="max-w-[368px] ml-6 text-black ]"
            classNames={{
              trigger: "!h-10",
            }}
            placeholder="Seleccione un rol"
            selectedKeys={selectedRole ? new Set([selectedRole]) : new Set()}
            size="sm"
            onSelectionChange={(keys) => {
              let key: string;

              if (typeof keys === "string" || typeof keys === "number") {
                key = String(keys);
              } else {
                key = String(Array.from(keys)[0] ?? "Todos");
              }
              setSelectedRole(key);
            }}
          >
            <>
              <SelectItem textValue="roles" key="Todos">Todos</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.name}>{role.name}</SelectItem>
              ))}
            </>
          </Select>
        </div>

        <Button
          className="bg-[#ff5b00] mt-[10px] text-white py-[6px] px-[6px] rounded-lg  border-2 border-white"
          startContent={<Icon className="w-4 h-4" name="Plus" />}
          onClick={handleOpenModal}
        >
          <Text color="white" variant="label">
            Crear usuario
          </Text>
        </Button>
      </div>
      <Table
        aria-label="Tabla de Usuarios"
        selectedKeys={
          Array.from(selectedKeys) as Iterable<
            import("@react-types/shared").Key
          >
        }
        selectionMode="none"
        sortDescriptor={sortDescriptor}
        onSelectionChange={(keys) => setSelectedKeys(new Set(keys))}
        onSortChange={(descriptor) =>
          setSortDescriptor(descriptor as LocalSortDescriptor)
        }
        classNames={{
          wrapper: "bg-transparent", 
          th: "bg-[#ff5b00] text-[#fff] font-semibold text-center",
          td: "text-gray-700 text-center", 
        }}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align="center"
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={"No se encontraron usuarios"}
          items={paginatedItems}
        >
          {(item) => (
            <TableRow key={item.id} className="items-center">
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Paginación */}
      <div className="flex justify-center mt-4">
        <Pagination
          isCompact
          showControls
          showShadow
          classNames={{
            cursor: "!bg-[#ff5b00] text-white",
          }}
          page={page}
          total={totalPages}
          onChange={setPage}
        />
      </div>

      {/* Modal de detalles */}
      {isDetailModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Modal de edición */}
      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          user={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
            refresh();
          }}
        />
      )}

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

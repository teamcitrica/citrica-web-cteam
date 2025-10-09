"use client";
import { useEffect, useState } from "react";

import CreateUserModal from "../test-crud/create-user-modal";

import CardUsersSuper from "./card-users-user";

import { useAdminUser } from "@/hooks/users/use-admin-user";
import { Col, Container } from "@/styles/07-objects/objects";

export default function CardUsersSuperWithModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { users, isLoading, refreshUsers } = useAdminUser();

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Re-fetch list
    refreshUsers();
  };

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="">
          {/*este es el filtro ojito aca  */}

          <CardUsersSuper refresh={refreshUsers} users={users} />
          <CreateUserModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </div>
      </Col>
    </Container>
  );
}

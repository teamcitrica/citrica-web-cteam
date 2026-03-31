"use client";
import { Text, Col, Container } from "citrica-ui-toolkit";

export default function ServiciosPage() {
  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
        <Text as="h3" variant="title" weight="bold">
          <Text isAdmin={true} color="#678CC5" variant="title" weight="bold">
            Gestión de Servicios
          </Text>
          <Text isAdmin={true} color="#265197" variant="title" weight="bold">
            <span> {">"} </span> Servicios
          </Text>
        </Text>
      </Col>
    </Container>
  );
}

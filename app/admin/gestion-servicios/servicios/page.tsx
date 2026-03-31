"use client";
import { Text, Col, Container } from "citrica-ui-toolkit";

export default function ServiciosPage() {

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <h1 className="text-2xl font-bold mb-4">
          <Text color="#678CC5" variant="title" weight="bold">Gestión de Servicios</Text> {'>'} <Text color="#265197" variant="title" weight="bold">Servicios</Text>
        </h1>
      </Col>
    </Container>
  );
}

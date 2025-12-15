"use client";
import { useEffect } from "react";
import { Col, Container } from "@/styles/07-objects/objects";
import { useReservas } from "@/hooks/reservas/use-reservas";
import CardReservas from "./card-reservas";

const ReservasPage = () => {
  const { reservas, isLoading, refreshReservas } = useReservas();

  useEffect(() => {
    refreshReservas();
  }, [refreshReservas]);

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="">
          <CardReservas refresh={refreshReservas} reservas={reservas} />
        </div>
      </Col>
    </Container>
  );
};

export default ReservasPage;

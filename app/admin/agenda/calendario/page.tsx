"use client";
import BookingCalendarView from "../booking-calendar-view";
import { Text, Col, Container } from "citrica-ui-toolkit";

const CalendarioPage = () => {
  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
        <h1 className="text-2xl font-bold text-[#265197] mb-5">
          <Text isAdmin={true} variant="title" weight="bold" color="#678CC5">AGENDA</Text> {'>'}  <Text isAdmin={true} variant="title" weight="bold" color="#265197">Calendario</Text>
        </h1>
        <BookingCalendarView />
      </Col>
    </Container>
  );
};

export default CalendarioPage;

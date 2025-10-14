"use client";
import { Col, Container } from "@/styles/07-objects/objects";
import BookingCalendarView from "../booking-calendar-view";

const CalendarioPage = () => {
  return (
    <Container>
      <Col cols={{lg:12,md:6,sm:4}}>
            <BookingCalendarView />
      </Col>
    </Container>
  );
};

export default CalendarioPage;

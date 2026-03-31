export type Recurrence = "mensual" | "trimestral" | "semestral" | "anual";
export type PaymentStatus = "al_dia" | "pendiente_pago";

export interface ContractedService {
  id: number;
  contact_name: string;
  company_name: string;
  service_name: string;
  service_type_name: string;
  amount: number;
  start_date: string;
  end_date: string;
  recurrence: Recurrence;
  periods: number;
  status: PaymentStatus;
}

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  mensual: "Mensual",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  al_dia: "Al día",
  pendiente_pago: "Pendiente de pago",
};

export const MOCK_DATA: ContractedService[] = [
  {
    id: 1,
    contact_name: "Carlos Ramírez",
    company_name: "Tech Solutions SAC",
    service_name: "Hosting Premium",
    service_type_name: "Infraestructura",
    amount: 1500.0,
    start_date: "2025-01-15",
    end_date: "2026-01-15",
    recurrence: "mensual",
    periods: 12,
    status: "al_dia",
  },
  {
    id: 2,
    contact_name: "María López",
    company_name: "Innovatech EIRL",
    service_name: "Mantenimiento Web",
    service_type_name: "Mantenimiento",
    amount: 800.0,
    start_date: "2025-03-01",
    end_date: "2025-09-01",
    recurrence: "trimestral",
    periods: 2,
    status: "pendiente_pago",
  },
  {
    id: 3,
    contact_name: "Jorge Mendoza",
    company_name: "Digital Corp SA",
    service_name: "Diseño UX/UI",
    service_type_name: "Diseño",
    amount: 3500.0,
    start_date: "2025-02-10",
    end_date: "2026-02-10",
    recurrence: "semestral",
    periods: 2,
    status: "al_dia",
  },
  {
    id: 4,
    contact_name: "Ana Torres",
    company_name: "Tech Solutions SAC",
    service_name: "SEO Avanzado",
    service_type_name: "Marketing",
    amount: 1200.0,
    start_date: "2025-04-01",
    end_date: "2026-04-01",
    recurrence: "mensual",
    periods: 12,
    status: "al_dia",
  },
  {
    id: 5,
    contact_name: "Pedro García",
    company_name: "StartUp Labs SAC",
    service_name: "Soporte Técnico",
    service_type_name: "Infraestructura",
    amount: 600.0,
    start_date: "2025-01-01",
    end_date: "2026-01-01",
    recurrence: "anual",
    periods: 1,
    status: "pendiente_pago",
  },
  {
    id: 6,
    contact_name: "Lucía Fernández",
    company_name: "Innovatech EIRL",
    service_name: "Community Manager",
    service_type_name: "Marketing",
    amount: 950.0,
    start_date: "2025-05-15",
    end_date: "2025-11-15",
    recurrence: "mensual",
    periods: 6,
    status: "al_dia",
  },
];

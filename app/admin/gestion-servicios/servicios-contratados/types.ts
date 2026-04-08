export type Recurrence = "mensual" | "trimestral" | "semestral" | "anual";
export type PaymentStatus = "al_dia" | "pendiente_pago" | "finalizado";

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  mensual: "Mensual",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  al_dia: "Al día",
  pendiente_pago: "Pendiente de pago",
  finalizado: "Finalizado",
};

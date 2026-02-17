import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Reserva } from "@/hooks/reservas/use-reservas";
import { Text, Button, Icon } from "citrica-ui-toolkit";

type ReminderColumnsConfig = {
  onView: (reminder: Reserva) => void;
  onEdit: (reminder: Reserva) => void;
  onDelete: (reminder: Reserva) => void;
};

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAYS_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MONTHS_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const formatRelativeDate = (dateStr: string | null): string => {
  if (!dateStr) return "Sin fecha";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(dateStr + "T00:00:00");
  date.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays === -1) return "Ayer";

  return `${DAYS[date.getDay()]}. ${date.getDate()} de ${MONTHS_SHORT[date.getMonth()]}. de ${date.getFullYear()}`;
};

const formatTimeRange = (timeSlots: string[]): string => {
  if (!timeSlots || timeSlots.length === 0) return "";

  if (timeSlots.length === 1 && timeSlots[0].includes("-")) {
    const [start, end] = timeSlots[0].split("-");
    return `${start} - ${end}`;
  }

  const sorted = [...timeSlots].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const [h, m] = last.split(":").map(Number);
  const endMinutes = h * 60 + m + 30;
  const endH = String(Math.floor(endMinutes / 60)).padStart(2, "0");
  const endM = String(endMinutes % 60).padStart(2, "0");

  return `${first} - ${endH}:${endM}`;
};

const ORDINALS = ["primer", "segundo", "tercer", "cuarto", "quinto"];

const getRecurrenceText = (reminder: Reserva): string | null => {
  const recurring = reminder.recurring;
  if (!recurring || recurring === "none") return null;

  const date = reminder.booking_date ? new Date(reminder.booking_date + "T00:00:00") : null;

  switch (recurring) {
    case "daily":
      return "Se repite todos los días";
    case "weekly":
      return date ? `Se repite cada semana el ${DAYS_FULL[date.getDay()].toLowerCase()}` : "Se repite semanalmente";
    case "monthly": {
      if (!date) return "Se repite mensualmente";
      const weekIndex = Math.floor((date.getDate() - 1) / 7);
      const ordinal = ORDINALS[weekIndex] || `${weekIndex + 1}°`;
      return `Se repite cada mes el ${ordinal} ${DAYS_FULL[date.getDay()].toLowerCase()}`;
    }
    case "yearly":
      return date ? `Se repite anualmente el ${date.getDate()} de ${MONTHS_FULL[date.getMonth()]}` : "Se repite anualmente";
    case "weekdays":
      return "Se repite todos los días hábiles";
    default: {
      try {
        const config = JSON.parse(recurring);
        const unitLabels: Record<string, string> = { day: "día(s)", week: "semana(s)", month: "mes(es)", year: "año(s)" };
        return `Se repite cada ${config.interval} ${unitLabels[config.unit] || config.unit}`;
      } catch {
        return null;
      }
    }
  }
};

export const getReminderColumns = ({
  onView,
  onEdit,
  onDelete,
}: ReminderColumnsConfig): Column<Reserva>[] => [
  {
    name: "FECHA Y HORA",
    uid: "booking_date",
    sortable: true,
    render: (reminder) => (
      <div className="flex flex-col">
        <Text isAdmin={true} variant="body" weight="bold" color="#16305A">
          {formatRelativeDate(reminder.booking_date)}
        </Text>
        <Text isAdmin={true} variant="label" color="#678CC5">
          {formatTimeRange(reminder.time_slots)}
        </Text>
      </div>
    ),
  },
  {
    name: "ASUNTO",
    uid: "name",
    sortable: true,
    render: (reminder) => {
      const recurrence = getRecurrenceText(reminder);
      return (
        <div className="flex flex-col">
          <Text isAdmin={true} variant="body" weight="bold" color="#16305A">
            {reminder.name || "Sin título"}
          </Text>
          {recurrence && (
            <Text isAdmin={true} variant="label" color="#678CC5">
              {recurrence}
            </Text>
          )}
        </div>
      );
    },
  },
  {
    name: "MENSAJE",
    uid: "message",
    sortable: false,
    render: (reminder) => (
      <div className="max-w-[300px]">
        <p className="truncate">
          <Text isAdmin={true} variant="label" color="#678CC5">
            {reminder.message || "-"}
          </Text>
        </p>
      </div>
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    sortable: false,
    align: "end",
    render: (reminder) => (
      <div
        className="relative flex justify-end items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          isAdmin={true}
          isIconOnly
          variant="flat"
          onPress={() => onView(reminder)}
          className="hover:!bg-transparent !p-1 !min-w-0"
        >
          <Icon className="w-5 h-5 text-[#265197]" name="Eye" />
        </Button>

        <Dropdown>
          <DropdownTrigger>
            <Button isAdmin={true} isIconOnly variant="flat" size="sm" className="!p-1 !min-w-0 hover:!bg-transparent">
              <Icon className="text-[#265197] w-5 h-5" name="EllipsisVertical" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Acciones del recordatorio"
            onAction={(key) => {
              switch (key) {
                case "edit":
                  onEdit(reminder);
                  break;
                case "delete":
                  onDelete(reminder);
                  break;
              }
            }}
          >
            <DropdownItem key="edit">Editar</DropdownItem>
            <DropdownItem key="delete" className="text-danger" color="danger">
              Eliminar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  },
];

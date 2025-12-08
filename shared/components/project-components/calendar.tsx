import { Calendar } from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";

interface CalendarComponentProps {
  value?: any;
  onChange?: (date: any) => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  minValue?: any;
  disabledRanges?: Array<[any, any]>;
  isDateFullyBooked?: (date: string) => boolean;
  serverToday?: any; // Nueva prop para la fecha del servidor
}

export default function CalendarComponent({
  value,
  onChange,
  className = "",
  variant = 'primary',
  minValue,
  disabledRanges = [],
  isDateFullyBooked,
  serverToday,
}: CalendarComponentProps) {
  let { locale } = useLocale();

  // Usar serverToday si está disponible, sino usar la fecha del cliente
  const effectiveToday = serverToday || today(getLocalTimeZone());
  const effectiveMinValue = minValue !== undefined ? minValue : effectiveToday;

  let isDateUnavailable = (date: any) => {
    // Verificar si es domingo específicamente
    // isWeekend incluye sábado y domingo, pero queremos solo domingo
    const jsDate = date.toDate(getLocalTimeZone());
    const isSunday = jsDate.getDay() === 0; // 0 = Domingo en JavaScript

    // Verificar si la fecha es anterior a hoy (usando la fecha del servidor si está disponible)
    const isPastDate = date.compare(effectiveToday) < 0;

    // Obtener fecha directamente del objeto CalendarDate (sin conversión)
    const year = date.year
    const month = String(date.month).padStart(2, '0')
    const day = String(date.day).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    const isFullyBooked = isDateFullyBooked ? isDateFullyBooked(dateString) : false;

    return (
      isPastDate ||
      isSunday ||
      isFullyBooked ||
      disabledRanges.some(
        (interval) =>
          date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0,
      )
    );
  };

  const calendarClass = variant === 'primary' ? 'calendar-primary' : 'calendar-secondary';

  return (
    <Calendar
      aria-label="Seleccionar fecha"
      className={`calendar-citrica-ui ${calendarClass} ${className}`}
      isDateUnavailable={isDateUnavailable}
      minValue={effectiveMinValue}
      value={value}
      onChange={onChange}
    />
  );
}

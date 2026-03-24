import { Calendar } from "@heroui/calendar";
import { today, getLocalTimeZone } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";

interface CalendarComponentProps {
  value?: any;
  onChange?: (date: any) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'dark';
  minValue?: any;
  disabledRanges?: Array<[any, any]>;
  isDateFullyBooked?: (date: string) => boolean;
  serverToday?: any; // Nueva prop para la fecha del servidor
  inactiveDays?: number[]; // Días de la semana inactivos (0=Dom, 1=Lun, etc.)
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
  inactiveDays = [0],
}: CalendarComponentProps) {
  // Usar serverToday si está disponible, sino usar la fecha del cliente
  const effectiveToday = serverToday || today(getLocalTimeZone());
  const effectiveMinValue = minValue !== undefined ? minValue : effectiveToday;

  // No renderizar hasta que serverToday esté disponible (evita mostrar fechas pasadas incorrectas)
  if (!serverToday) {
    return (
      <div className="flex items-center justify-center w-[280px] h-[280px]">
        <div className="animate-pulse flex flex-col gap-2 w-full">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  let isDateUnavailable = (date: any) => {
    // Calcular día de la semana sin dependencia de locale
    // Usar Date.UTC para evitar problemas de timezone entre navegadores
    const jsDate = new Date(Date.UTC(date.year, date.month - 1, date.day, 12, 0, 0));
    // getUTCDay retorna 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
    const dayOfWeek = jsDate.getUTCDay();
    const isDayInactive = inactiveDays.includes(dayOfWeek);

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
      isDayInactive ||
      isFullyBooked ||
      disabledRanges.some(
        (interval) =>
          date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0,
      )
    );
  };

  const calendarClass = variant === 'dark' ? 'calendar-dark' : variant === 'primary' ? 'calendar-primary' : 'calendar-secondary';

  const darkClassNames = variant === 'dark' ? {
    base: "!bg-[#242424] shadow-none",
    headerWrapper: "!bg-[#242424]",
    header: "text-white",
    title: "!text-white/50 font-medium capitalize",
    prevButton: "!text-white/50 hover:bg-white/10 hover:text-white",
    nextButton: "!text-white/50 hover:bg-white/10 hover:text-white",
    gridWrapper: "!bg-[#16141F]",
    gridHeader: "!bg-[#242424]",
    gridHeaderRow: "!bg-[#242424]",
    gridHeaderCell: "!text-white/50 font-medium !bg-[#242424]",
    gridBody: "bg-[#16141F]",
    gridBodyRow: "bg-[#16141F]",
    cell: "text-white",
    cellButton: "text-white data-[unavailable=true]:text-white/15 data-[unavailable=true]:[text-decoration:none] data-[disabled=true]:text-white/15 data-[outside-visible-range=true]:text-white/15 data-[outside-month=true]:text-white/15 data-[selected=true]:bg-[#FF5B00] data-[selected=true]:text-white data-[selected=true]:font-semibold",
    content: "bg-[#16141F]",
  } : undefined;

  // Configurar calendario en español con semana comenzando en Lunes
  return (
    <I18nProvider locale="es-ES">
      <Calendar
        key={`calendar-es-ES-${serverToday.year}-${serverToday.month}-${serverToday.day}`}
        aria-label="Seleccionar fecha"
        className={`calendar-citrica-ui ${calendarClass} ${className}`}
        classNames={darkClassNames}
        isDateUnavailable={isDateUnavailable}
        minValue={effectiveMinValue}
        value={value}
        onChange={onChange}
        firstDayOfWeek="mon"
      />
    </I18nProvider>
  );
}

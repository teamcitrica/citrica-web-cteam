import { Column } from "@/shared/components/citrica-ui/organism/data-table";

export interface PollaSorteo {
  id: number;
  created_at: string | null;
  pack_option: number | null;
  transfer_diageo: boolean | null;
  bday: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  doc_type: string | null;
  doc_number: string | null;
  inv_type: string | null;
  inv_serie: string | null;
  inv_number: string | null;
  inv_code: string | null;
  terms_accept: string | null;
  ads_accept: string | null;
  survey_accept: string | null;
  first_name: string | null;
  publicity_accept: string | null;
  campaign: string | null;
  last_name: string | null;
  votos_id: number | null;
  votos_fase: number | null;
  votos: string | null;
}

// Normaliza una fecha a DD/MM/YYYY parseando los formatos que llegan
// (DD/MM/YYYY o ISO YYYY-MM-DD, con o sin hora), SIN usar new Date()
// para no mal-interpretar (ej. 12/02 como mes/día). Sirve para bday y created_at.
export const formatFecha = (value: string | null) => {
  if (!value) return "-";
  const v = String(value).trim();
  // DD/MM/YYYY o D/M/YYYY
  const dmy = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (dmy) {
    const [, d, m, y] = dmy;

    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  // ISO YYYY-MM-DD (con o sin hora, ej. timestamp de created_at)
  const ymd = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (ymd) {
    const [, y, m, d] = ymd;
    const fecha = `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    // Si trae hora (HH:MM:SS), la agregamos tal cual viene guardada
    const hora = v.match(/[ T](\d{2}):(\d{2}):(\d{2})/);

    if (hora) {
      const [, hh, mm, ss] = hora;

      return `${fecha} ${hh}:${mm}:${ss}`;
    }

    return fecha;
  }

  return v; // formato desconocido → tal cual
};

// Definición de columnas visibles (nombre + uid + si ordena)
export const pollaColumns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "FECHA CREACIÓN", uid: "created_at", sortable: false },
  { name: "NOMBRE", uid: "first_name", sortable: false },
  { name: "APELLIDO", uid: "last_name", sortable: false },
  { name: "TIPO DOC", uid: "doc_type", sortable: false },
  { name: "NRO DOC", uid: "doc_number", sortable: false },
  { name: "EMAIL", uid: "email", sortable: false },
  { name: "TELÉFONO", uid: "phone", sortable: false },
  { name: "CUMPLEAÑOS", uid: "bday", sortable: false },
  { name: "DIRECCIÓN", uid: "address", sortable: false },
  { name: "TÉRMINOS", uid: "terms_accept", sortable: false },
  { name: "ADS", uid: "ads_accept", sortable: false },
  { name: "ENCUESTA", uid: "survey_accept", sortable: false },
  { name: "FASE", uid: "votos_fase", sortable: false },
  { name: "VOTOS", uid: "votos", sortable: false },
];

// Render de cada celda según la columna
const renderPollaCell = (sorteo: PollaSorteo, columnKey: string) => {
  const cellValue = sorteo[columnKey as keyof PollaSorteo];

  switch (columnKey) {
    case "id":
      return <p className="text-sm text-black">{sorteo.id}</p>;

    case "created_at":
      return (
        <span className="text-sm text-black">
          {formatFecha(sorteo.created_at)}
        </span>
      );

    case "first_name":
      return <p className="text-sm text-black">{sorteo.first_name || "-"}</p>;

    case "last_name":
      return <p className="text-sm text-black">{sorteo.last_name || "-"}</p>;

    case "email":
      return <p className="text-sm text-black">{sorteo.email || "-"}</p>;

    case "phone":
      return <p className="text-sm text-black">{sorteo.phone || "-"}</p>;

    case "doc_type":
      return <p className="text-sm text-black">{sorteo.doc_type || "-"}</p>;

    case "doc_number":
      return <p className="text-sm text-black">{sorteo.doc_number || "-"}</p>;

    case "bday":
      return <p className="text-sm text-black">{formatFecha(sorteo.bday)}</p>;

    case "address":
      return (
        <p
          className="text-sm text-black truncate max-w-xs"
          title={sorteo.address || "-"}
        >
          {sorteo.address || "-"}
        </p>
      );

    case "campaign":
      return <p className="text-sm text-black">{sorteo.campaign || "-"}</p>;

    case "votos_fase":
      return <p className="text-sm text-black">{sorteo.votos_fase ?? "-"}</p>;

    case "votos":
      return (
        <p
          className="text-sm text-black truncate max-w-xs"
          title={sorteo.votos || "-"}
        >
          {sorteo.votos || "-"}
        </p>
      );

    case "terms_accept":
      return <p className="text-sm text-black">{sorteo.terms_accept || "-"}</p>;

    case "ads_accept":
      return <p className="text-sm text-black">{sorteo.ads_accept || "-"}</p>;

    case "survey_accept":
      return (
        <p className="text-sm text-black">{sorteo.survey_accept || "-"}</p>
      );

    case "publicity_accept":
      return (
        <p className="text-sm text-black">{sorteo.publicity_accept || "-"}</p>
      );

    default:
      return <p className="text-sm text-black">{String(cellValue || "-")}</p>;
  }
};

// Columnas para el DataTable (cada una con su render propio)
export const getPollaColumns = (): Column<PollaSorteo>[] =>
  pollaColumns.map((c) => ({
    ...c,
    render: (item: PollaSorteo) => renderPollaCell(item, c.uid),
  }));

// Configuración de exportación a Excel (mapping + columnas excluidas + formato)
export const pollaExportConfig = {
  fileName: "registros_polla_encriptados",
  sheetName: "Registros Polla Encriptados",
  // Columnas que la función devuelve pero la tabla no muestra
  excludeColumns: [
    "inv_type",
    "inv_serie",
    "inv_number",
    "inv_code",
    "pack_option",
    "transfer_diageo",
    "votos_id",
    "campaign",
    "publicity_accept",
  ],
  columnMapping: {
    id: "ID",
    created_at: "FECHA CREACIÓN",
    first_name: "NOMBRE",
    last_name: "APELLIDO",
    doc_type: "TIPO DOC",
    doc_number: "NRO DOC",
    email: "EMAIL",
    phone: "TELÉFONO",
    bday: "CUMPLEAÑOS",
    address: "DIRECCIÓN",
    terms_accept: "TÉRMINOS",
    ads_accept: "ADS",
    survey_accept: "ENCUESTA",
    votos_fase: "FASE",
    votos: "VOTOS",
  },
  customFormatter: (key: string, value: any) => {
    // Normalizar fechas (cumpleaños y fecha de creación) a DD/MM/YYYY
    if (key === "bday" || key === "created_at") {
      return formatFecha(value);
    }

    return value;
  },
};

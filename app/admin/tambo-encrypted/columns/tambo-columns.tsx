import { Column } from "@/shared/components/citrica-ui/organism/data-table";

export interface Sorteo {
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
export const tamboColumns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "FECHA CREACIÓN", uid: "created_at", sortable: false },
  { name: "CAMPAÑA", uid: "campaign", sortable: false },
  { name: "NOMBRE", uid: "first_name", sortable: false },
  { name: "APELLIDO", uid: "last_name", sortable: false },
  { name: "CUMPLEAÑOS", uid: "bday", sortable: false },
  { name: "DIRECCIÓN", uid: "address", sortable: false },
  { name: "TELÉFONO", uid: "phone", sortable: false },
  { name: "EMAIL", uid: "email", sortable: false },
  { name: "TIPO DOC", uid: "doc_type", sortable: false },
  { name: "NRO DOC", uid: "doc_number", sortable: false },
  { name: "TIPO INV", uid: "inv_type", sortable: false },
  { name: "SERIE INV", uid: "inv_serie", sortable: false },
  { name: "NRO INV", uid: "inv_number", sortable: false },
  { name: "CÓDIGO INV", uid: "inv_code", sortable: false },
  { name: "TÉRMINOS", uid: "terms_accept", sortable: false },
  { name: "ADS", uid: "ads_accept", sortable: false },
  { name: "ENCUESTA", uid: "survey_accept", sortable: false },
];

// Render de cada celda según la columna
const renderTamboCell = (sorteo: Sorteo, columnKey: string) => {
  const cellValue = sorteo[columnKey as keyof Sorteo];

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

    case "inv_type":
      return <p className="text-sm text-black">{sorteo.inv_type || "-"}</p>;

    case "inv_serie":
      return <p className="text-sm text-black">{sorteo.inv_serie || "-"}</p>;

    case "inv_number":
      return <p className="text-sm text-black">{sorteo.inv_number || "-"}</p>;

    case "inv_code":
      return <p className="text-sm text-black">{sorteo.inv_code || "-"}</p>;

    case "terms_accept":
      return <p className="text-sm text-black">{sorteo.terms_accept || "-"}</p>;

    case "ads_accept":
      return <p className="text-sm text-black">{sorteo.ads_accept || "-"}</p>;

    case "survey_accept":
      return (
        <p className="text-sm text-black">{sorteo.survey_accept || "-"}</p>
      );

    default:
      return <p className="text-sm text-black">{String(cellValue || "-")}</p>;
  }
};

// Columnas para el DataTable (cada una con su render propio)
export const getTamboColumns = (): Column<Sorteo>[] =>
  tamboColumns.map((c) => ({
    ...c,
    render: (item: Sorteo) => renderTamboCell(item, c.uid),
  }));

// Configuración de exportación a Excel (mapping + columnas excluidas + formato)
export const tamboExportConfig = {
  fileName: "registros_tambo_encriptados",
  sheetName: "Registros Tambo Encriptados",
  // Columnas que NO se exportan (no están en la tabla)
  excludeColumns: ["pack_option", "publicity_accept", "transfer_diageo"],
  columnMapping: {
    id: "ID",
    created_at: "FECHA CREACIÓN",
    campaign: "CAMPAÑA",
    first_name: "NOMBRE",
    last_name: "APELLIDO",
    bday: "CUMPLEAÑOS",
    address: "DIRECCIÓN",
    phone: "TELÉFONO",
    email: "EMAIL",
    doc_type: "TIPO DOC",
    doc_number: "NRO DOC",
    inv_type: "TIPO INV",
    inv_serie: "SERIE INV",
    inv_number: "NRO INV",
    inv_code: "CÓDIGO INV",
    terms_accept: "TÉRMINOS",
    ads_accept: "ADS",
    survey_accept: "ENCUESTA",
  },
  customFormatter: (key: string, value: any) => {
    // Formatear booleano de transfer_diageo
    if (key === "transfer_diageo") {
      return value === true ? "Sí" : value === false ? "No" : "-";
    }
    // Normalizar fechas (cumpleaños y fecha de creación) a DD/MM/YYYY
    if (key === "bday" || key === "created_at") {
      return formatFecha(value);
    }

    return value;
  },
};

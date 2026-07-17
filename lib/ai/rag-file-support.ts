// ================================================================
// Límites y formatos del RAG — fuente única para UI y servidor
// (xlsx se importa dinámico en prepareForIndexing para no engordar
// el bundle del cliente, que solo usa constantes y validación)
// ================================================================

export const MAX_FILE_SIZE_MB = 100; // límite de Gemini File Search
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Extensiones que File Search indexa directo + las que convertimos (Excel)
export const SUPPORTED_EXTENSIONS = ["pdf", "txt", "md", "docx", "json", "csv", "xlsx", "xls"] as const;

export const ACCEPT_ATTRIBUTE = SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join(",");

export const LIMITS_LABEL = `Formatos: ${SUPPORTED_EXTENSIONS.map((e) => e.toUpperCase()).join(", ")} · Máx ${MAX_FILE_SIZE_MB}MB por archivo`;

export function getExtension(fileName: string): string {
  return fileName.toLowerCase().split(".").pop() || "";
}

/**
 * Valida extensión y tamaño. Retorna mensaje de error legible o null si es válido.
 * Se usa igual en el cliente (antes de subir) y en el servidor (espejo).
 */
export function validateRagFile(fileName: string, fileSize: number): string | null {
  const ext = getExtension(fileName);
  if (!SUPPORTED_EXTENSIONS.includes(ext as any)) {
    return `Formato .${ext || "desconocido"} no soportado. Usa: ${SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join(", ")}`;
  }
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (fileSize / 1024 / 1024).toFixed(1);
    return `El archivo pesa ${sizeMB}MB y el máximo es ${MAX_FILE_SIZE_MB}MB`;
  }
  return null;
}

/**
 * Prepara el contenido para indexar en File Search.
 * Excel no es indexable nativamente: se convierte cada hoja a CSV de texto.
 * El original se guarda intacto en el bucket; solo cambia lo que se indexa.
 */
export async function prepareForIndexing(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string; displayName: string }> {
  const ext = getExtension(fileName);

  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const parts: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
      if (csv.trim()) {
        parts.push(`--- Hoja: ${sheetName} ---\n${csv}`);
      }
    }

    return {
      buffer: Buffer.from(parts.join("\n\n"), "utf-8"),
      mimeType: "text/plain",
      displayName: `${fileName}.txt`, // File Search infiere formato del nombre
    };
  }

  return { buffer, mimeType, displayName: fileName };
}

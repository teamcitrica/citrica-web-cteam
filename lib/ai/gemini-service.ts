import { GoogleGenAI } from "@google/genai";

// ================================================================
// TIPOS Y CONSTANTES
// ================================================================

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export type FileSearchDocumentState = "ACTIVE" | "PROCESSING" | "FAILED";

export interface FileSearchUploadResult {
  documentName: string | null; // "fileSearchStores/.../documents/..."
  state: FileSearchDocumentState;
}

// Costos por token (en USD)
const COSTS = {
  INPUT_PER_1M: 0.075, // $0.075 por 1M tokens de entrada
  OUTPUT_PER_1M: 0.30, // $0.30 por 1M tokens de salida
};

// Indexación en File Search: $0.15 por 1M tokens (una sola vez por documento).
// Almacenamiento y embeddings de consulta son gratis.
export const FILE_SEARCH_INDEXING_PER_1M = 0.15;

// ================================================================
// PERFILES DE RESPUESTA - Controla calidad y cantidad
// ================================================================

export type ResponseProfile = "concise" | "balanced" | "detailed" | "comprehensive";

export interface ResponseConfig {
  temperature: number;      // 0.0 - 2.0: Creatividad (bajo = preciso, alto = creativo)
  maxOutputTokens: number;  // Límite de tokens en la respuesta
  topP?: number;           // 0.0 - 1.0: Diversidad del vocabulario
  topK?: number;           // Número de tokens candidatos a considerar
}

/**
 * Perfiles predefinidos para diferentes casos de uso
 */
export const RESPONSE_PROFILES: Record<ResponseProfile, ResponseConfig> = {
  // Respuestas cortas y directas (ideal para FAQs rápidas)
  concise: {
    temperature: 0.3,
    maxOutputTokens: 512,
    topP: 0.8,
    topK: 20,
  },

  // Balance entre detalle y brevedad (uso general)
  balanced: {
    temperature: 0.7,
    maxOutputTokens: 2048,
    topP: 0.9,
    topK: 40,
  },

  // Respuestas detalladas con explicaciones (análisis, tutoriales)
  detailed: {
    temperature: 0.8,
    maxOutputTokens: 4096,
    topP: 0.95,
    topK: 60,
  },

  // Respuestas muy completas (investigación, reportes)
  comprehensive: {
    temperature: 0.9,
    maxOutputTokens: 8192,
    topP: 1.0,
    topK: 80,
  },
};

/**
 * Obtiene la configuración de un perfil específico
 */
export function getResponseConfig(profile: ResponseProfile = "balanced"): ResponseConfig {
  return RESPONSE_PROFILES[profile];
}

// ================================================================
// FUNCIONES DE UTILIDAD
// ================================================================

/**
 * Calcula el costo estimado basado en tokens
 */
export function calculateCost(promptTokens: number, completionTokens: number): number {
  const inputCost = (promptTokens / 1_000_000) * COSTS.INPUT_PER_1M;
  const outputCost = (completionTokens / 1_000_000) * COSTS.OUTPUT_PER_1M;
  return inputCost + outputCost;
}

/**
 * Espera un tiempo determinado (para polling)
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry con backoff exponencial para llamadas sobrecargadas
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 2000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Si es sobrecarga (503) o rate limit (429), reintentar
      if (
        error.message?.includes("503") ||
        error.message?.includes("overloaded") ||
        error.message?.includes("429") ||
        error.message?.includes("quota")
      ) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(
          `⏳ Servidor sobrecargado, reintentando en ${delay}ms (intento ${i + 1}/${maxRetries})...`
        );
        await sleep(delay);
        continue;
      }

      // Si es otro tipo de error, lanzar inmediatamente
      throw error;
    }
  }

  // Si llegamos aquí, se agotaron los reintentos
  throw lastError;
}

/**
 * Convierte errores de Gemini en mensajes legibles para el usuario.
 * Se muestra en el chat (streameado) y en el modal de archivos (error_message).
 */
export function friendlyAIError(error: any): string {
  const msg = error?.message || String(error);
  const status = error?.status || error?.statusCode;

  if (/credits are depleted|prepayment/i.test(msg)) {
    return "⚠️ Créditos de la API de Gemini agotados. Recarga créditos en AI Studio (https://ai.studio/projects) o configura otra API key en Admin > IA > Configuración.";
  }
  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(msg)) {
    return "⚠️ Límite de uso de Gemini alcanzado (429). Espera unos minutos o cambia de modelo en Configuración.";
  }
  if (/API key not valid|API_KEY_INVALID/i.test(msg)) {
    return "⚠️ La API key de Gemini no es válida. Verifícala en Admin > IA > Configuración.";
  }
  if (/unsupported|INVALID_ARGUMENT.*mime|mime.*not supported/i.test(msg)) {
    return "⚠️ Formato de archivo no soportado por Gemini File Search.";
  }
  return `❌ Error del servicio de IA: ${msg}`;
}

export function isQuotaError(error: any): boolean {
  const msg = error?.message || "";
  return error?.status === 429 || error?.statusCode === 429 || /RESOURCE_EXHAUSTED|quota|limit/i.test(msg);
}

/**
 * Un id de store es real solo si viene de File Search
 * (el stub anterior generaba ids falsos "vs_<timestamp>_...")
 */
export function isRealStoreName(id: string | null | undefined): id is string {
  return !!id && id.startsWith("fileSearchStores/");
}

/**
 * Resuelve el MIME type por extensión (los browsers a veces mandan
 * application/octet-stream, y el chat legacy hardcodeaba application/pdf)
 */
export function resolveMimeType(fileName: string, browserType?: string | null): string {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  const byExtension: Record<string, string> = {
    pdf: "application/pdf",
    txt: "text/plain",
    md: "text/markdown",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    json: "application/json",
    csv: "text/csv",
  };
  return byExtension[ext] || browserType || "text/plain";
}

// ================================================================
// GEMINI FILE SEARCH - RAG administrado (embeddings gemini-embedding-001)
// ================================================================

/**
 * Crea un File Search store. Retorna el nombre del recurso
 * (ej: "fileSearchStores/mi-store-123abc"). Persistente, sin caducidad.
 */
export async function createFileSearchStore(apiKey: string, displayName: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  console.log(`🗄️ Creando File Search store "${displayName}"...`);

  const store = await ai.fileSearchStores.create({
    config: { displayName },
  });

  if (!store.name) {
    throw new Error("Gemini no devolvió nombre de File Search store");
  }

  console.log(`✅ File Search store creado: ${store.name}`);
  return store.name;
}

/**
 * Sube un archivo a un File Search store y espera a que termine la indexación
 * (chunking + embeddings los hace Gemini). Poll cada 2s, tope 120s: si no
 * terminó, se reporta PROCESSING y el estado real se recupera con Reprocesar.
 */
export async function uploadToFileSearchStore(
  apiKey: string,
  params: {
    storeName: string;
    buffer: Buffer;
    displayName: string;
    mimeType: string;
  }
): Promise<FileSearchUploadResult> {
  const ai = new GoogleGenAI({ apiKey });
  const { storeName, buffer, displayName, mimeType } = params;

  console.log(`📤 Indexando "${displayName}" en ${storeName}...`);

  let operation = await ai.fileSearchStores.uploadToFileSearchStore({
    fileSearchStoreName: storeName,
    file: new Blob([new Uint8Array(buffer)], { type: mimeType }),
    config: { displayName, mimeType },
  });

  const POLL_MS = 2000;
  const MAX_WAIT_MS = 120_000;
  const started = Date.now();

  while (!operation.done && Date.now() - started < MAX_WAIT_MS) {
    await sleep(POLL_MS);
    operation = (await ai.operations.get({ operation })) as typeof operation;
  }

  if (operation.error) {
    const message = (operation.error as any)?.message || JSON.stringify(operation.error);
    throw new Error(`Indexación falló: ${message}`);
  }

  let documentName = operation.response?.documentName || null;

  // Fallback: si la operación no trae el nombre del documento, buscarlo por displayName
  if (operation.done && !documentName) {
    try {
      const documents = await ai.fileSearchStores.documents.list({ parent: storeName });
      for await (const doc of documents) {
        if (doc.displayName === displayName) {
          documentName = doc.name || null;
          break;
        }
      }
    } catch (listError: any) {
      console.error("⚠️ No se pudo listar documentos del store:", listError.message);
    }
  }

  const state: FileSearchDocumentState = operation.done ? "ACTIVE" : "PROCESSING";
  console.log(`${operation.done ? "✅" : "⏳"} Documento: ${documentName || "(sin nombre aún)"} [${state}]`);

  return { documentName, state };
}

/**
 * Verifica si una key puede acceder a un File Search store.
 * Los stores pertenecen al proyecto Google de la key que los creó:
 * una key de otro proyecto no los ve (403/404) y requiere reindexar.
 */
export async function fileSearchStoreExists(apiKey: string, storeName: string): Promise<boolean> {
  const ai = new GoogleGenAI({ apiKey });
  try {
    await ai.fileSearchStores.get({ name: storeName });
    return true;
  } catch {
    return false;
  }
}

/**
 * Elimina un documento de un File Search store. Tolera not-found
 * (el documento pudo haberse borrado desde otra sesión).
 */
export async function deleteFileSearchDocument(apiKey: string, documentName: string): Promise<void> {
  const ai = new GoogleGenAI({ apiKey });
  try {
    await ai.fileSearchStores.documents.delete({ name: documentName });
    console.log(`🗑️ Documento eliminado: ${documentName}`);
  } catch (error: any) {
    if (error.message?.includes("404") || error.message?.includes("not found") || error.message?.includes("NOT_FOUND")) {
      console.log(`⚠️ Documento ya no existía: ${documentName}`);
      return;
    }
    throw new Error(`Error al eliminar documento: ${error.message}`);
  }
}

/**
 * Elimina un File Search store completo (force: borra también sus documentos)
 */
export async function deleteFileSearchStore(apiKey: string, storeName: string): Promise<void> {
  const ai = new GoogleGenAI({ apiKey });
  try {
    await ai.fileSearchStores.delete({ name: storeName, config: { force: true } });
    console.log(`🗑️ File Search store eliminado: ${storeName}`);
  } catch (error: any) {
    if (error.message?.includes("404") || error.message?.includes("not found") || error.message?.includes("NOT_FOUND")) {
      console.log(`⚠️ Store ya no existía: ${storeName}`);
      return;
    }
    throw new Error(`Error al eliminar store: ${error.message}`);
  }
}

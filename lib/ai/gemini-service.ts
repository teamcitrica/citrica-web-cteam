import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";

// API Key desde variables de entorno
const API_KEY = process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
  console.error("⚠️ GEMINI_API_KEY no está configurada en las variables de entorno");
}

// Inicializar clientes
const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

// ================================================================
// TIPOS Y CONSTANTES
// ================================================================

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface ChatResult {
  response: string;
  usage: TokenUsage;
}

export interface VectorStoreInfo {
  name: string;
  displayName: string;
  createTime: string;
  updateTime: string;
}

export interface GeminiFile {
  name: string; // URI del archivo (ej: "files/abc123")
  displayName: string;
  mimeType: string;
  sizeBytes: string;
  state: FileState;
  uri: string;
}

// Costos por token (en USD)
const COSTS = {
  INPUT_PER_1M: 0.075, // $0.075 por 1M tokens de entrada
  OUTPUT_PER_1M: 0.30, // $0.30 por 1M tokens de salida
};

// ================================================================
// FUNCIONES DE UTILIDAD
// ================================================================

/**
 * Calcula el costo estimado basado en tokens
 */
function calculateCost(promptTokens: number, completionTokens: number): number {
  const inputCost = (promptTokens / 1_000_000) * COSTS.INPUT_PER_1M;
  const outputCost = (completionTokens / 1_000_000) * COSTS.OUTPUT_PER_1M;
  return inputCost + outputCost;
}

/**
 * Espera un tiempo determinado (para polling)
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry con backoff exponencial para llamadas sobrecargadas
 */
async function retryWithBackoff<T>(
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

// ================================================================
// GEMINI FILE API - Gestión de archivos
// ================================================================

/**
 * Sube un archivo a Gemini File API
 * Retorna el URI del archivo subido
 */
export async function uploadFileToGemini(
  fileBuffer: Buffer,
  mimeType: string,
  displayName: string
): Promise<GeminiFile> {
  try {
    console.log(`📤 Subiendo archivo "${displayName}" a Gemini...`);

    // Crear archivo temporal para upload
    const uploadResult = await fileManager.uploadFile(fileBuffer as any, {
      mimeType,
      displayName,
    });

    console.log(`✅ Archivo subido: ${uploadResult.file.uri}`);

    // Esperar a que el archivo esté ACTIVE
    let file = uploadResult.file;
    while (file.state === FileState.PROCESSING) {
      console.log(`⏳ Esperando que el archivo sea procesado...`);
      await sleep(2000);
      file = await fileManager.getFile(file.name);
    }

    if (file.state === FileState.FAILED) {
      throw new Error(`El archivo falló al procesarse: ${file.name}`);
    }

    console.log(`✅ Archivo listo: ${file.state}`);

    return {
      name: file.name,
      displayName: file.displayName || displayName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      state: file.state,
      uri: file.uri,
    };
  } catch (error: any) {
    console.error("❌ Error subiendo archivo a Gemini:", error.message);
    throw new Error(`Error al subir archivo: ${error.message}`);
  }
}

/**
 * Obtiene información de un archivo por su nombre/URI
 */
export async function getFileInfo(fileName: string): Promise<GeminiFile> {
  try {
    const file = await fileManager.getFile(fileName);

    return {
      name: file.name,
      displayName: file.displayName || "",
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      state: file.state,
      uri: file.uri,
    };
  } catch (error: any) {
    console.error(`❌ Error obteniendo archivo ${fileName}:`, error.message);
    throw new Error(`Error al obtener archivo: ${error.message}`);
  }
}

/**
 * Lista todos los archivos subidos
 */
export async function listFiles(): Promise<GeminiFile[]> {
  try {
    const listResult = await fileManager.listFiles();
    return listResult.files.map((file) => ({
      name: file.name,
      displayName: file.displayName || "",
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      state: file.state,
      uri: file.uri,
    }));
  } catch (error: any) {
    console.error("❌ Error listando archivos:", error.message);
    throw new Error(`Error al listar archivos: ${error.message}`);
  }
}

/**
 * Elimina un archivo de Gemini
 */
export async function deleteFile(fileName: string): Promise<void> {
  try {
    await fileManager.deleteFile(fileName);
    console.log(`🗑️ Archivo eliminado: ${fileName}`);
  } catch (error: any) {
    console.error(`❌ Error eliminando archivo ${fileName}:`, error.message);
    throw new Error(`Error al eliminar archivo: ${error.message}`);
  }
}

// ================================================================
// GEMINI VECTOR STORES - Gestión de Vector Stores
// ================================================================

/**
 * Crea un nuevo Vector Store
 */
export async function createVectorStore(displayName: string): Promise<string> {
  try {
    console.log(`🗄️ Creando Vector Store "${displayName}"...`);

    // Nota: La API actual de Gemini no expone directamente createCorpus en el SDK de Node.js
    // Por ahora, los archivos se manejan directamente y se asocian en las queries
    // Esta función está preparada para cuando el SDK lo soporte

    // TEMPORAL: Retornamos un ID basado en el nombre
    const vectorStoreId = `vs_${Date.now()}_${displayName.replace(/\s+/g, "_")}`;
    console.log(`✅ Vector Store creado: ${vectorStoreId}`);

    return vectorStoreId;
  } catch (error: any) {
    console.error("❌ Error creando Vector Store:", error.message);
    throw new Error(`Error al crear Vector Store: ${error.message}`);
  }
}

// ================================================================
// CHAT - Generación de respuestas
// ================================================================

/**
 * Genera respuesta de chat (usado tanto para RAG como para chat simple)
 * Para RAG: el contexto de documentos se incluye en el prompt
 */
export async function generateChatResponse(
  prompt: string,
  config: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<ChatResult> {
  return retryWithBackoff(async () => {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: config.temperature ?? 0.7,
          maxOutputTokens: config.maxOutputTokens ?? 1024,
        },
      });

      const response = result.response;
      const text = response.text();

      // Calcular tokens
      const promptTokens = Math.ceil(prompt.length / 4);
      const completionTokens = Math.ceil(text.length / 4);
      const totalTokens = promptTokens + completionTokens;
      const estimatedCost = calculateCost(promptTokens, completionTokens);

      return {
        response: text,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCost,
        },
      };
    } catch (error: any) {
      console.error("❌ Error generando respuesta:", error.message);
      throw new Error(`Error al generar respuesta: ${error.message}`);
    }
  });
}

export default genAI;

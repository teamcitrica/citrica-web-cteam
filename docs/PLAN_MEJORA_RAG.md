# Plan de Mejora del Sistema RAG — Migración a Gemini File Search

**Fecha:** 2026-07-17
**Estado actual:** El sistema NO usa embeddings. `createVectorStore()` en `lib/ai/gemini-service.ts` es un placeholder que genera IDs falsos. El flujo real es: archivo → Gemini File API (caduca a las 48 horas) → en cada pregunta se pasan los documentos completos como contexto. Consecuencias:

- Los archivos "ACTIVE" en `storage_files` tienen URIs muertos si pasaron más de 48h desde la subida.
- Cada pregunta paga los tokens de TODOS los documentos completos (no hay retrieval).
- No escala: con muchos documentos el contexto explota y el costo por pregunta crece linealmente.

## Solución propuesta: Gemini File Search Tool

RAG administrado por Google, integrado en la API de Gemini:

- **Persistente**: los File Search Stores no caducan (a diferencia del File API de 48h).
- **Embeddings por Gemini** (`gemini-embedding-001`): chunking, indexado y retrieval automáticos. No se usa Supabase como base vectorial (ya se probó con malos resultados).
- **Costo**: indexación $0.15 / 1M tokens (una sola vez por documento). Almacenamiento y embeddings de consulta: gratis. Las preguntas pagan solo los chunks relevantes recuperados, no el documento completo.
- **Citas nativas**: la respuesta incluye `groundingMetadata` con qué documento/fragmento se usó.
- **Supabase Storage se mantiene** como respaldo del archivo original (permite re-indexar).

Requiere el SDK nuevo `@google/genai` (el actual `@google/generative-ai` está deprecado y no soporta File Search).

---

## Fase 0 — Desbloqueo (prerequisito)

1. **Recargar créditos Gemini** en AI Studio (o cambiar la API key en Admin > IA > Configuración). Sin esto nada funciona. La key activa es la de la tabla `api_config` (prioridad sobre `.env.local`).
2. **Fix bug del upload** (`app/api/rag/upload/route.ts`): el catch relee `request.formData()` ya consumido → el status del storage queda atascado en `"processing"` para siempre. Capturar `storageId` fuera del try.
3. **Resetear en DB** el status de "Captación Entrevista" (atascado en processing desde 2026-07-14).

## Fase 1 — Migrar el núcleo a File Search

1. `yarn add @google/genai` (convive con el SDK viejo durante la migración).
2. **`lib/ai/gemini-service.ts`**:
   - `createFileSearchStore(displayName)` real: `ai.fileSearchStores.create()` → devuelve `fileSearchStores/xxx`.
   - `uploadToFileSearchStore(buffer, mimeType, displayName, storeName)`: sube e indexa; espera la operación hasta `done`.
   - `deleteFromFileSearchStore(documentName)` para borrado.
3. **Migración SQL** (`supabase/migrations/011_file_search_stores.sql`):
   - `document_storages.gemini_vector_store_id` pasa a guardar el nombre real del store (`fileSearchStores/...`).
   - `storage_files` + columna `gemini_document_name` (documento dentro del store). `gemini_file_uri` queda legacy.
4. **Upload route**: bucket Supabase (igual que hoy, respaldo) → indexar en el File Search store del storage → guardar metadata. MIME real del archivo (hoy el chat hardcodea `application/pdf` para todo).
5. **Chat route**: reemplazar el armado manual de `fileData` por:
   - `tools: [{ fileSearch: { fileSearchStoreNames: [store] } }]` en `generateContent` con streaming.
   - "Todas las bases" = pasar los stores de todos los storages activos.
   - Extraer citas de `groundingMetadata` y enviarlas en el header `X-Sources` (la UI ya lo lee).
   - Se mantiene el manejo de errores amigable ya implementado (créditos agotados, key inválida, etc.).

## Fase 2 — Sanear datos existentes

1. Re-indexar desde el bucket `rag-documents`:
   - "Conecta con Marcas": el PDF ya está en el bucket (1.2MB), solo falta indexar y registrar en `storage_files`.
   - "Estatutos Sociales": PDF en bucket, re-indexar (URI de Gemini muerto desde abril).
   - "lista de utiles": verificar si el .txt está en bucket; si no, re-subir manual.
   - "Captación Entrevista": nunca llegó ningún archivo — re-subir manual desde la UI.
2. **Botón "Reprocesar"** en `/admin/ia/databases_rag`: toma el `file_url` del bucket y re-indexa sin pedir el archivo de nuevo.

## Fase 3 — Robustez y UX

1. Estados reales del archivo: `processing` → `indexed` / `error` (polling de la operación de indexado).
2. Errores de upload visibles en la UI (hoy fallan en silencio; el chat ya se arregló).
3. Panel de storage: tokens indexados, costo de indexación, cantidad de documentos.
4. Limpiar código legacy: `uploadFileToGemini` (File API 48h), `generateChatResponseWithFiles`, `createVectorStore` falso.

---

## Referencia rápida File Search (SDK `@google/genai`)

```ts
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey });

// Crear store (una vez por "base de datos" RAG)
const store = await ai.fileSearchStores.create({ config: { displayName: "Conecta con Marcas" } });

// Subir + indexar documento
let op = await ai.fileSearchStores.uploadToFileSearchStore({
  file: buffer,               // o path
  fileSearchStoreName: store.name,
  config: { displayName: "07 Conecta con Marcas.pdf", mimeType: "application/pdf" },
});
while (!op.done) { await sleep(2000); op = await ai.operations.get({ operation: op }); }

// Preguntar (streaming)
const stream = await ai.models.generateContentStream({
  model: "gemini-2.5-flash",
  contents: pregunta,
  config: { tools: [{ fileSearch: { fileSearchStoreNames: [store.name] } }] },
});
// Citas: response.candidates[0].groundingMetadata
```

Límites a tener en cuenta: 100MB por archivo; almacenamiento gratis limitado por tier (1GB tier gratuito, 10GB tier 1); verificar cuota del proyecto antes de indexar masivamente.

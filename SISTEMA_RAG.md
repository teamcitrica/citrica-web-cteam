# Sistema RAG - Retrieval-Augmented Generation

## 📚 Descripción

RAG real sobre **Gemini File Search**: los documentos se indexan una vez (chunking + embeddings con **`gemini-embedding-001`**, administrados por Google) y el chat recupera **solo los fragmentos relevantes** para cada pregunta. No se pasa el documento completo al contexto — el costo de prompt es chunks + pregunta.

Actualizado: 2026-07-17 (migración desde Gemini File API, que caducaba a las 48h y metía documentos completos al contexto).

## 🏗️ Arquitectura — las 3 vistas trabajan en conjunto

### 1. Configuración (`/admin/ia/config`)

- La API key de Gemini se guarda en la tabla **`api_config`** y **tiene prioridad** sobre `GEMINI_API_KEY` del `.env.local`. Resolución centralizada en `lib/ai/gemini-api-key.ts` (`getGeminiApiKey`).
- "Sincronizar modelos" puebla **`ai_model_config`** (lista blanca de modelos Gemini + modelo default que usa el chat cuando no se selecciona uno).
- ⚠️ Si cambias de key, hazlo AQUÍ (la DB manda); cambiar solo el `.env` no tiene efecto mientras haya una key activa en DB.

### 2. Bases de datos (`/admin/ia/databases_rag`)

Crear storage = fila en `document_storages`. Al **primer upload** se crea su **File Search store** real en Gemini y se guarda en `gemini_vector_store_id` (formato `fileSearchStores/...`).

**Flujo de subida de documento** (`POST /api/rag/upload`):
1. Original → bucket **`rag-documents`** de Supabase Storage (respaldo permanente, permite reindexar)
2. Fila en `storage_files` con estado `PROCESSING` (antes de llamar a Gemini — un fallo nunca deja archivos huérfanos)
3. Indexado en el File Search store: Gemini hace chunking + embeddings (`gemini-embedding-001`). **Persistente, sin caducidad.**
4. Fila → `ACTIVE` con `gemini_document_name` (`fileSearchStores/.../documents/...`)

**Estados de archivo** (`gemini_file_state`): `PENDING` (pendiente de reindexar) · `PROCESSING` · `ACTIVE` (con embeddings, listo para retrieval) · `FAILED`.

**Botón ↻ Reprocesar** (`POST /api/rag/storage/reprocess`): reindexar desde el respaldo del bucket sin re-subir — cura archivos `PENDING`/`FAILED` y huérfanos del bucket. Los archivos sin respaldo quedan `FAILED` y requieren re-subida manual.

### 3. Chat (`/admin/ia/chat`)

Selecciona base de datos (o "Todas"), modelo y perfil de respuesta. `POST /api/rag/chat`:

- Resuelve los File Search stores con archivos `ACTIVE` (máx. 10 stores por pregunta en modo "Todas").
- Llama a Gemini con la tool **`fileSearch`** — Gemini hace la búsqueda semántica y recupera solo los chunks relevantes. El modelo responde basándose en ellos.
- Sin stores activos → chat simple sin documentos.
- Respuesta en streaming; errores legibles (créditos agotados, key inválida, cuota) se muestran en el chat.
- Se guarda en `chat_conversations`: mensaje, respuesta, tokens, costo y **`sources_used`** con las citas reales del retrieval (documento + fragmento, de `groundingMetadata`).

## 📦 Estructura de Base de Datos

#### `document_storages`
```sql
- id: UUID
- name, description: TEXT
- gemini_vector_store_id: TEXT   -- "fileSearchStores/..." (NULL = aún sin store)
- status: TEXT (ready | processing | error)
- total_tokens_used, total_cost_usd
```

#### `storage_files`
```sql
- id, storage_id (FK cascade)
- file_name, file_size, file_type, file_url  -- file_url apunta al respaldo en bucket
- gemini_document_name: TEXT     -- documento en el store (el que importa)
- gemini_file_state: TEXT (PENDING | PROCESSING | ACTIVE | FAILED)
- gemini_file_uri, gemini_file_name  -- DEPRECATED (File API legacy 48h)
- processed, tokens_used, processing_cost_usd
```

#### `chat_conversations`
Historial por storage (`storage_id NULL` = "todas las bases"), con tokens, costo y `sources_used`.

## 💰 Costos

| Concepto | Costo |
|----------|-------|
| Indexación (una vez por documento) | $0.15 / 1M tokens |
| Almacenamiento del índice | Gratis |
| Embeddings de consulta | Gratis |
| Chat | Solo tokens del modelo (chunks recuperados + respuesta) |

## 🔧 Código

- `lib/ai/gemini-service.ts` — File Search: `createFileSearchStore`, `uploadToFileSearchStore`, `deleteFileSearchDocument`, `deleteFileSearchStore`, `isRealStoreName`, `resolveMimeType`, perfiles de respuesta.
- `lib/ai/gemini-api-key.ts` — resolución de API key (DB > env).
- `app/api/rag/upload/route.ts` · `app/api/rag/chat/route.ts` · `app/api/rag/storage/route.ts` (+ `/reprocess`) · `app/api/rag/files/route.ts` (+ `/download`).
- SDK: **`@google/genai`** (el viejo `@google/generative-ai` fue removido).

## ✅ Checklist de validación end-to-end (ejecutar cuando haya key con saldo)

1. Pegar la key en `/admin/ia/config` → estado "valid" → sincronizar modelos.
2. En `/admin/ia/databases_rag`: crear storage de prueba y subir un PDF.
3. Verificar: archivo "Activo" en el modal; en DB `gemini_document_name` con formato `fileSearchStores/.../documents/...` y `gemini_vector_store_id` real en el storage.
4. En `/admin/ia/chat`: seleccionar la base y preguntar algo específico del documento → responde con su contenido.
5. Verificar en `chat_conversations`: `sources_used` con el título del documento y `prompt_tokens` bajo (solo chunks, no el documento entero).
6. Probar "Todas las bases", borrar un archivo y borrar el storage (limpia el store en Gemini).

## 📎 Notas

- **Formatos soportados**: PDF, TXT, MD, DOCX, JSON, CSV, **XLSX/XLS** (Excel se convierte automáticamente a texto CSV por hoja antes de indexar; el original queda intacto en el bucket). El `.doc` viejo de Word ya no se acepta.
- **Límite**: 100MB por archivo. Free tier: 1GB de índice total.
- **Feedback al usuario**: los límites se muestran bajo el botón de subida; formato/tamaño inválido se rechaza con toast antes de subir (y el servidor valida en espejo); si la indexación falla, el motivo queda en `storage_files.error_message` y se muestra en el modal junto al estado "Error". Fuente única de límites: `lib/ai/rag-file-support.ts`.
- Free tier de Gemini: Google puede usar los datos enviados para mejorar sus productos — considerar para documentos sensibles.

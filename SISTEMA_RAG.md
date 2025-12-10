# Sistema RAG - Retrieval-Augmented Generation

## 📚 Descripción

Sistema RAG que permite subir documentos y hacer preguntas sobre su contenido usando **Gemini 2.5 Flash**.

## 🏗️ Arquitectura

**Flujo:**
1. Usuario sube documento → Se guarda en **Supabase Storage**
2. Metadata se guarda en **Supabase PostgreSQL**
3. Archivo también se sube a **Gemini File API** (para uso futuro)
4. Al hacer preguntas en el chat:
   - Descarga documentos desde Supabase Storage
   - Pasa el contenido completo como contexto a Gemini
   - Gemini responde basándose en los documentos

## 📦 Estructura de Base de Datos

### Tablas principales

#### `document_storages`
Contenedores para organizar documentos
```sql
- id: UUID
- name: TEXT
- description: TEXT
- gemini_vector_store_id: TEXT
- status: TEXT (ready, processing, error)
- total_tokens_used: BIGINT
- total_cost_usd: DECIMAL
```

#### `storage_files`
Archivos individuales
```sql
- id: UUID
- storage_id: UUID
- file_name: TEXT
- file_size: BIGINT
- file_type: TEXT
- file_url: TEXT (Supabase Storage)
- gemini_file_uri: TEXT (Gemini File API)
- gemini_file_state: TEXT (PENDING, PROCESSING, ACTIVE, FAILED)
- processed: BOOLEAN
- tokens_used: BIGINT
```

#### `chat_conversations`
Historial de conversaciones
```sql
- id: UUID
- storage_id: UUID
- user_message: TEXT
- assistant_response: TEXT
- prompt_tokens: INTEGER
- completion_tokens: INTEGER
- total_tokens: INTEGER
- cost_usd: DECIMAL
- model: TEXT
- sources_used: JSONB
```

## 🔧 Configuración

### Variables de entorno (.env.local)
```bash
GEMINI_API_KEY=tu_api_key_de_google_ai_studio
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### Obtener API Key de Gemini
1. Ve a: https://aistudio.google.com/app/apikey
2. Crea una nueva API key
3. Cópiala a `.env.local`

## 🚀 Uso

### 1. Crear Storage
- Ir a `/admin/ia/databases_rag`
- Clic en "Nuevo Storage"
- Ingresar nombre y descripción

### 2. Subir Documentos
- Seleccionar un storage
- Clic en "Subir Archivos"
- Seleccionar archivos (PDF, TXT, DOC, DOCX, MD)

### 3. Hacer Preguntas
- Ir a `/admin/ia/chat`
- Seleccionar base de datos (o "Todas las bases")
- Escribir pregunta
- El sistema usa el contenido de los documentos como contexto

## 📊 Tracking de Costos

El sistema calcula automáticamente:
- **Tokens usados** por cada conversación
- **Costo estimado** en USD
- **Tokens totales** por storage

**Costos de Gemini 2.5 Flash:**
- Input: $0.075 por 1M tokens
- Output: $0.30 por 1M tokens

## 🔄 Migraciones

### Ejecutar en Supabase SQL Editor:
```sql
-- 1. Crear tablas base
\i supabase/migrations/001_create_rag_tables.sql

-- 2. Crear bucket de almacenamiento
\i supabase/migrations/002_create_storage_bucket.sql

-- 3. Migrar a nueva estructura (opcional, si vienes de versión anterior)
\i supabase/migrations/003_migrate_to_gemini_vector_stores.sql
```

## 🛠️ Archivos Principales

### Backend
- `lib/ai/gemini-service.ts` - Servicio de Gemini AI
- `app/api/rag/upload/route.ts` - Subir documentos
- `app/api/rag/chat/route.ts` - Chat con RAG
- `app/api/rag/storage/route.ts` - Gestión de storages

### Frontend
- `app/admin/ia/databases_rag/page.tsx` - Gestión de documentos
- `app/admin/ia/chat/page.tsx` - Interfaz de chat

### Database
- `supabase/migrations/` - Migraciones SQL

## ⚡ Características

✅ Subida de documentos a Supabase Storage
✅ Metadata en PostgreSQL
✅ Chat contextual con documentos
✅ Tracking de tokens y costos
✅ Retry automático si servidor sobrecargado
✅ Múltiples storages para organización
✅ Soporte para múltiples formatos de archivo

## 🔍 Modelo Usado

**Gemini 2.5 Flash**
- Modelo más reciente y rápido
- Soporte para hasta 1M tokens de contexto
- Multimodal (texto, imágenes, etc.)

---

**Última actualización:** 2025-12-09
**Versión:** 1.0 (RAG con contexto completo)

# 🚀 Configuración de RAG en Supabase

## Paso 1: Habilitar extensión pgvector

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Ve a **Database** > **Extensions**
3. Busca **vector** y haz clic en **Enable**

## Paso 2: Ejecutar la migración

1. Ve a **SQL Editor** en Supabase
2. Crea una nueva query
3. Copia y pega todo el contenido del archivo `migrations/001_create_rag_tables.sql`
4. Ejecuta la query (Run)

## ¿Qué crea esta migración?

### Tablas:
- **document_storages**: Contenedores de documentos (como carpetas)
- **storage_files**: Archivos subidos
- **document_chunks**: Pedazos de texto con sus embeddings vectoriales

### Funciones:
- **match_documents()**: Busca documentos similares usando similitud coseno

### Índices:
- Índice HNSW para búsqueda vectorial ultra-rápida
- Índices para optimizar búsquedas por storage y archivo

## Verificar instalación

Ejecuta esta query para verificar:

```sql
SELECT
    (SELECT COUNT(*) FROM document_storages) as storages,
    (SELECT COUNT(*) FROM storage_files) as files,
    (SELECT COUNT(*) FROM document_chunks) as chunks;
```

## Siguiente paso

Una vez ejecutada la migración, el sistema RAG estará listo para:
1. Crear storages en `/admin/ia/databases_rag`
2. Subir documentos
3. Chatear con contexto en `/admin/ia/chat`

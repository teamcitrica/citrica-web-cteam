# ✅ FASE 7 COMPLETADA - Interactive Chat (RAG)

**Fecha:** 13 de abril de 2026
**Status:** ✅ COMPLETADO

---

## 📦 Archivos Creados

### 1. **API Route - Chat**
- **Ruta:** `/app/api/sales-analytics/chat/route.ts`
- **Métodos:**
  - **POST** - Enviar mensaje y obtener respuesta de IA
    - Parámetros: `project_id`, `message`, `conversation_id` (opcional), `include_context` (boolean)
    - Retorna: respuesta de IA, conversation_id, tokens usados, costo
  - **GET** - Obtener conversaciones o mensajes
    - `?project_id=xxx` → Lista de conversaciones
    - `?project_id=xxx&conversation_id=yyy` → Mensajes de una conversación
  - **DELETE** - Eliminar conversación
    - `?conversation_id=xxx`
- **Funcionalidad RAG:**
  - Obtiene últimos 3 reportes del proyecto
  - Extrae `resumen_ejecutivo` y `metricas_clave`
  - Construye contexto enriquecido para la IA
  - Incluye contexto en el prompt del usuario
- **Gestión de Conversaciones:**
  - Crea conversación automáticamente en primer mensaje
  - Guarda mensajes de usuario y IA en `sales_chat_messages`
  - Calcula y registra tokens y costo por mensaje

### 2. **Hook - Chat**
- **Ruta:** `/hooks/sales-analytics/use-sales-chat.ts`
- **Exports:**
  ```typescript
  {
    // State
    conversations: SalesChatConversation[],
    messages: SalesChatMessage[],
    currentConversationId: string | null,
    isLoadingConversations: boolean,
    isLoadingMessages: boolean,

    // Actions
    sendMessage: ({ message, includeContext }) => Promise,
    deleteConversation: (id) => Promise,
    startNewConversation: () => void,
    selectConversation: (id) => void,
    refetchConversations: () => void,
    refetchMessages: () => void,

    // Loading
    isSending: boolean,
    isDeleting: boolean,
  }
  ```
- **Gestión de Estado:**
  - Query para conversaciones: `['sales-chat-conversations', projectId]`
  - Query para mensajes: `['sales-chat-messages', conversationId]`
  - Estado local para `currentConversationId`
  - Refetch automático después de enviar mensaje

### 3. **Página - Chat Interactivo**
- **Ruta:** `/app/sales-analytics/projects/[id]/chat/page.tsx`
- **Layout:** Grid 2 columnas (sidebar + chat)

#### Sidebar de Conversaciones (col-1):
- Lista de conversaciones pasadas
- Click para seleccionar conversación
- Botón eliminar por conversación
- Highlight de conversación activa
- Empty state cuando no hay conversaciones

#### Área de Chat (col-3):
- **Header:**
  - Título "Conversación Actual" o "Nueva Conversación"
  - Switch "Incluir contexto (RAG)" - Activa/desactiva RAG
- **Mensajes:**
  - Burbujas diferenciadas (usuario: azul/derecha, IA: gris/izquierda)
  - Iconos: Bot (IA) y User (usuario)
  - Footer en mensajes de IA: tokens y costo
  - Auto-scroll al último mensaje
  - Empty state con instrucciones
- **Input:**
  - Campo de texto para escribir mensaje
  - Botón "Enviar" (con loading state)
  - Enter para enviar, Shift+Enter para nueva línea
  - Hint text de ayuda

---

## 🎯 Funcionalidades Implementadas

### RAG (Retrieval Augmented Generation)

**Cómo funciona:**
1. Usuario activa switch "Incluir contexto (RAG)"
2. Al enviar mensaje, backend obtiene últimos 3 reportes
3. Extrae información relevante:
   - `resumen_ejecutivo` de cada reporte
   - `metricas_clave` (revenue, órdenes, etc.)
   - Período de cada reporte
4. Construye contexto enriquecido:
   ```
   **Contexto de reportes recientes:**

   **Reporte 1 (2026-04-06 - 2026-04-12):**
   [Resumen ejecutivo del reporte...]
   Métricas: {"revenue_total": 15000, "total_orders": 120, ...}

   **Reporte 2 (2026-03-30 - 2026-04-05):**
   ...
   ```
5. Concatena contexto al mensaje del usuario
6. Envía todo a Gemini para respuesta contextualizada

**Ventajas del RAG:**
- IA responde con datos reales del restaurante
- Referencias a tendencias históricas
- Comparaciones entre períodos
- Recomendaciones basadas en análisis previos

### Gestión de Conversaciones

1. **Nueva Conversación:**
   - Click en "Nueva Conversación" limpia el estado
   - Primer mensaje crea conversación automáticamente
   - Título = primeros 100 caracteres del mensaje

2. **Seleccionar Conversación:**
   - Click en sidebar carga mensajes históricos
   - Highlight visual de conversación activa
   - Mensajes ordenados cronológicamente

3. **Eliminar Conversación:**
   - Botón de eliminación por conversación
   - Confirmación antes de eliminar
   - Elimina mensajes en cascada (foreign key)

### Cálculo de Costos

Por cada mensaje de IA:
```typescript
const inputCost = (promptTokens / 1_000_000) * modelConfig.input_cost_per_million;
const outputCost = (completionTokens / 1_000_000) * modelConfig.output_cost_per_million;
const totalCost = inputCost + outputCost;
```

Costos se muestran en cada mensaje de IA.

---

## 📊 Types Actualizados

### SalesChatConversation
```typescript
export interface SalesChatConversation {
  id: string;
  project_id: string;
  title?: string; // ✅ AGREGADO - Título de la conversación
  created_at: string;
  updated_at?: string;
  created_by?: string;
}
```

### SalesChatMessage (NUEVO)
```typescript
export interface SalesChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  model_used?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_cost?: number;
  created_at: string;
}
```

---

## 🔄 Flujo Completo del Chat

```
Usuario escribe mensaje
  ↓
Click "Enviar" (o Enter)
  ↓
Frontend: sendMessage({ message, includeContext })
  ↓
Backend: POST /api/sales-analytics/chat
  ↓
1. Obtener configuración del proyecto
2. Obtener prompt activo
3. [Si includeContext] Obtener últimos 3 reportes → Construir contexto
4. Construir prompt final (system + user + contexto)
5. Llamar a Gemini AI
6. Calcular costo
7. Guardar mensaje de usuario en BD
8. Guardar respuesta de IA en BD
  ↓
Frontend: Recibe respuesta
  ↓
Refetch mensajes → Actualiza UI
  ↓
Auto-scroll al último mensaje
```

---

## 🎨 UI/UX Highlights

### Diseño de Mensajes:
- **Usuario:** Burbuja azul (primary), alineada derecha, icono User
- **IA:** Burbuja gris, alineada izquierda, icono Bot
- **Ancho máximo:** 70% del contenedor
- **Espaciado:** 16px entre mensajes
- **Formato:** Soporta `whitespace-pre-wrap` (preserva saltos de línea)

### Estados Visuales:
- **Loading conversaciones:** "Cargando..." en sidebar
- **Loading mensajes:** "Cargando mensajes..." en centro
- **Sending:** Spinner en botón "Enviar"
- **Deleting:** Spinner en botón de eliminación
- **Empty states:**
  - Sin conversaciones: Icono + texto descriptivo
  - Sin mensajes: Bot icon + instrucciones + hint de RAG

### Interacciones:
- **Click en conversación:** Selecciona y carga mensajes
- **Click en eliminar:** Wrapper div con stopPropagation para evitar seleccionar
- **Enter:** Envía mensaje
- **Shift+Enter:** Nueva línea en input
- **Auto-scroll:** useRef + scrollIntoView después de cada mensaje nuevo

---

## ✅ Testing Manual Sugerido

1. **Nueva Conversación:**
   - Click "Nueva Conversación"
   - Escribir "¿Cuál fue mi revenue del último mes?"
   - Verificar que responde (puede ser genérico si no hay reportes)
   - Verificar que aparece en sidebar

2. **RAG Activado:**
   - Activar switch "Incluir contexto (RAG)"
   - Hacer pregunta sobre ventas
   - Verificar que respuesta incluye datos reales de reportes

3. **RAG Desactivado:**
   - Desactivar switch
   - Hacer misma pregunta
   - Verificar que respuesta es más genérica

4. **Seleccionar Conversación:**
   - Crear 2-3 conversaciones diferentes
   - Click en sidebar para alternar
   - Verificar que carga mensajes correctos

5. **Eliminar Conversación:**
   - Click en botón eliminar
   - Confirmar
   - Verificar que desaparece de sidebar

6. **Costos:**
   - Verificar que cada mensaje de IA muestra tokens y costo
   - Formato: "Tokens: X + Y | Costo: $Z"

---

## 🚀 Próximas Fases

- ✅ FASE 1-7: COMPLETADAS 🎉
- ⏳ **FASE 8:** Configuración Global (API Keys, Modelos) - FINAL

---

## 📊 Estado Final

✅ **0 errores de TypeScript**
✅ **API route funcionando** con RAG
✅ **Hook de React Query** para chat
✅ **Página de UI completamente funcional**
✅ **Types actualizados** (SalesChatMessage agregado)
✅ **Gestión de conversaciones** completa
✅ **Cálculo de costos** implementado

---

## 📝 Notas Técnicas

1. **RAG Implementation:**
   - Simple pero efectivo: últimos 3 reportes
   - Puede mejorarse con embeddings + similarity search (futuro)
   - Por ahora usa contexto directo en prompt

2. **Gemini AI:**
   - Modelo por defecto: `gemini-2.0-flash-exp`
   - Temperature del prompt activo (o 0.7 default)
   - maxTokens removido (incompatible con SDK actual)

3. **Conversaciones:**
   - Tabla `sales_chat_conversations` (título, project_id)
   - Tabla `sales_chat_messages` (role, content, tokens, cost)
   - Foreign key con ON DELETE CASCADE

4. **Performance:**
   - Queries separadas para conversaciones y mensajes
   - `enabled: !!currentConversationId` evita fetch innecesario
   - Auto-scroll con ref + useEffect

5. **UX:**
   - Input no se limpia hasta respuesta exitosa
   - Loading states en todos los botones
   - Confirmación antes de eliminación

---

**Estado Final:** ✅ FASE 7 COMPLETADA (Interactive Chat with RAG)

**Sistema 87.5% completo** (7 de 8 fases)

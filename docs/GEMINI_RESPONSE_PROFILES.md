# Guía de Perfiles de Respuesta - Gemini Chat

## Descripción General

El sistema de chat RAG incluye **4 perfiles de respuesta** predefinidos que controlan la calidad, cantidad y estilo de las respuestas generadas por Gemini.

## Perfiles Disponibles

### 1. **Concise** (Concisa)
- **Longitud:** ~400 palabras (512 tokens)
- **Temperature:** 0.3 (más preciso y directo)
- **Uso recomendado:**
  - Respuestas rápidas a FAQs
  - Consultas simples que requieren respuestas directas
  - Cuando el usuario solo necesita información específica
- **Ventajas:**
  - ✅ Respuestas rápidas
  - ✅ Menor costo
  - ✅ Información directa al grano
- **Desventajas:**
  - ⚠️ Puede omitir contexto importante
  - ⚠️ Menos explicaciones

### 2. **Balanced** (Balanceada) - *POR DEFECTO*
- **Longitud:** ~1600 palabras (2048 tokens)
- **Temperature:** 0.7 (balance creatividad/precisión)
- **Uso recomendado:**
  - Uso general del chat
  - Preguntas que requieren contexto moderado
  - Explicaciones de documentos
- **Ventajas:**
  - ✅ Balance perfecto entre detalle y brevedad
  - ✅ Buen costo/beneficio
  - ✅ Suficiente contexto para la mayoría de casos
- **Desventajas:**
  - ⚠️ Puede quedarse corto para análisis profundos

### 3. **Detailed** (Detallada)
- **Longitud:** ~3200 palabras (4096 tokens)
- **Temperature:** 0.8 (más explicativo y contextual)
- **Uso recomendado:**
  - Análisis de documentos complejos
  - Tutoriales paso a paso
  - Explicaciones técnicas detalladas
  - Comparaciones entre documentos
- **Ventajas:**
  - ✅ Explicaciones completas
  - ✅ Mayor contexto
  - ✅ Ejemplos y detalles adicionales
- **Desventajas:**
  - ⚠️ Respuestas más lentas
  - ⚠️ Mayor costo

### 4. **Comprehensive** (Completa)
- **Longitud:** ~6400 palabras (8192 tokens)
- **Temperature:** 0.9 (máxima cobertura)
- **Uso recomendado:**
  - Investigación exhaustiva
  - Reportes completos
  - Análisis de múltiples documentos
  - Cuando se necesita máximo detalle
- **Ventajas:**
  - ✅ Respuestas extremadamente detalladas
  - ✅ Cubre todos los ángulos posibles
  - ✅ Ideal para reportes profesionales
- **Desventajas:**
  - ⚠️ Respuestas muy largas (puede ser abrumador)
  - ⚠️ Mayor tiempo de generación
  - ⚠️ Mayor costo

## Parámetros Técnicos

| Perfil | Temperature | Max Tokens | Top P | Top K | Costo Relativo |
|--------|-------------|------------|-------|-------|----------------|
| Concise | 0.3 | 512 | 0.8 | 20 | 💰 |
| Balanced | 0.7 | 2048 | 0.9 | 40 | 💰💰 |
| Detailed | 0.8 | 4096 | 0.95 | 60 | 💰💰💰 |
| Comprehensive | 0.9 | 8192 | 1.0 | 80 | 💰💰💰💰 |

### ¿Qué significan estos parámetros?

- **Temperature (0.0 - 2.0):** Controla la creatividad
  - Bajo (0.0-0.3): Respuestas más predecibles y precisas
  - Medio (0.4-0.8): Balance entre creatividad y precisión
  - Alto (0.9-2.0): Respuestas más creativas y variadas

- **Max Output Tokens:** Límite de tokens (palabras) en la respuesta
  - 1 token ≈ 0.75 palabras en español
  - Más tokens = respuestas más largas

- **Top P (0.0 - 1.0):** Diversidad del vocabulario
  - Más bajo: Usa palabras más comunes
  - Más alto: Mayor variedad de vocabulario

- **Top K:** Número de opciones consideradas por token
  - Más bajo: Respuestas más enfocadas
  - Más alto: Respuestas más diversas

## Uso en la Interfaz

1. Abre el chat RAG
2. Selecciona tu perfil deseado en el dropdown "Calidad de Respuesta"
3. Escribe tu pregunta
4. La respuesta se generará usando el perfil seleccionado

## Uso Programático (API)

```typescript
// Usando perfil predefinido
const response = await fetch("/api/rag/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "¿Cuántas horas estudió Juan?",
    storageId: "storage-123",
    profile: "detailed", // concise | balanced | detailed | comprehensive
  }),
});

// O usando parámetros personalizados
const response = await fetch("/api/rag/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "¿Cuántas horas estudió Juan?",
    storageId: "storage-123",
    temperature: 0.5,
    maxOutputTokens: 3000,
  }),
});
```

## Costos Estimados

Basado en los precios de Gemini 2.5 Flash:
- Input: $0.075 por 1M tokens
- Output: $0.30 por 1M tokens

| Perfil | Costo Promedio por Consulta |
|--------|----------------------------|
| Concise | ~$0.0002 |
| Balanced | ~$0.0007 |
| Detailed | ~$0.0014 |
| Comprehensive | ~$0.0028 |

*Nota: Estos son estimados. El costo real depende del tamaño de los documentos y la complejidad de la pregunta.*

## Recomendaciones

1. **Empezar con Balanced:** Es el perfil por defecto y funciona bien para la mayoría de casos

2. **Usar Concise para:**
   - Preguntas simples (sí/no, datos específicos)
   - Cuando necesitas respuestas rápidas
   - Chats con muchas consultas (para reducir costos)

3. **Usar Detailed cuando:**
   - Necesitas entender un documento complejo
   - Requieres explicaciones paso a paso
   - Estás aprendiendo sobre un tema nuevo

4. **Usar Comprehensive para:**
   - Reportes finales
   - Análisis exhaustivos
   - Cuando el detalle es crítico

## Personalización Avanzada

Si necesitas parámetros específicos, puedes modificar los perfiles en:
`/lib/ai/gemini-service.ts` en la constante `RESPONSE_PROFILES`

```typescript
export const RESPONSE_PROFILES: Record<ResponseProfile, ResponseConfig> = {
  // Personaliza aquí
  custom: {
    temperature: 0.6,
    maxOutputTokens: 1500,
    topP: 0.85,
    topK: 30,
  },
};
```

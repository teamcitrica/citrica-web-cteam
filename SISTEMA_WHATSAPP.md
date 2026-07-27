# Sistema Chat WhatsApp

Bot RAG conectado a WhatsApp Cloud API (Meta Graph v25.0) con takeover humano desde el admin.
Reutiliza el RAG existente (`SISTEMA_RAG.md`): misma API key de Gemini, mismos modelos,
mismos File Search stores y los mismos prompts configurables.

## Flujo

```
Cliente WhatsApp
      ↓ mensaje
Meta Cloud API
      ↓ POST https://citrica.dev/api/wa
app/api/wa/route.ts
      1. valida X-Hub-Signature-256 sobre el raw body
      2. responde 200 de inmediato (Meta reintenta si tarda)
      3. after(): dedupe → upsert conversación → guarda mensaje
                 → si IA activa: genera con RAG → envía → guarda respuesta
      ↓
Supabase (service-role)  ──realtime──▶  /admin/whatsapp
```

## Archivos

| Archivo | Rol |
|---|---|
| `supabase/migrations/018_whatsapp_chat.sql` | Tablas, RLS, realtime, rpc `increment_wa_unread` |
| `lib/whatsapp/graph-api.ts` | `sendWhatsAppText()`, `splitWhatsAppText()` (límite 4096) |
| `lib/whatsapp/webhook.ts` | `verifyWebhookSignature()` (HMAC), `parseIncomingMessages()` |
| `lib/whatsapp/generate-reply.ts` | `generateWhatsAppReply()` — RAG **sin streaming** |
| `app/api/wa/route.ts` | Webhook: GET verificación + POST recepción |
| `app/api/wa/send/route.ts` | Envío manual del admin (requiere sesión) |
| `hooks/whatsapp/*` | Hooks client con realtime |
| `app/admin/whatsapp/page.tsx` | UI: lista de chats + conversación + settings |

## Tablas

**`wa_settings`** (fila única `id = 1`)
- `ai_enabled` — apagarlo pausa el bot en TODAS las conversaciones
- `default_storage_id` → `document_storages` — base de conocimiento por defecto
- `system_prompt` — instrucciones extra del canal; se **concatenan** al prompt RAG

**`wa_conversations`** (una por número)
- `wa_id` UNIQUE — E.164 sin `+` (es el `to` de la Graph API)
- `storage_id` — override; NULL = usa el default global
- `ai_enabled` — FALSE = takeover humano (se guarda el mensaje, no se responde)
- `unread_count`, `last_message_at`, `last_message_preview`

**`wa_messages`**
- `direction` `in`/`out`, `sender_type` `user`/`ai`/`agent`
- `wa_message_id` UNIQUE — dedupe de los reintentos de Meta
- `status` `received`/`sent`/`failed` + `error_message`
- `model`, `prompt_tokens`, `completion_tokens`, `total_tokens`, `cost_usd`

El consumo de la IA se suma al storage vía la rpc existente `increment_storage_usage`,
igual que el chat RAG del admin: los tokens se ven en `/admin/ia/databases_rag`.

## Resolución del prompt

```
prompt del storage (custom_prompt > rag_prompt_defaults[strict|base])
  + wa_settings.system_prompt   (si existe)
  + instrucción fija del canal  (breve, sin Markdown, sin encabezados)
```

Perfil de respuesta: `concise`, `maxOutputTokens: 1024`. Memoria: últimos 20 mensajes
de la conversación. Los mensajes del agente humano entran como `model` para que la IA
tenga el contexto de lo que ya se respondió.

## Variables de entorno

En `.env.local` y en Vercel (Production):

```
WHATSAPP_BOT_ACCESS_TOKEN     # token permanente del System User
WHATSAPP_BOT_PHONE_NUMBER_ID  # 1154989417705640
WHATSAPP_BOT_VERIFY_TOKEN     # string aleatorio propio; el mismo se pone en Meta
WHATSAPP_BOT_APP_SECRET       # Meta > App Settings > Basic > App Secret
```

Sin `WHATSAPP_BOT_APP_SECRET` el webhook responde 500: la firma es obligatoria.

### Por qué el prefijo `WHATSAPP_BOT_`

Ya existe otra integración de WhatsApp en el proyecto: la Edge Function de Supabase
**`notify-booking`**, que avisa por plantilla cuando entra una reserva. Usa **otro número**
y sus propias variables (`WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`WHATSAPP_ADMIN_PHONES`, `WHATSAPP_TEMPLATE_NAME`) sobre Graph v22.0.

Son almacenes distintos — la Edge Function lee los secrets de Supabase, este bot lee las
env vars de Vercel — pero el prefijo `WHATSAPP_BOT_` evita confundirlas al configurarlas.

## Configuración en Meta

1. developers.facebook.com → tu App → WhatsApp → Configuration → Webhook
2. Callback URL: `https://citrica.dev/api/wa`
3. Verify token: el mismo valor de `WHATSAPP_BOT_VERIFY_TOKEN`
4. "Verify and save" (dispara el GET del webhook)
5. Webhook fields: suscribir **solo `messages`**

## Verificación

```bash
# 1. Verificación del webhook (GET)
curl "http://localhost:3000/api/wa?hub.mode=subscribe&hub.verify_token=$WHATSAPP_BOT_VERIFY_TOKEN&hub.challenge=12345"
# → 12345

# 2. Mensaje simulado (POST firmado)
cat > payload.json <<'JSON'
{"entry":[{"changes":[{"field":"messages","value":{
  "contacts":[{"wa_id":"51942627383","profile":{"name":"Test"}}],
  "messages":[{"id":"wamid.TEST1","from":"51942627383","type":"text","text":{"body":"hola"}}]
}}]}]}
JSON

SIG=$(openssl dgst -sha256 -hmac "$WHATSAPP_BOT_APP_SECRET" -hex payload.json | awk '{print $2}')
curl -X POST http://localhost:3000/api/wa \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIG" \
  --data-binary @payload.json
# → {"received":true}; repetir el mismo curl NO debe duplicar filas (dedupe por wamid)
```

## Límites conocidos

- **Ventana de 24h**: WhatsApp solo permite texto libre dentro de las 24h posteriores al
  último mensaje del cliente. Las respuestas del bot siempre caen dentro; los envíos
  manuales fuera de ventana fallan con código `131047` y quedan como `failed` en el hilo.
  Re-engagement requiere plantillas aprobadas (no implementado).
- **Solo texto**: imágenes, audios y documentos se registran pero no disparan a la IA.
- **Mensajes consecutivos rápidos**: cada uno genera una respuesta independiente; no hay
  cola ni debounce.

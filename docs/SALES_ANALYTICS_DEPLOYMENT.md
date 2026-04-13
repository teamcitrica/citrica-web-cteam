# 📋 Sales Analytics - Guía de Deployment

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Agregar al archivo `.env.local` de Citrica:

```bash
# Sales Analytics - Encryption
SALES_ENCRYPTION_KEY=<generar con: openssl rand -hex 32>

# Sales Analytics - API Internal (para edge function)
CITRICA_INTERNAL_API_KEY=<generar token aleatorio>
CITRICA_API_URL=https://citrica-web-frontend.vercel.app

# Gemini API Key (global - opcional si se configura por proyecto)
GOOGLE_GENERATIVE_AI_API_KEY=<tu-api-key-de-gemini>
```

### 2. Generar Encryption Key

```bash
# En terminal
openssl rand -hex 32
# Output: abc123def456... (64 caracteres hex)

# Copiar al .env.local como SALES_ENCRYPTION_KEY
```

### 3. Configurar API Key de Gemini en BD

```sql
-- Insertar en sales_api_config
INSERT INTO sales_api_config (provider, api_key, is_active, verification_status)
VALUES ('gemini', '<API-KEY-ENCRIPTADA>', true, 'pending');
```

**IMPORTANTE:** La API key debe estar encriptada usando el helper `encrypt()` desde Node.js antes de insertarla.

Alternativamente, crear un endpoint admin para configurar esto desde UI.

---

## 📦 Deploy de Edge Function

### 1. Login en Supabase CLI

```bash
cd /Users/citrica/Documents/Citrica-Dev/Web/Citrica/citrica-web-frontend

# Login
npx supabase login

# Link al proyecto Citrica
npx supabase link --project-ref sisgcpwkvhukviopwtii
```

### 2. Deploy de la función

```bash
# Deploy
npx supabase functions deploy sales-analytics-cron-master
```

### 3. Configurar variables de entorno en Supabase

```bash
# Configurar secrets
npx supabase secrets set CITRICA_INTERNAL_API_KEY=<tu-token>
npx supabase secrets set CITRICA_API_URL=https://citrica-web-frontend.vercel.app
npx supabase secrets set SALES_ENCRYPTION_KEY=<tu-key-hex-64-chars>
```

### 4. Configurar Cron en Supabase Dashboard

1. Ir a: https://supabase.com/dashboard/project/sisgcpwkvhukviopwtii/functions
2. Click en `sales-analytics-cron-master`
3. Tab "Cron Jobs"
4. Click "Add Cron Job"
5. Configurar:
   - **Name:** `sales-analytics-every-minute`
   - **Cron Expression:** `* * * * *` (cada minuto)
   - **Region:** Mismo que el proyecto
   - **HTTP Method:** POST
   - **Payload:** `{}` (vacío)

**¿Por qué cada minuto?**
El cron maestro evalúa TODOS los proyectos cada minuto, pero solo ejecuta los que tienen su cron expression coincidente. Esto permite tener múltiples proyectos con diferentes horarios sin necesidad de múltiples edge functions.

---

## ✅ Verificación

### 1. Test manual de edge function

```bash
# Invocar función manualmente
curl -X POST \
  https://sisgcpwkvhukviopwtii.supabase.co/functions/v1/sales-analytics-cron-master \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>"
```

### 2. Ver logs

```bash
# Logs en tiempo real
npx supabase functions logs sales-analytics-cron-master --tail
```

### 3. Verificar en BD

```sql
-- Ver logs de ejecución
SELECT * FROM sales_cron_logs
ORDER BY executed_at DESC
LIMIT 20;

-- Ver proyectos activos
SELECT id, name, cron_expression, last_report_generated_at, next_scheduled_execution
FROM sales_projects
WHERE is_active = true;

-- Ver reportes generados
SELECT id, project_id, period_start, period_end, generated_at
FROM sales_weekly_reports
ORDER BY generated_at DESC
LIMIT 10;
```

---

## 🔧 Troubleshooting

### Error: "SALES_ENCRYPTION_KEY no configurada"

**Causa:** Falta la variable de entorno en Supabase secrets.

**Solución:**
```bash
npx supabase secrets set SALES_ENCRYPTION_KEY=<tu-key>
```

### Error: "API key de Gemini no configurada"

**Causa:** No hay API key en `sales_api_config` o está marcada como inactiva.

**Solución:**
```sql
-- Verificar
SELECT * FROM sales_api_config WHERE provider = 'gemini';

-- Insertar si no existe
INSERT INTO sales_api_config (provider, api_key, is_active, verification_status)
VALUES ('gemini', '<API-KEY-ENCRIPTADA>', true, 'valid');
```

### Error: "Error en RPC: get_sales_data_for_export"

**Causa:** El restaurante no tiene la función RPC o falló la verificación de setup.

**Solución:**
1. Ir a proyecto en Citrica Admin
2. Click en "Verificar Setup"
3. Si falla, generar script SQL nuevamente
4. Ejecutar script en Supabase del restaurante

### Los reportes no se generan automáticamente

**Checklist:**
1. ✅ ¿La edge function está desplegada?
2. ✅ ¿El cron está configurado en Supabase (`* * * * *`)?
3. ✅ ¿El proyecto está activo (`is_active = true`)?
4. ✅ ¿El proyecto NO está pausado (`is_paused = false`)?
5. ✅ ¿El proyecto está conectado (`connection_status = 'connected'`)?
6. ✅ ¿El `cron_expression` del proyecto es correcto?
7. ✅ ¿El `timezone` del proyecto es correcto?

```sql
-- Verificar proyecto
SELECT
  name,
  is_active,
  is_paused,
  connection_status,
  cron_expression,
  timezone,
  last_report_generated_at
FROM sales_projects
WHERE id = '<PROJECT_ID>';
```

---

## 📊 Monitoreo

### Métricas clave

```sql
-- Reportes generados hoy
SELECT COUNT(*) as reportes_hoy
FROM sales_weekly_reports
WHERE DATE(generated_at) = CURRENT_DATE;

-- Proyectos con errores
SELECT p.name, l.error_message, l.executed_at
FROM sales_cron_logs l
JOIN sales_projects p ON p.id = l.project_id
WHERE l.status = 'error'
  AND l.executed_at > NOW() - INTERVAL '24 hours'
ORDER BY l.executed_at DESC;

-- Costo total de IA (últimos 30 días)
SELECT
  p.name,
  COUNT(*) as num_reportes,
  SUM(r.total_tokens) as total_tokens,
  SUM(r.cost_usd) as costo_total_usd
FROM sales_weekly_reports r
JOIN sales_projects p ON p.id = r.project_id
WHERE r.generated_at > NOW() - INTERVAL '30 days'
GROUP BY p.name
ORDER BY costo_total_usd DESC;
```

---

## 🔐 Seguridad

### Rotar encryption key

**ADVERTENCIA:** Rotar la key invalidará TODAS las credenciales encriptadas existentes.

1. Generar nueva key: `openssl rand -hex 32`
2. Actualizar secret: `npx supabase secrets set SALES_ENCRYPTION_KEY=<nueva-key>`
3. Re-encriptar TODAS las credenciales en BD:
   - `sales_projects.supabase_anon_key`
   - `sales_projects.custom_api_key`
   - `sales_api_config.api_key`

### Rotar API keys de Gemini

```sql
-- Marcar key actual como inactiva
UPDATE sales_api_config
SET is_active = false
WHERE provider = 'gemini';

-- Insertar nueva key
INSERT INTO sales_api_config (provider, api_key, is_active, verification_status)
VALUES ('gemini', '<NUEVA-KEY-ENCRIPTADA>', true, 'pending');
```

---

## 📱 Integración WhatsApp (Pendiente)

**Estado:** Helper creado pero sin integración real.

**Proveedores sugeridos:**
- Twilio
- Meta WhatsApp Business API
- Vonage

**Para implementar:**
1. Elegir proveedor
2. Obtener API key
3. Actualizar función `sendWhatsApp()` en edge function
4. Re-deploy: `npx supabase functions deploy sales-analytics-cron-master`

---

## 🎯 Próximos Pasos

Después del deployment:

1. **FASE 4:** UI Admin - Onboarding Wizard
2. **FASE 5:** UI Admin - Gestión de Proyectos
3. **FASE 6:** UI Admin - Editor de Prompts
4. **FASE 7:** UI Admin - Chat Interactivo
5. **FASE 8:** Configuración Global

Ver `docs/PLAN_FINAL_SALES_ANALYTICS_RAG.md` para detalles completos.

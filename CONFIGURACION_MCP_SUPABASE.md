# Configuración de Supabase MCP para Claude Code (VS Code)

Este documento explica cómo configurar el Model Context Protocol (MCP) de Supabase para usar con Claude Code en Visual Studio Code.

## ¿Qué es MCP?

Model Context Protocol (MCP) es un estándar abierto que conecta Claude a herramientas externas, bases de datos y APIs. Con Supabase MCP, Claude puede acceder directamente a tu base de datos Supabase para:

- Crear y modificar tablas
- Ejecutar queries SQL
- Aplicar migraciones
- Gestionar funciones RPC
- Configurar políticas RLS (Row Level Security)
- Listar y analizar el esquema de la base de datos
- Desplegar Edge Functions
- Obtener recomendaciones de seguridad y performance

---

## Requisitos Previos

1. **Claude Code para VS Code** instalado
2. **Node.js** instalado (para usar npx)
3. **Supabase Personal Access Token** con permisos necesarios

---

## Paso 1: Obtener el Personal Access Token de Supabase

### 1.1 Accede al Dashboard de Supabase

Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)

### 1.2 Genera un Personal Access Token

1. Haz clic en tu avatar (esquina superior derecha)
2. Selecciona **Account Settings**
3. Ve a la sección **Access Tokens**
4. Haz clic en **Generate New Token**
5. Dale un nombre descriptivo (ej: `claude_mcp_token`)
6. **Guarda el token** en un lugar seguro - solo se muestra una vez

El token tendrá este formato: `sbp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 1.3 Obtén el Project ID

**Opción 1: Desde el Dashboard**
1. Ve a tu proyecto en Supabase
2. Ve a **Settings** > **General**
3. Copia el **Reference ID** (ej: `rvjockjrwalsnyajwzts`)

**Opción 2: Desde la URL**

Extráelo de tu URL de Supabase:
```
https://[PROJECT_ID].supabase.co
```

Ejemplo: `https://rvjockjrwalsnyajwzts.supabase.co` → Project ID: `rvjockjrwalsnyajwzts`

---

## Paso 2: Ubicar el archivo de configuración

El archivo de configuración de Claude Code se encuentra en:

```
~/.claude.json
```

**IMPORTANTE:** Este archivo es muy grande y contiene toda la configuración de Claude Code para todos tus proyectos.

### Ubicación según sistema operativo:

- **macOS**: `~/.claude.json` o `/Users/TU_USUARIO/.claude.json`
- **Windows**: `C:\Users\TU_USUARIO\.claude.json`
- **Linux**: `~/.claude.json` o `/home/TU_USUARIO/.claude.json`

---

## Paso 3: Hacer backup del archivo

Antes de editar, siempre haz un backup:

```bash
cp ~/.claude.json ~/.claude.json.backup
```

---

## Paso 4: Encontrar la ruta de tu proyecto

Desde la terminal en la raíz de tu proyecto, ejecuta:

```bash
pwd
```

Esto te dará la ruta completa y absoluta de tu proyecto. Por ejemplo:
```
/Users/citrica/Documents/Citrica-Dev/Web/Citrica/citrica-web-frontend
```

**Guarda esta ruta**, la necesitarás en el siguiente paso.

---

## Paso 5: Editar la configuración del proyecto

### 5.1 Busca la sección de tu proyecto

Abre el archivo `~/.claude.json` y busca la ruta de tu proyecto (la que obtuviste con `pwd`).

Se verá así:

```json
"/ruta/completa/a/tu/proyecto": {
  "allowedTools": [],
  "mcpContextUris": [],
  "mcpServers": {},
  "enabledMcpjsonServers": [],
  "disabledMcpjsonServers": [],
  ...
}
```

### 5.2 Agregar la configuración de Supabase MCP

Reemplaza `"mcpServers": {}` con:

```json
"mcpServers": {
  "supabase": {
    "type": "stdio",
    "command": "npx",
    "args": [
      "-y",
      "@supabase/mcp-server-supabase@latest"
    ],
    "env": {
      "SUPABASE_ACCESS_TOKEN": "TU_TOKEN_AQUI",
      "SUPABASE_PROJECT_ID": "TU_PROJECT_ID_AQUI"
    }
  }
}
```

### 5.3 Ejemplo completo

```json
"/Users/citrica/Documents/Citrica-Dev/Web/Citrica/citrica-web-frontend": {
  "allowedTools": [],
  "mcpContextUris": [],
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_***REDACTED***",
        "SUPABASE_PROJECT_ID": "rvjockjrwalsnyajwzts"
      }
    }
  },
  "enabledMcpjsonServers": [],
  "disabledMcpjsonServers": [],
  "hasTrustDialogAccepted": false,
  ...
}
```

**⚠️ IMPORTANTE:** Reemplaza:
- `SUPABASE_ACCESS_TOKEN` con tu Personal Access Token (comienza con `sbp_`)
- `SUPABASE_PROJECT_ID` con tu Project ID

---

## Paso 6: Guardar y reiniciar

1. **Guarda** el archivo `~/.claude.json`
2. **Cierra VSCode completamente** (no solo recarga, cierra la aplicación)
3. Vuelve a abrir VSCode
4. Abre Claude Code en tu proyecto

---

## Paso 7: Verificar la conexión

Dentro de Claude Code, escribe el comando:

```
/mcp
```

Deberías ver:

```
Manage MCP Servers

supabase
running
```

✅ Si ves "running" → ¡Configuración exitosa!
❌ Si ves "failed" → Ve a la sección de Solución de Problemas

---

## Herramientas MCP Disponibles

Una vez conectado, Claude tendrá acceso a estas herramientas de Supabase:

- `list_tables` - Lista todas las tablas del esquema
- `execute_sql` - Ejecuta queries SQL directamente
- `apply_migration` - Aplica migraciones DDL
- `list_migrations` - Lista migraciones existentes
- `get_project` - Obtiene detalles del proyecto
- `get_advisors` - Obtiene recomendaciones de seguridad/performance
- `deploy_edge_function` - Despliega Edge Functions
- `list_edge_functions` - Lista todas las Edge Functions
- `get_project_url` - Obtiene la URL del proyecto
- `get_publishable_keys` - Obtiene las API keys públicas
- Y muchas más...

---

## Prueba la Configuración

### Prueba básica

Pídele a Claude:

```
Lista todas las tablas en mi base de datos de Supabase
```

Claude debería usar la herramienta `list_tables` y mostrarte las tablas.

### Ejecuta un query

```
Muéstrame los primeros 5 registros de la tabla users
```

Claude usará `execute_sql` para ejecutar:
```sql
SELECT * FROM users LIMIT 5;
```

### Crear una tabla con RLS

```
Crea una tabla llamada courses con los siguientes campos:
- id (uuid, primary key)
- title (text, required)
- description (text)
- created_at (timestamp)
- updated_at (timestamp)

Agrega también políticas RLS para que solo usuarios autenticados puedan leer.
```

Claude usará el MCP para:
1. Crear la migración SQL
2. Aplicarla con `apply_migration`
3. Configurar las políticas RLS
4. Verificar que todo se creó correctamente

---

## Solución de Problemas

### Problema: El servidor aparece como "failed"

**Causa común:** Credenciales incorrectas o en formato incorrecto.

**Solución:**
1. ✅ Verifica que estés usando `SUPABASE_ACCESS_TOKEN` y `SUPABASE_PROJECT_ID`
2. ❌ NO uses `SUPABASE_URL` ni `SUPABASE_SERVICE_ROLE_KEY` (estos NO funcionan con MCP)
3. Verifica que el token sea válido en [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
4. Verifica que el Project ID sea correcto

### Problema: No aparece ningún servidor al escribir /mcp

**Causa:** La configuración no está en la ruta correcta del proyecto.

**Solución:**
1. Verifica que la ruta del proyecto en `~/.claude.json` sea la ruta completa y absoluta
2. Ejecuta `pwd` desde la terminal en la raíz del proyecto
3. Busca esa ruta **exacta** en el archivo `~/.claude.json`
4. Asegúrate de que no haya espacios extra o caracteres especiales

### Problema: Error de autenticación

**Solución:**
1. Regenera un nuevo Personal Access Token en Supabase
2. Actualiza el token en `~/.claude.json`
3. Recarga VS Code completamente

### Problema: MCP aparece pero no funciona

**Solución:**
1. Revisa los logs de Claude Code (Output panel en VS Code)
2. Verifica que Node.js esté instalado: `node --version`
3. Verifica que npx esté disponible: `npx --version`
4. Prueba el servidor manualmente:
   ```bash
   SUPABASE_ACCESS_TOKEN="tu_token" SUPABASE_PROJECT_ID="tu_project_id" npx -y @supabase/mcp-server-supabase@latest
   ```

---

## Configuración para Múltiples Proyectos

Si tienes varios proyectos que usan el mismo Supabase, puedes copiar y pegar la misma configuración de `mcpServers` en cada entrada de proyecto en `~/.claude.json`.

**Ejemplo:**

```json
{
  "projects": {
    "/Users/citrica/Documents/proyecto1": {
      "mcpServers": {
        "supabase": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@supabase/mcp-server-supabase@latest"],
          "env": {
            "SUPABASE_ACCESS_TOKEN": "sbp_xxxxx",
            "SUPABASE_PROJECT_ID": "proyecto1id"
          }
        }
      }
    },
    "/Users/citrica/Documents/proyecto2": {
      "mcpServers": {
        "supabase": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@supabase/mcp-server-supabase@latest"],
          "env": {
            "SUPABASE_ACCESS_TOKEN": "sbp_xxxxx",
            "SUPABASE_PROJECT_ID": "proyecto2id"
          }
        }
      }
    }
  }
}
```

---

## Comandos Útiles

### Ver la ruta actual del proyecto
```bash
pwd
```

### Backup del archivo de configuración
```bash
cp ~/.claude.json ~/.claude.json.backup
```

### Restaurar desde backup
```bash
cp ~/.claude.json.backup ~/.claude.json
```

### Verificar que el paquete MCP existe
```bash
npm view @supabase/mcp-server-supabase version
```

### Buscar tu proyecto en ~/.claude.json
```bash
grep -n "$(pwd)" ~/.claude.json
```

---

## Mejores Prácticas de Seguridad

### ✅ DO (Hacer):

1. **Usar tokens de desarrollo** - Nunca uses tokens de producción
2. **Rotar tokens regularmente** - Cambia los tokens cada 3-6 meses
3. **Tokens con scope limitado** - Da solo los permisos necesarios
4. **Proyecto de desarrollo** - Usa un proyecto Supabase separado para desarrollo
5. **Hacer backup** - Siempre respalda `~/.claude.json` antes de editar

### ❌ DON'T (No hacer):

1. **No subir tokens a Git** - El archivo `~/.claude.json` NO debe estar en tu repositorio
2. **No compartir tokens** - Cada desarrollador debe tener su propio token
3. **No usar en producción** - MCP es solo para desarrollo/testing
4. **No dar acceso root** - Limita los permisos del token
5. **No editar directamente sin backup** - Siempre haz backup primero

---

## Notas Importantes

1. ⚠️ **Cada proyecto necesita su propia configuración** en `~/.claude.json`
2. 🔑 **Las credenciales son por proyecto** - Si trabajas con múltiples proyectos de Supabase, cada uno necesitará su propio token y Project ID
3. 💾 **Siempre haz backup** antes de editar `~/.claude.json`
4. ❌ **El archivo `.claude/mcp.json` del proyecto NO funciona** para configurar MCP servers - la configuración debe estar en `~/.claude.json`
5. 🔄 **Debes reiniciar VSCode completamente** después de editar la configuración

---

## Referencia de Variables de Entorno

| Variable | Descripción | Formato | Ejemplo |
|----------|-------------|---------|---------|
| `SUPABASE_ACCESS_TOKEN` | Personal Access Token de Supabase | `sbp_xxxxx` | `sbp_***REDACTED***` |
| `SUPABASE_PROJECT_ID` | ID del proyecto (en la URL) | Alfanumérico | `rvjockjrwalsnyajwzts` |

### ⚠️ Variables que NO debes usar:

- ❌ `SUPABASE_URL` - No funciona con MCP
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - No funciona con MCP
- ❌ `SUPABASE_ANON_KEY` - No funciona con MCP

---

## Recursos Adicionales

- [Documentación oficial de Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp)
- [Supabase MCP Server NPM](https://www.npmjs.com/package/@supabase/mcp-server-supabase)
- [Crear Personal Access Token](https://supabase.com/dashboard/account/tokens)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [Claude Code Documentation](https://code.claude.com/docs)
- [Supabase MCP Server GitHub](https://github.com/supabase-community/supabase-mcp)

---

## Resumen del Flujo de Configuración

```
1. Obtener Personal Access Token de Supabase
   ↓
2. Obtener Project ID de Supabase
   ↓
3. Hacer backup de ~/.claude.json
   ↓
4. Encontrar la ruta de tu proyecto (pwd)
   ↓
5. Editar ~/.claude.json y agregar configuración
   ↓
6. Guardar y cerrar VSCode completamente
   ↓
7. Reabrir VSCode
   ↓
8. Verificar con /mcp
   ↓
9. ✅ Si funciona → ¡Listo!
   ❌ Si falla → Revisar troubleshooting
```

---

**Fecha de creación:** 2026-05-03
**Última actualización:** 2026-05-03
**Versión del paquete MCP:** @supabase/mcp-server-supabase@latest (0.8.1)
**Claude Code:** Compatible con VS Code extension
**Tested on:** macOS (Darwin 21.6.0)

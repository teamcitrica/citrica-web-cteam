# Documentación de Base de Datos - Sistema CRM Citrica

## 📋 Índice
1. [Visión General del Sistema](#visión-general-del-sistema)
2. [Tablas Principales](#tablas-principales)
3. [Tablas de Relación (Junction Tables)](#tablas-de-relación-junction-tables)
4. [Flujo Completo del Sistema](#flujo-completo-del-sistema)
5. [Seguridad y RLS](#seguridad-y-rls)

---

## 🎯 Visión General del Sistema

Este sistema CRM gestiona la relación entre:
- **Empresas** (Clientes corporativos)
- **Proyectos** (Trabajos para las empresas)
- **Contactos** (Personas de contacto en las empresas)
- **Usuarios** (Miembros del equipo Citrica)
- **Roles** (Permisos y accesos de usuarios)
- **Credenciales** (Conexiones a bases de datos externas)

### Relaciones Clave:
- Una **empresa** puede tener múltiples **proyectos**
- Un **proyecto** pertenece a una **empresa**
- Un **proyecto** puede tener múltiples **contactos** (many-to-many)
- Un **proyecto** puede tener múltiples **usuarios** asignados (many-to-many)
- Un **contacto** pertenece a una **empresa**
- Un **usuario** tiene un **rol**
- Un **rol** puede tener **credenciales** de base de datos externa

---

## 📊 Tablas Principales

### 1. **company** (Empresas)
Almacena información de las empresas clientes.

```sql
CREATE TABLE company (
  id SERIAL PRIMARY KEY,
  name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único
- `name`: Nombre de la empresa
- `address`: Dirección física
- `phone`: Teléfono de contacto
- `email`: Email corporativo
- `created_at`: Fecha de creación

**RLS:** ✅ Activado con políticas

---

### 2. **projects** (Proyectos)
Almacena los proyectos asociados a empresas.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  company_id INTEGER REFERENCES company(id),
  supabase_url TEXT,
  supabase_anon_key TEXT,
  status TEXT,
  tabla TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único (UUID)
- `name`: Nombre del proyecto
- `company_id`: FK a la empresa (relación N:1)
- `supabase_url`: URL de Supabase del cliente (si aplica)
- `supabase_anon_key`: Clave anónima de Supabase del cliente
- `status`: Estado del proyecto (abierto/inactivo/cerrado)
- `tabla`: Nombre de la tabla en la BD externa del cliente
- `created_at`: Fecha de creación

**RLS:** ✅ Activado con políticas

---

### 3. **contact_clients** (Contactos)
Almacena personas de contacto de las empresas.

```sql
CREATE TABLE contact_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id INTEGER REFERENCES company(id),
  name TEXT,
  cargo TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único (UUID)
- `company_id`: FK a la empresa
- `name`: Nombre del contacto
- `cargo`: Puesto/cargo en la empresa
- `email`: Email del contacto
- `phone`: Teléfono (compatible con WhatsApp)
- `address`: Dirección
- `created_at`: Fecha de creación

**RLS:** ✅ Debe estar activado con políticas

---

### 4. **users** (Usuarios del Sistema)
Almacena los usuarios internos del equipo Citrica.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role_id INTEGER REFERENCES roles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único (sincronizado con auth.users)
- `email`: Email del usuario
- `first_name`: Nombre
- `last_name`: Apellido
- `role_id`: FK al rol del usuario
- `created_at`: Fecha de creación
- `updated_at`: Última actualización

**RLS:** ✅ Activado con políticas

---

### 5. **roles** (Roles de Usuario)
Define los roles y permisos en el sistema.

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Roles típicos:**
- `1`: Admin
- `2`: Gestor
- `3`: Operador
- `4`: Visualizador
- `5+`: Roles de clientes externos

**RLS:** ✅ Activado con políticas

---

### 6. **credentials** (Credenciales de BD Externas)
Almacena credenciales para conectar con bases de datos de clientes (para roles >= 5).

```sql
CREATE TABLE credentials (
  id SERIAL PRIMARY KEY,
  name TEXT,
  supabase_url TEXT NOT NULL,
  supabase_anon_key TEXT NOT NULL,
  table_name TEXT NOT NULL,
  role_id INTEGER REFERENCES roles(id) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único
- `name`: Nombre descriptivo
- `supabase_url`: URL de Supabase del cliente
- `supabase_anon_key`: Clave anónima
- `table_name`: Tabla a consultar
- `role_id`: FK al rol (relación 1:1)
- `created_at`: Fecha de creación

**Uso:** Permite que usuarios con roles específicos vean datos de bases externas.

**RLS:** ✅ Debe estar activado con políticas

---

## 🔗 Tablas de Relación (Junction Tables)

### 7. **project_contacts** (Relación Proyectos-Contactos)
Tabla intermedia many-to-many entre proyectos y contactos.

```sql
CREATE TABLE project_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contact_clients(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, contact_id)
);
```

**Propósito:** Permite asignar múltiples contactos a un proyecto.

**Ejemplo:** El proyecto "Desarrollo Web XYZ" tiene 3 contactos: Juan (CEO), María (CTO), Pedro (PM).

**RLS:** ⚠️ NECESITA ser activado con políticas

**Políticas sugeridas:**
```sql
-- Permitir lectura a usuarios autenticados
CREATE POLICY "Allow read project_contacts"
ON project_contacts FOR SELECT
TO authenticated
USING (true);

-- Permitir INSERT/UPDATE/DELETE a admins (role_id <= 2)
CREATE POLICY "Allow admin manage project_contacts"
ON project_contacts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role_id <= 2
  )
);
```

---

### 8. **user_projects** (Relación Usuarios-Proyectos)
Tabla intermedia many-to-many entre usuarios y proyectos.

```sql
CREATE TABLE user_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);
```

**Propósito:** Permite asignar múltiples usuarios del equipo a un proyecto.

**Ejemplo:** El proyecto "App Mobile ABC" tiene asignados a: Ana (desarrolladora), Carlos (diseñador), Luis (PM).

**RLS:** ⚠️ NECESITA ser activado con políticas

**Políticas sugeridas:**
```sql
-- Permitir lectura a usuarios autenticados
CREATE POLICY "Allow read user_projects"
ON user_projects FOR SELECT
TO authenticated
USING (true);

-- Permitir ver solo tus propios proyectos (para usuarios normales)
CREATE POLICY "Allow users see their projects"
ON user_projects FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Permitir INSERT/UPDATE/DELETE a admins (role_id <= 2)
CREATE POLICY "Allow admin manage user_projects"
ON user_projects FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role_id <= 2
  )
);
```

---

## 🔄 Flujo Completo del Sistema

### Escenario Completo: Gestión de un Proyecto

#### 1️⃣ **Creación de Empresa**
Un administrador crea una empresa cliente en el sistema:
- **Página:** `/admin/crm/empresas`
- **Acción:** Crear empresa "Tech Solutions S.A."
- **Tabla:** Inserta registro en `company`

#### 2️⃣ **Creación de Contactos**
Se agregan contactos de la empresa:
- **Página:** `/admin/crm/contactos`
- **Acción:** Crear contacto "Juan Pérez - CEO"
- **Tabla:** Inserta registro en `contact_clients` con `company_id = Tech Solutions`

Se pueden crear múltiples contactos para la misma empresa.

#### 3️⃣ **Creación de Proyecto**
Se crea un proyecto para la empresa:
- **Página:** `/admin/crm/proyectos`
- **Acción:** Crear proyecto "Desarrollo App Mobile"
- **Tabla:** Inserta registro en `projects` con `company_id = Tech Solutions`

En el mismo modal se puede:
- **Seleccionar contactos** de la empresa para el proyecto
  - **Tabla:** Inserta registros en `project_contacts` (muchos a muchos)
- **Asignar usuarios** del equipo al proyecto
  - **Tabla:** Inserta registros en `user_projects` (muchos a muchos)

#### 4️⃣ **Edición de Proyecto**
Al editar un proyecto existente:
- **Acción:** Modificar datos del proyecto y reasignar contactos/usuarios
- **Proceso:**
  1. Se cargan los contactos actuales desde `project_contacts`
  2. Se cargan los usuarios actuales desde `user_projects`
  3. Al guardar, se sincronizan las relaciones:
     - Se eliminan todas las relaciones antiguas
     - Se insertan las nuevas relaciones seleccionadas

### Flujo de Datos Simplificado

```
EMPRESA (company)
   ├─── PROYECTOS (projects)
   │       ├─── CONTACTOS asignados (project_contacts) ◄─── CONTACTOS (contact_clients)
   │       └─── USUARIOS asignados (user_projects) ◄─── USUARIOS (users)
   │
   └─── CONTACTOS (contact_clients)

USUARIOS (users) ───► ROL (roles) ───► CREDENCIALES (credentials)
                                              │
                                              └─── Acceso a BD Externa del Cliente
```

### Ejemplo Real:

**Empresa:** "Tech Solutions S.A."
- **Proyecto 1:** "App Mobile E-commerce"
  - **Contactos asignados:** Juan (CEO), María (CTO)
  - **Usuarios asignados:** Ana (Dev), Carlos (Designer)

- **Proyecto 2:** "Portal Web Corporativo"
  - **Contactos asignados:** Pedro (PM), María (CTO)
  - **Usuarios asignados:** Luis (Dev), Ana (Dev), Sofia (QA)

- **Contactos de la empresa:**
  - Juan Pérez - CEO
  - María González - CTO
  - Pedro Ramírez - Project Manager

---

## 🔒 Seguridad y RLS

### Tablas con RLS Activado ✅

Estas tablas YA tienen RLS y políticas activas:
- ✅ `company`
- ✅ `projects`
- ✅ `users`
- ✅ `roles`
- ✅ `contact_clients` (debe tener)

### Tablas que NECESITAN RLS ⚠️

Estas tablas de relación DEBEN tener RLS activado:
- ⚠️ `project_contacts`
- ⚠️ `user_projects`

### Activar RLS en Tablas de Relación

```sql
-- Activar RLS en project_contacts
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;

-- Activar RLS en user_projects
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
```

### Políticas Recomendadas

#### Para `project_contacts`:
```sql
-- Lectura para todos los autenticados
CREATE POLICY "Allow authenticated read project_contacts"
ON project_contacts FOR SELECT
TO authenticated
USING (true);

-- Escritura solo para admins (role_id <= 2)
CREATE POLICY "Allow admin write project_contacts"
ON project_contacts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role_id <= 2
  )
);
```

#### Para `user_projects`:
```sql
-- Lectura para todos los autenticados
CREATE POLICY "Allow authenticated read user_projects"
ON user_projects FOR SELECT
TO authenticated
USING (true);

-- Escritura solo para admins (role_id <= 2)
CREATE POLICY "Allow admin write user_projects"
ON user_projects FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role_id <= 2
  )
);

-- Opcional: Permitir a usuarios ver solo sus propios proyectos
CREATE POLICY "Allow users see own projects"
ON user_projects FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

---

## 📁 Estructura de Hooks

### Hooks Principales:
- `hooks/companies/use-companies.tsx` → CRUD de empresas
- `hooks/projects/use-projects.tsx` → CRUD de proyectos
- `hooks/contacts/use-contacts.tsx` → CRUD de contactos
- `hooks/users/use-users.tsx` → CRUD de usuarios
- `hooks/role/use-role-data.tsx` → Datos por rol y credenciales
- `hooks/use-credentials.tsx` → CRUD de credenciales

### Hooks de Relaciones:
- `hooks/project-contacts/use-project-contacts.tsx` → Gestión de contactos por proyecto
- `hooks/user-projects/use-user-projects.tsx` → Gestión de usuarios por proyecto

---

## 🎯 Funciones Clave

### `syncProjectContacts(projectId, contactIds[])`
Sincroniza los contactos de un proyecto:
1. Elimina todas las relaciones existentes
2. Inserta las nuevas relaciones seleccionadas
3. Se usa al crear/editar un proyecto

### `syncProjectUsers(projectId, userIds[])`
Sincroniza los usuarios asignados a un proyecto:
1. Elimina todas las asignaciones existentes
2. Inserta las nuevas asignaciones seleccionadas
3. Se usa al crear/editar un proyecto

### `getProjectContacts(projectId)`
Obtiene todos los contactos asociados a un proyecto.

### `getProjectUsers(projectId)`
Obtiene todos los usuarios asignados a un proyecto.

---

## 📝 Notas Importantes

1. **IDs de Proyectos y Contactos:** Usan UUID (generado automáticamente)
2. **IDs de Empresas:** Usan SERIAL (autoincremental)
3. **IDs de Usuarios:** Sincronizados con `auth.users` de Supabase
4. **Cascadas:** Las relaciones en tablas junction tienen `ON DELETE CASCADE`
5. **Unicidad:** Las tablas junction tienen constraints `UNIQUE` para evitar duplicados
6. **Roles >= 5:** Son roles de clientes externos con acceso a BD externas vía credentials

---

## 🔧 Mantenimiento

### Para agregar un nuevo proyecto:
1. Seleccionar empresa existente
2. Completar datos del proyecto (nombre, estado, credenciales si aplica)
3. Seleccionar contactos de la empresa
4. Asignar usuarios del equipo
5. Al guardar, se crean automáticamente todas las relaciones

### Para modificar asignaciones:
1. Editar proyecto
2. Cambiar selección de contactos/usuarios
3. Al guardar, `syncProjectContacts` y `syncProjectUsers` actualizan las relaciones

---

**Última actualización:** 2025-01-18
**Versión:** 1.0

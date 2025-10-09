-- ============================================
-- SCRIPT PARA ARREGLAR POLÍTICAS RLS
-- Tabla: users y roles
-- ============================================

-- ==========================================
-- PASO 1: LIMPIAR POLÍTICAS EXISTENTES
-- ==========================================

-- Eliminar todas las políticas de la tabla users
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
END $$;

-- Eliminar todas las políticas de la tabla roles
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'roles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON roles';
    END LOOP;
END $$;

-- ==========================================
-- PASO 2: HABILITAR RLS EN LAS TABLAS
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PASO 3: POLÍTICAS PARA LA TABLA ROLES
-- ==========================================

-- Permitir que todos los usuarios autenticados lean los roles
CREATE POLICY "roles_select_policy" ON roles
FOR SELECT
TO authenticated
USING (true);

-- Solo admins pueden insertar roles
CREATE POLICY "roles_insert_policy" ON roles
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role_id')::int = 1
);

-- Solo admins pueden actualizar roles
CREATE POLICY "roles_update_policy" ON roles
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role_id')::int = 1
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role_id')::int = 1
);

-- Solo admins pueden eliminar roles
CREATE POLICY "roles_delete_policy" ON roles
FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role_id')::int = 1
);

-- ==========================================
-- PASO 4: POLÍTICAS PARA LA TABLA USERS
-- ==========================================

-- Permitir SELECT a todos los usuarios autenticados
-- (SIN RECURSIÓN - no consulta la tabla users)
CREATE POLICY "users_select_policy" ON users
FOR SELECT
TO authenticated
USING (true);

-- Permitir INSERT solo a admins (role_id = 1)
-- Usa el JWT directamente, no consulta la tabla users
CREATE POLICY "users_insert_policy" ON users
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role_id')::int = 1
);

-- Permitir UPDATE a:
-- - Admins (role_id = 1)
-- - El propio usuario (auth.uid() = id)
CREATE POLICY "users_update_policy" ON users
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role_id')::int = 1
  OR auth.uid() = id
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role_id')::int = 1
  OR auth.uid() = id
);

-- Permitir DELETE solo a admins
CREATE POLICY "users_delete_policy" ON users
FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role_id')::int = 1
);

-- ==========================================
-- PASO 5: VERIFICACIÓN
-- ==========================================

-- Ver todas las políticas creadas para users
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public';

-- Ver todas las políticas creadas para roles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'roles' AND schemaname = 'public';

-- ==========================================
-- NOTAS IMPORTANTES:
-- ==========================================
--
-- 1. Este script elimina TODAS las políticas existentes en users y roles
-- 2. Las nuevas políticas NO causan recursión infinita
-- 3. Los permisos son:
--    - Admins (role_id = 1): Acceso total
--    - Usuarios normales: Pueden ver todos los usuarios y roles, pero solo editar su propio perfil
-- 4. Si necesitas permisos más restrictivos, modifica las políticas según tu necesidad
--
-- ==========================================

-- Agregar columna de estado a la tabla contact
-- Este script debe ejecutarse en el SQL Editor de Supabase

-- Agregar la columna status con un valor por defecto de 'pendiente'
ALTER TABLE contact
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'cancelada'));

-- Actualizar los registros existentes que no tengan estado a 'pendiente'
UPDATE contact
SET status = 'pendiente'
WHERE status IS NULL;

-- Crear un índice para mejorar el rendimiento de las consultas por estado
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact(status);

-- Comentario de la columna para documentación
COMMENT ON COLUMN contact.status IS 'Estado de la reserva: pendiente, confirmada o cancelada';

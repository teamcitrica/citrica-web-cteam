-- Crear tabla qr_visits para rastrear visitas de QR codes
CREATE TABLE IF NOT EXISTS public.qr_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  utm_source VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_qr_visits_name ON public.qr_visits(name);
CREATE INDEX IF NOT EXISTS idx_qr_visits_utm_source ON public.qr_visits(utm_source);
CREATE INDEX IF NOT EXISTS idx_qr_visits_created_at ON public.qr_visits(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.qr_visits ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT sin autenticación (para el tracking público)
CREATE POLICY "Permitir INSERT público en qr_visits"
  ON public.qr_visits
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para SELECT (solo usuarios autenticados pueden leer)
CREATE POLICY "Permitir SELECT autenticado en qr_visits"
  ON public.qr_visits
  FOR SELECT
  TO authenticated
  USING (true);

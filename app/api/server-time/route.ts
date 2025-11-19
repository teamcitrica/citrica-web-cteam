import { NextResponse } from 'next/server'

// Configuración de runtime para Vercel Edge
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  // Zona horaria del negocio
  const TIMEZONE = 'America/Lima'

  const now = new Date()

  // Convertir a zona horaria de Lima usando Intl.DateTimeFormat (más robusto)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  const parts = formatter.formatToParts(now)
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0'

  const year = parseInt(getValue('year'))
  const month = parseInt(getValue('month'))
  const day = parseInt(getValue('day'))
  const hours = parseInt(getValue('hour'))
  const minutes = parseInt(getValue('minute'))
  const seconds = parseInt(getValue('second'))

  const response = NextResponse.json({
    date: now.toISOString(),
    timestamp: now.getTime(),
    timezone: TIMEZONE,
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    // Formato de hora para comparación fácil (HH:MM)
    currentTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  })

  // Headers para prevenir cacheo en producción
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}

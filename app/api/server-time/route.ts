import { NextResponse } from 'next/server'

export async function GET() {
  // Zona horaria del negocio
  const TIMEZONE = 'America/Lima'

  const now = new Date()

  // Convertir a zona horaria de Lima
  const limaDateString = now.toLocaleString('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  // Parsear la fecha en formato: MM/DD/YYYY, HH:MM:SS
  const [datePart, timePart] = limaDateString.split(', ')
  const [month, day, year] = datePart.split('/').map(Number)
  const [hours, minutes, seconds] = timePart.split(':').map(Number)

  return NextResponse.json({
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
}

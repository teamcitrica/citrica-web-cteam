'use client'

import { useState, useEffect, useMemo } from 'react'
import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date'

const BUSINESS_TIMEZONE = 'America/Lima'

interface ServerTimeResponse {
  date: string
  timestamp: number
  timezone: string
  year: number
  month: number
  day: number
  hours: number
  minutes: number
  seconds: number
  currentTime: string // Formato HH:MM
}

/**
 * Calcula el offset UTC de una zona horaria para una fecha específica.
 * Retorna minutos tal que: hora_local = hora_UTC + offset
 * Ej: Lima (UTC-5) retorna -300
 */
function getTimezoneOffsetMinutes(tz: string, year: number, month: number, day: number): number {
  // Usar mediodía UTC como referencia para evitar problemas en límites de DST
  const refUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).formatToParts(refUtc)

  const get = (type: string) => {
    const val = parseInt(parts.find(p => p.type === type)?.value || '0')
    // hour12:false puede devolver 24 para medianoche en algunos navegadores
    return type === 'hour' && val === 24 ? 0 : val
  }

  // Reconstruir el timestamp UTC que representa la hora local mostrada
  const localAsUtc = Date.UTC(
    get('year'), get('month') - 1, get('day'),
    get('hour'), get('minute'), get('second')
  )

  // offset = horaLocal - horaUTC (en minutos)
  return Math.round((localAsUtc - refUtc.getTime()) / 60000)
}

/**
 * Obtiene la zona horaria del usuario y un nombre legible para mostrar
 */
function getUserTimezoneInfo() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Obtener el offset actual en formato GMT±X
  const now = new Date()
  const offsetMinutes = now.getTimezoneOffset()
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60))
  const offsetMins = Math.abs(offsetMinutes % 60)
  const sign = offsetMinutes <= 0 ? '+' : '-'
  const gmtLabel = `GMT${sign}${offsetHours}${offsetMins > 0 ? `:${String(offsetMins).padStart(2, '0')}` : ''}`

  // Extraer ciudad del timezone (ej: "America/Lima" → "Lima", "Europe/Madrid" → "Madrid")
  const city = tz.split('/').pop()?.replace(/_/g, ' ') || tz

  // Comparar offset real con Lima (no por nombre de timezone)
  // Esto maneja correctamente America/Bogota, America/Guayaquil, etc. que comparten UTC-5
  const userOffset = getTimezoneOffsetMinutes(tz, now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate())
  const limaOffset = getTimezoneOffsetMinutes(BUSINESS_TIMEZONE, now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate())
  const sameOffsetAsLima = userOffset === limaOffset

  return { timezone: tz, city, gmtLabel, label: `${city} (${gmtLabel})`, sameOffsetAsLima }
}

/**
 * Convierte un horario de Lima (AM/PM) a la zona horaria del usuario.
 *
 * Flujo:
 *   1. Parsear "11:00 AM" → 11:00 en formato 24h
 *   2. Calcular offset de Lima para esa fecha → -300 min (UTC-5)
 *   3. Convertir a UTC: 11:00 - (-300) = 16:00 UTC
 *   4. Calcular offset del usuario para esa fecha → ej: -180 min (UTC-3, Uruguay)
 *   5. Convertir a hora local: 16:00 + (-180) = 13:00 → 1:00 PM
 *
 * Ejemplo: "11:00 AM - 12:00 PM" Lima → "1:00 PM - 2:00 PM" Uruguay
 */
export function convertSlotToUserTimezone(slot: string, dateStr: string, userTimezone: string): string {
  const parts = slot.split(' - ')
  if (parts.length !== 2) return slot

  const [year, month, day] = dateStr.split('-').map(Number)

  // Calcular offsets para esta fecha específica
  const limaOffsetMin = getTimezoneOffsetMinutes(BUSINESS_TIMEZONE, year, month, day)
  const userOffsetMin = getTimezoneOffsetMinutes(userTimezone, year, month, day)

  // Si tienen el mismo offset, no hay nada que convertir
  if (limaOffsetMin === userOffsetMin) return slot

  const convertTime = (timeStr: string): string => {
    // Parsear formato 24h: "10:00" o "13:00"
    const match = timeStr.trim().match(/(\d{1,2}):(\d{2})/)
    if (!match) return timeStr

    const hours = parseInt(match[1])
    const minutes = parseInt(match[2])

    // Paso 1: hora de Lima en minutos totales
    const limaMinutes = hours * 60 + minutes

    // Paso 2: convertir Lima → UTC (UTC = local - offset)
    const utcMinutes = limaMinutes - limaOffsetMin

    // Paso 3: convertir UTC → hora del usuario (local = UTC + offset)
    const userMinutes = utcMinutes + userOffsetMin

    // Normalizar a rango 0-1439 (por si cruza medianoche)
    const normalized = ((userMinutes % 1440) + 1440) % 1440

    const userHours = Math.floor(normalized / 60)
    const userMins = normalized % 60

    // Formatear como hora militar 24h
    return `${String(userHours).padStart(2, '0')}:${String(userMins).padStart(2, '0')}`
  }

  const startConverted = convertTime(parts[0])
  const endConverted = convertTime(parts[1])

  return `${startConverted} - ${endConverted}`
}

export const useServerTime = () => {
  const [serverToday, setServerToday] = useState<CalendarDate | null>(null)
  const [serverCurrentTime, setServerCurrentTime] = useState<string | null>(null)
  const [serverHours, setServerHours] = useState<number | null>(null)
  const [serverMinutes, setServerMinutes] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Detectar zona horaria del usuario (solo se calcula una vez)
  const userTimezoneInfo = useMemo(() => getUserTimezoneInfo(), [])

  useEffect(() => {
    const fetchServerTime = async (retryCount = 0) => {
      try {
        console.log(`[useServerTime] Fetching server time (attempt ${retryCount + 1})...`)
        console.log(`[useServerTime] User timezone: ${userTimezoneInfo.timezone} (${userTimezoneInfo.gmtLabel})`)
        const response = await fetch('/api/server-time', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })

        if (!response.ok) {
          throw new Error(`Server time API returned ${response.status}`)
        }

        const data: ServerTimeResponse = await response.json()
        console.log('[useServerTime] Server time received:', {
          date: data.date,
          timezone: data.timezone,
          year: data.year,
          month: data.month,
          day: data.day,
          currentTime: data.currentTime
        })

        // Crear un CalendarDate con la fecha del servidor
        const serverDate = new CalendarDate(data.year, data.month, data.day)
        setServerToday(serverDate)
        setServerCurrentTime(data.currentTime)
        setServerHours(data.hours)
        setServerMinutes(data.minutes)
        setIsLoading(false)
        console.log('[useServerTime] Server time set successfully')
      } catch (err) {
        console.error('[useServerTime] Error fetching server time:', err)

        // Reintentar hasta 2 veces antes de hacer fallback
        if (retryCount < 2) {
          console.log(`[useServerTime] Retrying... (${retryCount + 1}/2)`)
          setTimeout(() => fetchServerTime(retryCount + 1), 1000)
          return
        }

        console.warn('[useServerTime] Max retries reached, falling back to client time')
        console.warn('[useServerTime] WARNING: Using client timezone may cause inconsistencies!')
        setError(err as Error)

        // Fallback a la fecha y hora del cliente si hay error
        setServerToday(today(getLocalTimeZone()))
        const now = new Date()
        setServerCurrentTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
        setServerHours(now.getHours())
        setServerMinutes(now.getMinutes())
        setIsLoading(false)
      }
    }

    fetchServerTime()
  }, [userTimezoneInfo])

  return {
    serverToday,
    serverCurrentTime,
    serverHours,
    serverMinutes,
    isLoading,
    error,
    userTimezone: userTimezoneInfo.timezone,
    userTimezoneLabel: userTimezoneInfo.label,
    isUserInBusinessTz: userTimezoneInfo.sameOffsetAsLima,
  }
}

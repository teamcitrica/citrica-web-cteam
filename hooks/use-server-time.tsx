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

  return { timezone: tz, city, gmtLabel, label: `${city} (${gmtLabel})` }
}

/**
 * Convierte un horario de Lima (AM/PM) a la zona horaria del usuario
 * Ej: "10:00 AM - 10:30 AM" en Lima → "16:00 - 16:30" en Madrid
 */
export function convertSlotToUserTimezone(slot: string, dateStr: string, userTimezone: string): string {
  // Si el usuario está en Lima, no convertir
  if (userTimezone === BUSINESS_TIMEZONE) return slot

  const parts = slot.split(' - ')
  if (parts.length !== 2) return slot

  const convertTime = (timeStr: string): string => {
    const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return timeStr

    let hours = parseInt(match[1])
    const minutes = parseInt(match[2])
    const period = match[3].toUpperCase()

    // Convertir a 24h
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0

    // Crear una fecha en Lima con ese horario
    const [year, month, day] = dateStr.split('-').map(Number)
    const limaDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`

    // Usar Intl para obtener el offset de Lima en esa fecha
    const limaFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: BUSINESS_TIMEZONE,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    })

    const userFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      hour: '2-digit', minute: '2-digit',
      hour12: false
    })

    // Crear fecha UTC ajustada desde Lima
    // Primero obtener el offset de Lima para esta fecha
    const tempDate = new Date(limaDateStr + 'Z') // tratarlo como UTC temporalmente
    const limaTime = limaFormatter.format(tempDate)
    const limaParts = limaTime.match(/(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/)
    if (!limaParts) return timeStr

    // El offset de Lima es la diferencia entre la hora UTC y la hora que Lima muestra
    // Creamos la fecha real en UTC: si en Lima son las 10:00 y Lima es UTC-5, en UTC son las 15:00
    const limaOffsetMs = tempDate.getTime() - new Date(
      parseInt(limaParts[3]), parseInt(limaParts[1]) - 1, parseInt(limaParts[2]),
      parseInt(limaParts[4]), parseInt(limaParts[5]), parseInt(limaParts[6])
    ).getTime()

    // Fecha UTC real del slot
    const utcDate = new Date(tempDate.getTime() + limaOffsetMs)

    // Formatear en la zona del usuario
    const userTime = userFormatter.format(utcDate)
    return userTime.replace(/^24:/, '00:')
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
    isUserInBusinessTz: userTimezoneInfo.timezone === BUSINESS_TIMEZONE,
  }
}

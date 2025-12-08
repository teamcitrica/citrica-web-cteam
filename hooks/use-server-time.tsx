'use client'

import { useState, useEffect } from 'react'
import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date'

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

export const useServerTime = () => {
  const [serverToday, setServerToday] = useState<CalendarDate | null>(null)
  const [serverCurrentTime, setServerCurrentTime] = useState<string | null>(null)
  const [serverHours, setServerHours] = useState<number | null>(null)
  const [serverMinutes, setServerMinutes] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchServerTime = async (retryCount = 0) => {
      try {
        console.log(`[useServerTime] Fetching server time (attempt ${retryCount + 1})...`)
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
  }, [])

  return {
    serverToday,
    serverCurrentTime,
    serverHours,
    serverMinutes,
    isLoading,
    error
  }
}

'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/shared/context/supabase-context'
import { useBookingsAvailability } from '@/hooks/disponibilidad/use-bookings-availability'
import { useServerTime } from '@/hooks/use-server-time'

interface ContactFormData {
  name: string
  email: string
  message: string
  date?: any
  timeSlot?: string
  phone: string
  phoneCode: string
}

export const useContact = () => {
  const { supabase } = useSupabase()
  const {
    bookings,
    getOccupiedSlots,
    getAvailableSlots,
    isDateFullyBooked,
    studioConfig,
    convertUserFormatToSlots
  } = useBookingsAvailability()

  // Obtener la fecha y hora del servidor
  const { serverToday, serverCurrentTime, serverHours, serverMinutes, isLoading: isLoadingServerTime } = useServerTime()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
    date: null,
    timeSlot: '',
    phone: '',
    phoneCode: '+51'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]) // Para selección múltiple
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(new Set()) // Cache de fechas completamente reservadas
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(true) // Estado de carga de fechas bloqueadas

  // Precargar fechas bloqueadas/reservadas (optimizado)
  useEffect(() => {
    const preloadBlockedDates = async () => {
      if (!serverToday || !bookings) return

      setIsLoadingBookedDates(true)
      const blockedDates = new Set<string>()

      // Identificar fechas con bloqueos de día completo (time_slots incluye '00:00')
      bookings.forEach(booking => {
        if (booking.time_slots && booking.time_slots.includes('00:00')) {
          blockedDates.add(booking.booking_date)
        }
      })

      // Para fechas futuras en los próximos 3 meses, verificar si están completamente reservadas
      const startDate = new Date(serverToday.year, serverToday.month - 1, serverToday.day)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 3)

      const dateChecks = []
      const currentDate = new Date(startDate)

      while (currentDate <= endDate) {
        const year = currentDate.getFullYear()
        const month = String(currentDate.getMonth() + 1).padStart(2, '0')
        const day = String(currentDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`

        // Solo verificar fechas que no tienen bloqueo de día completo
        if (!blockedDates.has(dateStr)) {
          dateChecks.push(
            isDateFullyBooked(dateStr).then(isBlocked => ({ dateStr, isBlocked }))
          )
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Ejecutar todas las verificaciones en paralelo
      const results = await Promise.all(dateChecks)
      results.forEach(({ dateStr, isBlocked }) => {
        if (isBlocked) {
          blockedDates.add(dateStr)
        }
      })

      setFullyBookedDates(blockedDates)
      setIsLoadingBookedDates(false)
    }

    preloadBlockedDates()
  }, [serverToday, bookings, isDateFullyBooked])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const updateField = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDateChange = async (date: any) => {
    setFormData(prev => ({
      ...prev,
      date,
      timeSlot: '' // Limpiar el slot seleccionado al cambiar la fecha
    }))
    setSelectedTimeSlots([]) // Limpiar selección múltiple

    // Cargar los horarios disponibles para esta fecha
    if (date) {
      try {
        // Convertir CalendarDate a string YYYY-MM-DD
        let dateStr: string
        if (date.year && date.month && date.day) {
          // Es un objeto CalendarDate de @internationalized/date
          const year = date.year
          const month = String(date.month).padStart(2, '0')
          const day = String(date.day).padStart(2, '0')
          dateStr = `${year}-${month}-${day}`
        } else {
          // Fallback
          dateStr = date.toString()
        }

        let slots = await getAvailableSlots(dateStr)

        // Filtrar horarios pasados si la fecha seleccionada es HOY
        if (serverToday && serverHours !== null) {
          // Comparar si la fecha seleccionada es hoy
          const isToday = date.year === serverToday.year &&
                         date.month === serverToday.month &&
                         date.day === serverToday.day

          if (isToday) {
            // Filtrar horarios que ya pasaron
            slots = slots.filter(slot => {
              // Extraer la hora de inicio del slot (formato: "10:00 AM - 11:00 AM")
              const match = slot.match(/(\d+):(\d+)\s+(AM|PM)/)
              if (!match) return true

              const hours = parseInt(match[1])
              const minutes = parseInt(match[2])
              const period = match[3]

              // Convertir a formato 24 horas
              let hour24 = hours
              if (period === 'PM' && hours !== 12) {
                hour24 = hours + 12
              } else if (period === 'AM' && hours === 12) {
                hour24 = 0
              }

              // Comparar con la hora actual del servidor
              if (hour24 > serverHours) return true
              if (hour24 === serverHours && minutes > serverMinutes!) return true
              return false
            })
          }
        }

        setAvailableTimeSlots(slots)

        // Actualizar cache de fechas completamente reservadas
        const isFullyBooked = await isDateFullyBooked(dateStr)
        setFullyBookedDates(prev => {
          const newSet = new Set(prev)
          if (isFullyBooked) {
            newSet.add(dateStr)
          } else {
            newSet.delete(dateStr)
          }
          return newSet
        })
      } catch (error) {
        console.error('Error loading available slots:', error)
        setAvailableTimeSlots([])
      }
    }
  }

  // Función síncrona para el calendario (usa el cache)
  const isDateFullyBookedSync = (dateString: string): boolean => {
    return fullyBookedDates.has(dateString)
  }

  const handleTimeSlotChange = (timeSlot: string) => {
    if (studioConfig.allow_multiple_time_slots) {
      // Modo selección múltiple
      setSelectedTimeSlots(prev => {
        if (prev.includes(timeSlot)) {
          return prev.filter(slot => slot !== timeSlot)
        } else {
          return [...prev, timeSlot]
        }
      })
    } else {
      // Modo selección única
      setFormData(prev => ({
        ...prev,
        timeSlot
      }))
    }
  }

  const nextStep = () => {
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')

    try {
      // Convertir la fecha a formato YYYY-MM-DD (sin conversión de zona horaria)
      let dateStr: string | null = null
      if (formData.date) {
        // El calendario devuelve un objeto CalendarDate con propiedades year, month, day
        if (formData.date.year && formData.date.month && formData.date.day) {
          // Es un objeto CalendarDate de @internationalized/date
          const year = formData.date.year
          const month = String(formData.date.month).padStart(2, '0')
          const day = String(formData.date.day).padStart(2, '0')
          dateStr = `${year}-${month}-${day}`
        } else {
          // Fallback por si es otro tipo de fecha
          const date = new Date(formData.date.toString())
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          dateStr = `${year}-${month}-${day}`
        }
      }

      // Determinar qué slots enviar según el modo de selección
      let slotsToSend: string[] = []

      if (studioConfig.allow_multiple_time_slots && selectedTimeSlots.length > 0) {
        // Convertir cada slot de formato usuario a slots internos de 30 min
        slotsToSend = selectedTimeSlots.flatMap(slot => convertUserFormatToSlots(slot))
      } else if (formData.timeSlot) {
        // Convertir el slot único seleccionado
        slotsToSend = convertUserFormatToSlots(formData.timeSlot)
      }

      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            booking_date: dateStr,
            time_slots: slotsToSend,
            type_id: 1, // type_id 1 = reserva de cliente
            status: 'confirmed',
            name: formData.name,
            email: formData.email,
            message: formData.message,
            phone_code: formData.phoneCode,
            phone: formData.phone
          }
        ])

      if (error) throw error

      setStatus('success')
      setFormData({ name: '', email: '', message: '', date: null, timeSlot: '', phone: '', phoneCode: '+51' })
      setSelectedTimeSlots([])
      setAvailableTimeSlots([])
      setCurrentStep(1)

      // Resetear el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      setStatus('error')

      // Resetear el mensaje de error después de 3 segundos
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', message: '', date: null, timeSlot: '', phone: '', phoneCode: '+51' })
    setSelectedTimeSlots([])
    setAvailableTimeSlots([])
    setStatus('idle')
    setCurrentStep(1)
  }

  return {
    formData,
    isLoading,
    status,
    currentStep,
    handleChange,
    updateField,
    handleDateChange,
    handleTimeSlotChange,
    handleSubmit,
    resetForm,
    nextStep,
    prevStep,
    // Funciones de disponibilidad
    getOccupiedSlots,
    getAvailableSlots,
    isDateFullyBooked,
    isDateFullyBookedSync, // Versión síncrona para el calendario
    // Nuevos estados y configuración
    availableTimeSlots,
    selectedTimeSlots,
    studioConfig,
    // Fecha del servidor
    serverToday,
    isLoadingServerTime,
    isLoadingBookedDates
  }
}

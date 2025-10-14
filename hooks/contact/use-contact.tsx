'use client'

import { useState } from 'react'
import { useSupabase } from '@/shared/context/supabase-context'
import { useBookingsAvailability } from '@/hooks/disponibilidad/use-bookings-availability'

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
    getOccupiedSlots,
    getAvailableSlots,
    isDateFullyBooked,
    studioConfig,
    convertUserFormatToSlots
  } = useBookingsAvailability()

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

        const slots = await getAvailableSlots(dateStr)
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
    studioConfig
  }
}

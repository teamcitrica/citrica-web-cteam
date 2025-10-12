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
}

export const useContact = () => {
  const { supabase } = useSupabase()
  const {
    getOccupiedSlots,
    getAvailableSlots,
    isDateFullyBooked,
    allTimeSlots
  } = useBookingsAvailability()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
    date: null,
    timeSlot: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleDateChange = (date: any) => {
    setFormData(prev => ({
      ...prev,
      date
    }))
  }

  const handleTimeSlotChange = (timeSlot: string) => {
    setFormData(prev => ({
      ...prev,
      timeSlot
    }))
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
      // Convertir la fecha a formato YYYY-MM-DD
      const dateStr = formData.date
        ? new Date(formData.date.toString()).toISOString().split('T')[0]
        : null

      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            booking_date: dateStr,
            time_slots: formData.timeSlot ? [formData.timeSlot] : [],
            type_id: 1, // type_id 1 = reserva de cliente
            status: 'confirmed',
            name: formData.name,
            email: formData.email,
            message: formData.message
          }
        ])

      if (error) throw error

      setStatus('success')
      setFormData({ name: '', email: '', message: '', date: null, timeSlot: '' })
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
    setFormData({ name: '', email: '', message: '', date: null, timeSlot: '' })
    setStatus('idle')
    setCurrentStep(1)
  }

  return {
    formData,
    isLoading,
    status,
    currentStep,
    handleChange,
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
    allTimeSlots
  }
}

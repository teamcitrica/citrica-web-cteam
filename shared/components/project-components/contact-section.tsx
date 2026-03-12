"use client";
import React from 'react'
import {  Input, Textarea } from '../citrica-ui'
import { Button, Text, Icon, Col, Container } from 'citrica-ui-toolkit'
import { useContact } from '@/hooks/leads/use-leads'
import { convertSlotToUserTimezone } from '@/hooks/use-server-time'
import { Spinner } from '@heroui/spinner'
import AnimatedContent from './animated-content'
import CalendarComponent from './calendar'
import { ctaSectionVariants } from '@/shared/archivos js/cta-section-data'

// Tipos para las variantes disponibles
export type ContactVariant = keyof typeof ctaSectionVariants;

interface ContactSectionProps {
  variant?: ContactVariant;
  layout?: 'default' | 'landing';
  customContent?: {
    title?: string;
    subtitle?: string;
    description?: string;
  };
}

export const ContactSectionLanding = ({
  variant = 'home',
  layout = 'default',
  customContent
}: ContactSectionProps) => {
  const {
    formData,
    isLoading,
    status,
    currentStep,
    handleChange,
    updateField,
    handleDateChange,
    handleTimeSlotChange,
    handleSubmit,
    nextStep,
    prevStep,
    getOccupiedSlots,
    isDateFullyBookedSync,
    availableTimeSlots,
    selectedTimeSlots,
    isLoadingSlots,
    studioConfig,
    serverToday,
    isLoadingServerTime,
    userTimezone,
    userTimezoneLabel,
    isUserInBusinessTz,
  } = useContact()

  // Obtener dateStr para conversión de zona horaria
  const currentDateStr = formData.date
    ? `${formData.date.year}-${String(formData.date.month).padStart(2, '0')}-${String(formData.date.day).padStart(2, '0')}`
    : ''

  // Obtener el contenido según la variante seleccionada
  const content = {
    ...ctaSectionVariants[variant],
    ...customContent 
  };

  
  const timeSlots = availableTimeSlots


  const occupiedSlots = (() => {
    if (!formData.date) return []


    let dateStr: string
    if (formData.date.year && formData.date.month && formData.date.day) {

      const year = formData.date.year
      const month = String(formData.date.month).padStart(2, '0')
      const day = String(formData.date.day).padStart(2, '0')
      dateStr = `${year}-${month}-${day}`
    } else {

      dateStr = formData.date.toString()
    }

    return getOccupiedSlots(dateStr)
  })()

  // Landing layout (dark, centered, calendar+time together)
  if (layout === 'landing') {
    return (
      <section id="contact" className="py-20 gradient-project-hero">
        <Container>
          {/* Header centrado */}
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-10">
            <h2>
              <Text variant="subtitle" color="#FF5B00" weight="bold">
                {content.title}
              </Text>
            </h2>
            <h3 className="mt-2">
              <Text variant="title" color="#FFFFFF" weight="bold">
                {content.subtitle}
              </Text>
            </h3>
            <Col cols={{ lgPush: 2, lg: 8, md: 6, sm: 4 }} className="mx-auto mt-4">
              <p className="my-4">
                <Text variant="body" color="#FFFFFF" weight="bold">
                  Hablemos con Transparencia. Agenda tu Asesoría.
                </Text>
              </p>
              <p>
                <Text variant="body" color="#FFFFFF" className="opacity-80">
                  Nuestro compromiso es ser amistosos, claros y transparentes. Antes de cualquier inversión, te ofrecemos una asesoría sin compromiso. Queremos entender a fondo su desafío digital para asegurarnos de que la solución que le entregamos sea exactamente lo que necesita.
                </Text>
              </p>
            </Col>
          </Col>

          {/* Card del calendario */}
          <Col cols={{ lgPush: 2, lg: 8, md: 6, sm: 4 }} className="mx-auto">
            <div className="bg-[#16141F]/80 backdrop-blur-sm border-2 border-[#007F7F]/60 rounded-2xl p-6 max-w-[584px] mx-auto">
              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                {/* Mensaje de éxito */}
                {status === "success" && (
                  <AnimatedContent key="success" direction="vertical" distance={20}>
                    <div className="flex flex-col items-center justify-center gap-6 w-full py-12">
                      <div className="w-20 h-20 bg-[#FF5B00] rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <Text variant="headline" weight="bold" color="#FFFFFF">
                        ¡Enviado con éxito!
                      </Text>
                    </div>
                  </AnimatedContent>
                )}

                {/* Mensaje de error */}
                {status === "error" && (
                  <AnimatedContent key="error" direction="vertical" distance={20}>
                    <div className="flex flex-col items-center justify-center gap-6 w-full py-12">
                      <div className="w-20 h-20 bg-red-900/50 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <Text variant="headline" weight="bold" color="#FF4444">
                        Error al enviar el mensaje
                      </Text>
                      <Text variant="body" color="#FFFFFF" className="opacity-80">
                        Por favor, inténtalo de nuevo.
                      </Text>
                    </div>
                  </AnimatedContent>
                )}

                {/* Paso 1: Calendario + Horarios juntos */}
                {currentStep === 1 && status === 'idle' && (
                  <AnimatedContent key="step1-landing" direction="horizontal" distance={50}>
                    <div className="flex flex-col items-center gap-6 w-full">
                      <Text variant="subtitle" color="#FFFFFF" weight="bold">
                        Selecciona Día y Hora para la Reunión
                      </Text>

                      <div className="flex flex-col md:flex-row gap-6 w-full">
                        {/* Calendario */}
                        <div className="flex-1 flex justify-center calendar-dark-wrapper">
                          <CalendarComponent
                            value={formData.date}
                            onChange={handleDateChange}
                            variant="dark"
                            isDateFullyBooked={isDateFullyBookedSync}
                            serverToday={serverToday}
                          />
                        </div>

                        {/* Horarios */}
                        <div className="flex-1 flex flex-col items-stretch gap-3">
                          <Text variant="body" color="#FFFFFF" className="opacity-80 text-center">
                            Horarios disponibles para este día.
                          </Text>
                          <Text variant="label" color="#FF5B00" className="text-center">
                            {isUserInBusinessTz
                              ? 'Zona horaria de Lima, Perú (GMT-5)'
                              : `Tu zona horaria: ${userTimezoneLabel}`
                            }
                          </Text>

                          {isLoadingSlots ? (
                            <div className="flex items-center justify-center py-8">
                              <Spinner size="lg" color="warning" />
                            </div>
                          ) : timeSlots.length === 0 ? (
                            <div className="text-center py-8">
                              <Text variant="body" color="#FFFFFF" className="opacity-60">
                                Selecciona una fecha para ver horarios
                              </Text>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 w-full max-h-56 overflow-y-auto">
                              {timeSlots.map((slot) => {
                                const isOccupied = occupiedSlots.includes(slot)
                                const isSelected = studioConfig.allow_multiple_time_slots
                                  ? selectedTimeSlots.includes(slot)
                                  : formData.timeSlot === slot

                                // Convertir a zona horaria del usuario si es diferente a Lima
                                const convertedSlot = !isUserInBusinessTz && currentDateStr
                                  ? convertSlotToUserTimezone(slot, currentDateStr, userTimezone)
                                  : slot

                                // Mostrar solo hora de inicio
                                const displayTime = convertedSlot.includes(' - ')
                                  ? convertedSlot.split(' - ')[0].replace(/ AM| PM/gi, '').trim()
                                  : convertedSlot

                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => !isOccupied && handleTimeSlotChange(slot)}
                                    disabled={isOccupied}
                                    className={`
                                      py-1.5 px-2 rounded-lg border-2 text-sm text-center transition-all duration-200
                                      ${isOccupied
                                        ? 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                                        : isSelected
                                          ? 'border-[#FF5B00] bg-[#FF5B00] text-white font-medium'
                                          : 'border-[#FF5B00] bg-transparent text-white hover:bg-[#FF5B00]/20'
                                      }
                                    `}
                                  >
                                    {displayTime}
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          <Button
                            type="button"
                            label="Siguiente"
                            variant="primary"
                            fullWidth
                            className="mt-auto"
                            onPress={nextStep}
                            disabled={
                              studioConfig.allow_multiple_time_slots
                                ? selectedTimeSlots.length === 0
                                : !formData.timeSlot
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </AnimatedContent>
                )}

                {/* Paso 2: Datos del usuario */}
                {currentStep === 2 && status === 'idle' && (
                  <AnimatedContent key="step2-landing" direction="horizontal" distance={50}>
                    <div className="flex flex-col items-center gap-4 w-full">
                      <Text variant="subtitle" color="#FFFFFF" weight="bold">
                        Tus datos
                      </Text>
                      <div className="flex flex-col gap-3 w-full mb-4">
                        <Input
                          name="name"
                          label="Nombre"
                          placeholder="Tu nombre"
                          type="text"
                          variant="bordered"
                          color="primary"
                          radius="sm"
                          fullWidth
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                        <Input
                          name="email"
                          label="Email"
                          placeholder="Tu email"
                          type="email"
                          variant="bordered"
                          color="primary"
                          radius="sm"
                          fullWidth
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        <Textarea
                          name="message"
                          label="Mensaje"
                          placeholder="Cuéntanos sobre tu negocio y qué solución digital necesitas..."
                          variant="bordered"
                          color="primary"
                          radius="sm"
                          fullWidth
                          value={formData.message}
                          onChange={handleChange}
                          className='!p-0'
                          classNames={{ inputWrapper: "!bg-white" }}
                        />
                      </div>
                      <div className="flex gap-4 w-full max-w-[380px]">
                        <Button
                          type="button"
                          label="Anterior"
                          variant="secondary"
                          fullWidth
                          onPress={prevStep}
                        />
                        <Button
                          type="button"
                          label={isLoading ? "Enviando..." : "Agendar cita"}
                          variant="primary"
                          fullWidth
                          isDisabled={isLoading || !formData.message}
                          onPress={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                        />
                      </div>
                    </div>
                  </AnimatedContent>
                )}
              </form>
            </div>
          </Col>
        </Container>
      </section>
    );
  }

  // Default layout
  return (
    <>
      <section id="contact" className="py-[80px] bg-color-ct-surface-container">
        <Container>
          <Col cols={{ lg: 6, md: 3, sm: 4 }}>
            <div className="mb-6">
              <h3>
                <Text
                  variant="headline"
                  weight="bold"
                  textColor="color-primary"
                >
                  {content.title}
                </Text>
              </h3>
            </div>
            <div className="mb-8">
              <p className="mb-4">
                <Text variant="title" weight="bold" textColor="color-on-surface-var">
                  {content.subtitle}
                </Text>
              </p>
              <p>
                <Text variant="subtitle" textColor="color-on-surface-var">
                  {content.description}
                </Text>
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-color-ct-primary rounded-xl flex items-center justify-center">
                  <Icon
                    name="Mail"
                    size={24}
                    className="bg-color-ct-primary ct-color-white"
                  />
                </div>
                <div>
                  <Text variant="body" textColor="color-on-surface">
                    contacto@citrica.dev
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-color-ct-primary rounded-xl flex items-center justify-center">
                  <Icon
                    name="Phone"
                    size={24}
                    className="bg-color-ct-primary ct-color-white"
                  />
                </div>
                <p>
                  <Text variant="body" textColor="color-on-surface">
                    Perú +51 942 627 383
                  </Text>
                </p>
                <p>
                  <Text variant="body" textColor="color-on-surface">
                    Uruguay +598 92 041 487
                  </Text>
                </p>
              </div>
            </div>
          </Col>

          <Col cols={{ lg: 5, md: 3, sm: 4 }} className='mt-8 md:mt-0 lg:mt-0'>
            <div className="bg-color-ct-white rounded-2xl shadow-xl border-3 border-[1] p-4">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center gap-4"
              >
                {/* Mensaje de éxito */}
                {status === "success" && (
                  <AnimatedContent
                    key="success"
                    direction="vertical"
                    distance={20}
                  >
                    <div className="flex flex-col items-center justify-center gap-6 w-full py-12">
                      <div className="w-20 h-20 bg-color-ct-secondary rounded-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 ct-color-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <Text
                          variant="headline"
                          weight="bold"
                          textColor="color-primary"
                        >
                          ¡Enviado con éxito!
                        </Text>
                      </div>
                    </div>
                  </AnimatedContent>
                )}

                {/* Mensaje de error */}
                {status === "error" && (
                  <AnimatedContent
                    key="error"
                    direction="vertical"
                    distance={20}
                  >
                    <div className="flex flex-col items-center justify-center gap-6 w-full py-12">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <Text
                          variant="headline"
                          weight="bold"
                          textColor="color-error"
                        >
                          Error al enviar el mensaje
                        </Text>
                        <div className="mt-2">
                          <Text variant="body" textColor="color-on-surface-var">
                            Por favor, inténtalo de nuevo.
                          </Text>
                        </div>
                      </div>
                    </div>
                  </AnimatedContent>
                )}

                {/* Paso 1: Nombre y Email */}
                {currentStep === 3 && status === 'idle' && (
                  <AnimatedContent key="step3" direction="horizontal" distance={50}>
                    <h3 className='mb-[10px]'>
                      <Text
                        variant="subtitle"
                        weight="bold"
                        textColor="color-primary"
                      >
                        Tus datos
                      </Text>
                    </h3>
                    <div className="flex flex-col gap-3 w-full mb-8">
                      <Input
                        name="name"
                        label="Nombre"
                        placeholder="Tu nombre"
                        type="text"
                        variant="bordered"
                        color="primary"
                        radius="sm"
                        fullWidth
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />

                      <Input
                        name="email"
                        label="Email"
                        placeholder="Tu email"
                        type="email"
                        variant="bordered"
                        color="primary"
                        radius="sm"
                        fullWidth
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />

                      <Textarea
                        name="message"
                        label="Mensaje"
                        placeholder="Cuéntanos sobre tu negocio y qué solución digital necesitas..."
                        variant="bordered"
                        color="primary"
                        radius="sm"
                        fullWidth
                        value={formData.message}
                        onChange={handleChange}
                        className='!p-0'
                        classNames={{ inputWrapper: "!bg-white" }}
                      />
                    </div>
                    <div className="flex gap-4 w-full max-w-[380px]">
                      <Button
                        type="button"
                        label="Anterior"
                        variant="secondary"
                        fullWidth
                        onPress={prevStep}
                      />
                      <Button
                        type="button"
                        label={isLoading ? "Enviando..." : "Agendar cita"}
                        variant="primary"
                        fullWidth
                        isDisabled={isLoading || !formData.message}
                        onPress={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                      />
                    </div>
                  </AnimatedContent>
                )}

              {/* Paso 2: Seleccionar Fecha */}
              {currentStep === 1 && status === 'idle' && (
                <AnimatedContent key="step1" direction="horizontal" distance={50}>
                  <div className="flex flex-col items-center gap-4 w-full">
                    <Text
                      variant="subtitle"
                      weight="bold"
                      textColor="color-primary"
                    >
                      Selecciona una fecha
                    </Text>

                    <div className="flex justify-center w-full">
                      <CalendarComponent
                        value={formData.date}
                        onChange={handleDateChange}
                        variant="primary"
                        isDateFullyBooked={isDateFullyBookedSync}
                        serverToday={serverToday}
                      />
                    </div>

                    <div className="flex flex-end gap-4">
                      <Button
                        type="button"
                        label="Siguiente"
                        variant="primary"
                        fullWidth
                        onPress={nextStep}
                        disabled={!formData.date || availableTimeSlots.length === 0}
                      />
                    </div>
                  </div>
                </AnimatedContent>
              )}

              {/* Paso 3: Seleccionar Horario */}
              {currentStep === 2 && status === 'idle' && (
                <AnimatedContent key="step2" direction="horizontal" distance={50}>
                  <div className="flex flex-col items-center gap-4 w-full">
                    <Text
                      variant="subtitle"
                      weight="bold"
                      textColor="color-primary"
                    >
                      Seleccionar Horario
                    </Text>

                    {formData.date && (
                      <div className="text-center mb-2">
                        <Text variant="body" textColor="color-on-surface" className="font-medium">
                          Fecha seleccionada: {(() => {
                            const months = [
                              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                            ];
                            const date = formData.date;
                            return `${date.day} de ${months[date.month - 1]} de ${date.year}`;
                          })()}
                        </Text>
                      </div>
                    )}

                    {studioConfig.allow_multiple_time_slots && (
                      <div className="text-center">
                        <Text variant="body" textColor="color-on-surface-var" className="text-sm">
                          Puedes seleccionar múltiples horarios
                        </Text>
                      </div>
                    )}

                    {isLoadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <Spinner size="lg" color="primary" />
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <Text variant="body" textColor="color-on-surface-var">
                          No hay horarios disponibles para esta fecha
                        </Text>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 w-full max-h-96 overflow-y-auto">
                        {timeSlots.map((slot) => {
                          const isOccupied = occupiedSlots.includes(slot)
                          const isSelected = studioConfig.allow_multiple_time_slots
                            ? selectedTimeSlots.includes(slot)
                            : formData.timeSlot === slot

                          // Convertir a zona horaria del usuario
                          const displaySlot = !isUserInBusinessTz && currentDateStr
                            ? convertSlotToUserTimezone(slot, currentDateStr, userTimezone)
                            : slot

                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => !isOccupied && handleTimeSlotChange(slot)}
                              disabled={isOccupied}
                              className={`
                                  px-4 py-3 rounded-lg border-2 transition-all duration-200
                                  ${isOccupied
                                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                  : isSelected
                                    ? 'border-color-ct-primary bg-color-ct-primary text-white'
                                    : 'border-color-ct-outline bg-white text-color-ct-on-surface hover:border-color-ct-tertiary hover:bg-color-ct-tertiary hover:bg-opacity-10'
                                }
                                `}
                            >
                              <Text
                                variant="label"
                                textColor={
                                  isOccupied
                                    ? 'color-on-surface-var'
                                    : isSelected
                                      ? 'color-white'
                                      : 'color-on-surface'
                                }
                              >
                                {displaySlot}
                                {isOccupied && ' (Ocupado)'}
                              </Text>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    <div className="flex gap-4 w-full max-w-[380px] mx-auto">
                      <Button
                        type="button"
                        label="Anterior"
                        variant="secondary"
                        fullWidth
                        onPress={prevStep}
                      />
                      <Button
                        type="button"
                        label="Siguiente"
                        variant="primary"
                        fullWidth
                        onPress={nextStep}
                        disabled={
                          studioConfig.allow_multiple_time_slots
                            ? selectedTimeSlots.length === 0
                            : !formData.timeSlot
                        }
                      />
                    </div>
                  </div>
                </AnimatedContent>
              )}

              {/* Paso 4: Teléfono y Mensaje */}
            </form>
          </div>
        </Col>
      </Container>
    </section >
    </>
  );
};

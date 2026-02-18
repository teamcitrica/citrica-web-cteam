"use client";
import React from 'react'
import {  Input, Textarea } from '../citrica-ui'
import { Button, Text, Icon, Col, Container } from 'citrica-ui-toolkit'
import { useContact } from '@/hooks/leads/use-leads'
import AnimatedContent from './animated-content'
import CalendarComponent from './calendar'
import { ctaSectionVariants } from '@/shared/archivos js/cta-section-data'

// Tipos para las variantes disponibles
export type ContactVariant = keyof typeof ctaSectionVariants;

interface ContactSectionProps {
  variant?: ContactVariant;
  customContent?: {
    title?: string;
    subtitle?: string;
    description?: string;
  };
}

export const ContactSectionLanding = ({
  variant = 'home',
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
    studioConfig,
    serverToday,
    isLoadingServerTime
  } = useContact()

  // Obtener el contenido según la variante seleccionada
  const content = {
    ...ctaSectionVariants[variant],
    ...customContent // Permite override personalizado
  };

  // Usar los horarios cargados dinámicamente según la configuración y fecha
  const timeSlots = availableTimeSlots

  // Obtener horarios ocupados para la fecha seleccionada
  const occupiedSlots = (() => {
    if (!formData.date) return []

    // Convertir CalendarDate a string YYYY-MM-DD
    let dateStr: string
    if (formData.date.year && formData.date.month && formData.date.day) {
      // Es un objeto CalendarDate de @internationalized/date
      const year = formData.date.year
      const month = String(formData.date.month).padStart(2, '0')
      const day = String(formData.date.day).padStart(2, '0')
      dateStr = `${year}-${month}-${day}`
    } else {
      // Fallback
      dateStr = formData.date.toString()
    }

    return getOccupiedSlots(dateStr)
  })()

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
                        {/* <div className="mt-2">
                          <Text variant="body" textColor="color-on-surface-var">
                            Nos pondremos en contacto contigo pronto.
                          </Text>
                        </div> */}
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

                    {timeSlots.length === 0 ? (
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
                                {slot}
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

'use client'

import { Col, Container } from '@/styles/07-objects/objects'
import React from 'react'
import { Button, Icon, Input, Text, Textarea } from '../citrica-ui'
import { useContact } from '@/hooks/contact/use-contact'
import AnimatedContent from './animated-content'
import CalendarComponent from './calendar'

export const ContactSectionLanding = () => {
  const {
    formData,
    isLoading,
    status,
    currentStep,
    handleChange,
    handleDateChange,
    handleTimeSlotChange,
    handleSubmit,
    nextStep,
    prevStep,
    getOccupiedSlots,
    getAvailableSlots,
    isDateFullyBooked,
    allTimeSlots
  } = useContact()

  // Usar los horarios definidos en el hook
  const timeSlots = allTimeSlots

  // Obtener horarios ocupados para la fecha seleccionada
  const occupiedSlots = formData.date
    ? getOccupiedSlots(formData.date.toString())
    : []

  return (
    <>
          <section className="py-[80px] bg-color-ct-surface-container">
        <Container>
          <Col cols={{ lg: 6, md: 3, sm: 4 }}>
            <div className="mb-6">
              <h2>
                <Text
                  variant="headline"
                  weight="bold"
                  textColor="color-primary"
                >
                  ¿Listo para transformar tu negocio?
                </Text>
              </h2>
            </div>
            <div className="mb-8">
              <p>
                <Text variant="subtitle" textColor="color-on-surface-var">
                  Contáctanos hoy y descubre cómo podemos impulsar tu
                  crecimiento digital
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

          <Col cols={{ lg: 5, md: 3, sm: 4 }}>
            <div className="bg-color-ct-white rounded-2xl p-4">
              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">

                {/* Mensaje de éxito */}
                {status === 'success' && (
                  <AnimatedContent key="success" direction="vertical" distance={20}>
                    <div className="flex flex-col items-center justify-center gap-6 w-full py-12">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <Text variant="headline" weight="bold" textColor="color-primary">
                          ¡Mensaje enviado con éxito!
                        </Text>
                        <div className="mt-2">
                          <Text variant="body" textColor="color-on-surface-var">
                            Nos pondremos en contacto contigo pronto.
                          </Text>
                        </div>
                      </div>
                    </div>
                  </AnimatedContent>
                )}

                {/* Mensaje de error */}
                {status === 'error' && (
                  <AnimatedContent key="error" direction="vertical" distance={20}>
                    <div className="flex flex-col items-center justify-center gap-6 w-full py-12">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <Text variant="headline" weight="bold" textColor="color-error">
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
                {currentStep === 1 && status === 'idle' && (
                  <AnimatedContent key="step1" direction="horizontal" distance={50}>
                    <div className="flex flex-col gap-4 w-full">
                      <Text variant="title" weight="bold" textColor="color-primary">
                        Información de Contacto
                      </Text>

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

                      <Button
                        type="button"
                        label="Siguiente"
                        variant="primary"
                        fullWidth
                        className="max-w-[380px] mx-auto"
                        onClick={nextStep}
                        disabled={!formData.name || !formData.email}
                      />
                    </div>
                  </AnimatedContent>
                )}

                {/* Paso 2: Seleccionar Fecha */}
                {currentStep === 2 && status === 'idle' && (
                  <AnimatedContent key="step2" direction="horizontal" distance={50}>
                    <div className="flex flex-col items-center gap-4 w-full">
                      <Text variant="title" weight="bold" textColor="color-primary">
                        Seleccionar Fecha
                      </Text>

                      <div className="flex justify-center w-full">
                        <CalendarComponent
                          value={formData.date}
                          onChange={handleDateChange}
                          variant="primary"
                          isDateFullyBooked={isDateFullyBooked}
                        />
                      </div>

                      <div className="flex gap-4 w-full max-w-[380px] mx-auto">
                        <Button
                          type="button"
                          label="Anterior"
                          variant="secondary"
                          fullWidth
                          onClick={prevStep}
                        />
                        <Button
                          type="button"
                          label="Siguiente"
                          variant="primary"
                          fullWidth
                          onClick={nextStep}
                          disabled={!formData.date}
                        />
                      </div>
                    </div>
                  </AnimatedContent>
                )}

                {/* Paso 3: Seleccionar Horario */}
                {currentStep === 3 && status === 'idle' && (
                  <AnimatedContent key="step3" direction="horizontal" distance={50}>
                    <div className="flex flex-col items-center gap-4 w-full">
                      <Text variant="title" weight="bold" textColor="color-primary">
                        Seleccionar Horario
                      </Text>

                      <div className="grid grid-cols-2 gap-3 w-full">
                        {timeSlots.map((slot) => {
                          const isOccupied = occupiedSlots.includes(slot)
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
                                  : formData.timeSlot === slot
                                  ? 'border-color-ct-primary bg-color-ct-primary text-white'
                                  : 'border-color-ct-outline bg-white text-color-ct-on-surface hover:border-color-ct-tertiary hover:bg-color-ct-tertiary hover:bg-opacity-10'
                                }
                              `}
                            >
                              <Text
                                variant="body"
                                textColor={
                                  isOccupied
                                    ? 'color-on-surface-var'
                                    : formData.timeSlot === slot
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

                      <div className="flex gap-4 w-full max-w-[380px] mx-auto">
                        <Button
                          type="button"
                          label="Anterior"
                          variant="secondary"
                          fullWidth
                          onClick={prevStep}
                        />
                        <Button
                          type="button"
                          label="Siguiente"
                          variant="primary"
                          fullWidth
                          onClick={nextStep}
                          disabled={!formData.timeSlot}
                        />
                      </div>
                    </div>
                  </AnimatedContent>
                )}

                {/* Paso 4: Mensaje */}
                {currentStep === 4 && status === 'idle' && (
                  <AnimatedContent key="step4" direction="horizontal" distance={50}>
                    <div className="flex flex-col gap-4 w-full">
                      <Text variant="title" weight="bold" textColor="color-primary">
                        Tu Mensaje
                      </Text>

                      <Textarea
                        name="message"
                        label="Mensaje"
                        placeholder="Cuéntanos sobre tu negocio y qué solución digital necesitas"
                        variant="bordered"
                        color="primary"
                        radius="sm"
                        fullWidth
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />

                      <div className="flex gap-4 w-full max-w-[380px] mx-auto">
                        <Button
                          type="button"
                          label="Anterior"
                          variant="secondary"
                          fullWidth
                          onClick={prevStep}
                        />
                        <Button
                          type="submit"
                          label={isLoading ? "Enviando..." : "Enviar Mensaje"}
                          variant="primary"
                          fullWidth
                          disabled={isLoading || !formData.message}
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
    </>
  )
}

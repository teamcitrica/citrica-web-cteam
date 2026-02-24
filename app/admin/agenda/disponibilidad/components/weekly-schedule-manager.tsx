"use client";
import { Switch } from "@heroui/switch";
import { addToast } from "@heroui/toast";
import React, { useState, useEffect } from "react";
import { Button, Text, Icon } from "citrica-ui-toolkit";
import Card from "@ui/atoms/card";
import Modal from "@ui/molecules/modal";

import { useAdminBookings, WeeklyAvailability } from "@/hooks/disponibilidad/use-admin-bookings";

const WeeklyScheduleManager = () => {
  const {
    isLoading,
    weeklyAvailability,
    getWeeklyAvailability,
    updateDayAvailability,
    toggleTimeSlot
  } = useAdminBookings();

  const [showStandardHoursModal, setShowStandardHoursModal] = useState(false);
  const [showCloseAllModal, setShowCloseAllModal] = useState(false);
  const [isOpeningAll, setIsOpeningAll] = useState(false);

  useEffect(() => {
    getWeeklyAvailability();
  }, []);

  const daysOfWeek = [
    { id: 1, name: "Lunes", short: "L" },
    { id: 2, name: "Martes", short: "M" },
    { id: 3, name: "Miércoles", short: "X" },
    { id: 4, name: "Jueves", short: "J" },
    { id: 5, name: "Viernes", short: "V" },
    { id: 6, name: "Sábado", short: "S" },
    { id: 0, name: "Domingo", short: "D" }
  ];

  // Generar slots de tiempo (cada 30 minutos)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${String(hour).padStart(2, "0")}:00`);
      slots.push(`${String(hour).padStart(2, "0")}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleDayToggle = async (dayOfWeek: number, isActive: boolean) => {
    // Llamar al hook que ya tiene actualización optimista integrada
    const result = await updateDayAvailability(dayOfWeek, isActive);

    if (!result.success) {
      console.error("Error updating day availability:", result.error);
    }
  };

  const handleTimeSlotToggle = async (dayOfWeek: number, timeSlot: string, isActive: boolean) => {
    const result = await toggleTimeSlot(dayOfWeek, timeSlot, isActive);

    if (!result.success) {
      console.error("Error toggling slot:", result.error);
    }
  };

  const getDayConfig = (dayOfWeek: number): WeeklyAvailability | undefined => {
    return weeklyAvailability.find(day => day.day_of_week === dayOfWeek);
  };

  const getTimeSlotStatus = (dayOfWeek: number, timeSlot: string): boolean => {
    const dayConfig = getDayConfig(dayOfWeek);
    if (!dayConfig) return false;

    const slot = dayConfig.time_slots.find(slot => slot.slot === timeSlot);
    return slot ? slot.active : false;
  };

  const getActiveTimeCount = (dayOfWeek: number): number => {
    const dayConfig = getDayConfig(dayOfWeek);
    if (!dayConfig) return 0;

    return dayConfig.time_slots.filter(slot => slot.active).length;
  };

  const areAllDaysClosed = (): boolean => {
    return weeklyAvailability.every(day => !day.is_active);
  };

  const handleApplyStandardHours = async () => {
    if (weeklyAvailability.length === 0) {
      addToast({ title: "Error", description: "No se ha cargado la configuración semanal. Recarga la página.", color: "danger" });
      return;
    }

    // Horario estándar: 9:00 - 18:00 L-V, 10:00-16:00 S, cerrado D
    const standardHours: Record<number, { start: string; end: string; active: boolean }> = {
      1: { start: "09:00", end: "18:00", active: true },
      2: { start: "09:00", end: "18:00", active: true },
      3: { start: "09:00", end: "18:00", active: true },
      4: { start: "09:00", end: "18:00", active: true },
      5: { start: "09:00", end: "18:00", active: true },
      6: { start: "10:00", end: "16:00", active: true },
      0: { start: "00:00", end: "00:00", active: false },
    };

    try {
      for (const [day, config] of Object.entries(standardHours)) {
        const dayNum = parseInt(day);
        const dayConfig = weeklyAvailability.find(d => d.day_of_week === dayNum);

        if (!config.active) {
          await updateDayAvailability(dayNum, false);
          continue;
        }

        const startHour = parseInt(config.start.split(":")[0]);
        const startMin = parseInt(config.start.split(":")[1]);
        const endHour = parseInt(config.end.split(":")[0]);
        const endMin = parseInt(config.end.split(":")[1]);
        const startTimeMin = startHour * 60 + startMin;
        const endTimeMin = endHour * 60 + endMin;

        const updatedSlots = (dayConfig?.time_slots || timeSlots.map(s => ({ slot: s, active: false }))).map(slot => {
          const [h, m] = slot.slot.split(":").map(Number);
          const slotTime = h * 60 + m;
          return { ...slot, active: slotTime >= startTimeMin && slotTime < endTimeMin };
        });

        await updateDayAvailability(dayNum, true, updatedSlots);
      }

      addToast({ title: "Éxito", description: "Horario estándar aplicado exitosamente", color: "success" });
      setShowStandardHoursModal(false);
    } catch (error) {
      console.error("Error applying standard hours:", error);
      addToast({ title: "Error", description: "Error al aplicar horario estándar", color: "danger" });
    }
  };

  const handleOpenToggleAllModal = () => {
    const shouldOpen = areAllDaysClosed();
    setIsOpeningAll(shouldOpen);
    setShowCloseAllModal(true);
  };

  const handleToggleAllDays = async () => {
    for (const day of daysOfWeek) {
      await handleDayToggle(day.id, isOpeningAll);
    }

    setShowCloseAllModal(false);
    addToast({
      title: "Éxito",
      description: isOpeningAll ? "Todos los días fueron abiertos correctamente" : "Días cerrados correctamente",
      color: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header con acciones rápidas */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p>
            <Text variant="title" isAdmin color="#265197">
              Configuración Semanal de Horarios
            </Text>
            </p>
            <Text variant="body" color="color-on-surface">
              Gestiona los horarios disponibles para cada día de la semana. Cada slot representa 30 minutos.
            </Text>
          </div>

          <div className="flex gap-2">
            <Button
              isAdmin
              variant="primary"
              size="sm"
              onPress={() => setShowStandardHoursModal(true)}
              label="Horario Estándar"
            />

            <Button
              isAdmin
              variant="primary"
              size="sm"
              onPress={handleOpenToggleAllModal}
              label={areAllDaysClosed() ? "Abrir Todo" : "Cerrar Todo"}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <Text variant="body" color="color-on-surface">
              Cargando configuración...
            </Text>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {daysOfWeek.map((day) => {
            const dayConfig = getDayConfig(day.id);
            const activeSlots = getActiveTimeCount(day.id);

            return (
              <Card key={day.id} className="p-6">
                <div className="space-y-4">
                  {/* Header del día */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <Switch
                        isSelected={dayConfig?.is_active || false}
                        onValueChange={(isActive) => handleDayToggle(day.id, isActive)}
                        classNames={{ wrapper: "group-data-[selected=true]:bg-[#10E5A4]" }}
                      />
                      <div>
                        <p>
                        <Text variant="subtitle" isAdmin color="#265197">
                          {day.name}
                        </Text>
                        </p>
                        <p>
                        <Text variant="body" color="color-on-surface" className="text-sm">
                          {dayConfig?.is_active
                            ? `${activeSlots} slots activos (${Math.round(activeSlots * 0.5)} horas)`
                            : "Día cerrado"
                          }
                        </Text>
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Grid de horarios */}
                  {dayConfig?.is_active && (
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((timeSlot) => {
                        const isActive = getTimeSlotStatus(day.id, timeSlot);
                        const hour = parseInt(timeSlot.split(":")[0]);
                        return (
                          <div
                            key={timeSlot}
                            className={`
                              w-[78px] h-[48px] flex items-center justify-center text-xs font-medium rounded-[8px] cursor-pointer transition-all border
                              ${isActive
                                ? "bg-[#82EFCE] hover:bg-[#6DE0BC] text-[#16305A] border-[#82EFCE]"
                                : "bg-[#D4DEED] hover:bg-[#C0D0E5] text-[#A7BDE2] border-[#D4DEED]"
                              }
                            `}
                            title={`${timeSlot} - ${String(hour + (timeSlot.includes(":30") ? 1 : 0)).padStart(2, "0")}:${timeSlot.includes(":30") ? "00" : "30"}`}
                            onClick={() => {
                              handleTimeSlotToggle(day.id, timeSlot, !isActive);
                            }}
                          >
                            {timeSlot}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <Card className="p-6">
        <div className="space-y-3">
          <Text variant="subtitle" isAdmin color="#265197">
            Leyenda
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#82EFCE] rounded"></div>
              <Text variant="body" color="#16305A" className="text-sm">
                Slot activo (disponible para reservas)
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#D4DEED] rounded"></div>
              <Text variant="body" color="#16305A" className="text-sm">
                Slot inactivo (no disponible)
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal Horario Estándar */}
      <Modal
        isOpen={showStandardHoursModal}
        onClose={() => setShowStandardHoursModal(false)}
        size="lg"
        title="Aplicar Horario Estándar"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              isAdmin
              variant="primary"
              onPress={handleApplyStandardHours}
              startContent={<Icon name="Check" size={20} />}
            >
              Sí, aplicar horario estándar
            </Button>
            <Button
              isAdmin
              variant="secondary"
              onPress={() => setShowStandardHoursModal(false)}
            >
              Cancelar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2 bg-[#EEF1F7] border border-[#D4DEED] rounded-lg p-3">
            <Icon name="Info" size={20} className="text-[#265197] mt-0.5" />
            <div>
              <p>
                <Text variant="body" color="#265197" className="font-bold">
                  Configuración de Horario Estándar
                </Text>
              </p>
              <p>
                <Text variant="body" color="#16305A" className="text-sm mt-1">
                  Esta acción configurará los siguientes horarios:
                </Text>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <Text variant="body" color="color-on-surface">Lunes a Viernes:</Text>
              <Text variant="body" isAdmin color="#265197" className="font-semibold">9:00 AM - 6:00 PM</Text>
            </div>
            <div className="flex justify-between py-2 border-b">
              <Text variant="body" color="color-on-surface">Sábado:</Text>
              <Text variant="body" isAdmin color="#265197" className="font-semibold">10:00 AM - 4:00 PM</Text>
            </div>
            <div className="flex justify-between py-2">
              <Text variant="body" color="color-on-surface">Domingo:</Text>
              <Text variant="body" color="#dc2626" className="font-semibold">Cerrado</Text>
            </div>
          </div>

          <p>
            <Text variant="body" isAdmin color="#265197" className="font-semibold">
              ¿Deseas aplicar esta configuración a toda la semana?
            </Text>
          </p>
        </div>
      </Modal>

      {/* Modal Cerrar/Abrir Todo */}
      <Modal
        isOpen={showCloseAllModal}
        onClose={() => setShowCloseAllModal(false)}
        size="lg"
        title={isOpeningAll ? "Abrir Todos los Días" : "Cerrar Todos los Días"}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              isAdmin
              startContent={<Icon name={isOpeningAll ? "Check" : "X"} size={20} />}
              variant="primary"
              onPress={handleToggleAllDays}
            >
              {isOpeningAll ? "Sí, abrir todos los días" : "Sí, cerrar todos los días"}
            </Button>
            <Button
              isAdmin
              variant="secondary"
              onPress={() => setShowCloseAllModal(false)}
            >
              Cancelar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div
            className={`flex items-start gap-2 bg-[#EEF1F7] border-[#D4DEED] border rounded-lg p-3`}
          >
            <Icon
              className="text-[#265197] mt-0.5"
              name="AlertCircle"
              size={20}
            />
            <div>
              <p>
                <Text
                  isAdmin
                  className="font-bold"
                  color="#265197"
                  variant="body"
                >
                  {isOpeningAll ? "Abrir Disponibilidad" : "Cerrar Disponibilidad"}
                </Text>
              </p>
              <p>
                <Text
                  isAdmin
                  className="text-sm mt-1"
                  color="#16305A"
                  variant="body"
                >
                  {isOpeningAll
                    ? "Esta acción activará todos los días de la semana. Podrás configurar los horarios específicos después."
                    : "Esta acción cerrará todos los días de la semana. Los usuarios no podrán realizar reservas hasta que vuelvas a activar al menos un día."}
                </Text>
              </p>
            </div>
          </div>

          <p>
            <Text className="font-semibold" isAdmin color="#265197" variant="body">
              {isOpeningAll
                ? "¿Deseas abrir todos los días de la semana?"
                : "¿Confirmas que deseas cerrar todos los días de la semana?"}
            </Text>
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default WeeklyScheduleManager;
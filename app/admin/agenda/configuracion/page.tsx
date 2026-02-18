"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar } from "@heroui/calendar";
import { Switch } from "@heroui/switch";
import { Divider } from "@heroui/divider";
import { today, getLocalTimeZone } from "@internationalized/date";
import { Text, Container, Col } from "citrica-ui-toolkit";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";
import { useAdminBookings } from "@/hooks/disponibilidad/use-admin-bookings";
import { useStudioConfig } from "@/hooks/disponibilidad/use-studio-config";
import { useAvailability } from "@/app/contexts/AvailabilityContext";
import { useSupabase } from "@/shared/context/supabase-context";
import { useServerTime } from "@/hooks/use-server-time";
import WeeklyScheduleManager from "../disponibilidad/components/weekly-schedule-manager";

export default function ConfiguracionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams?.get("page") || "gestion";

  const { createBlockedPeriod, createSlotBlock, deleteBlockedPeriod, getBlockedPeriods } = useAdminBookings();
  const { getUserDisplayMode, updateUserDisplayMode, getAllowMultipleTimeSlots, updateAllowMultipleTimeSlots } = useStudioConfig();
  const { clearCache } = useAvailability();
  const { supabase } = useSupabase();
  const { serverToday } = useServerTime();

  const [selectedDate, setSelectedDate] = useState<any>(serverToday || today(getLocalTimeZone()));
  const [isLoading, setIsLoading] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [weeklyActiveSlots, setWeeklyActiveSlots] = useState<string[]>([]);
  const [slotStatusMap, setSlotStatusMap] = useState<Record<string, string>>({});
  const [officeHoursEnabled, setOfficeHoursEnabled] = useState(true);
  const [allSlotsEnabled, setAllSlotsEnabled] = useState(false);
  const [officeStartHour, setOfficeStartHour] = useState(9);
  const [officeEndHour, setOfficeEndHour] = useState(18);
  const [userDisplayMode, setUserDisplayMode] = useState<"30min" | "1hour">("1hour");
  const [allowMultipleTimeSlots, setAllowMultipleTimeSlots] = useState(true);
  const [blockDayEnabled, setBlockDayEnabled] = useState(false);

  const allTimeSlots = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? "00" : "30";
    return `${String(h).padStart(2, "0")}:${m}`;
  });

  useEffect(() => {
    getBlockedPeriods();
    (async () => {
      const dm = await getUserDisplayMode();
      if (dm.success && dm.mode) setUserDisplayMode(dm.mode);
      const ms = await getAllowMultipleTimeSlots();
      if (ms.success && ms.allowed !== undefined) setAllowMultipleTimeSlots(ms.allowed);
    })();
  }, []);

  useEffect(() => {
    if (selectedDate) loadDayData(selectedDate);
  }, [selectedDate]);

  const loadDayData = async (date: any) => {
    setIsLoading(true);
    const dateStr = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
    try {
      const dayOfWeek = new Date(dateStr + "T00:00:00").getDay();
      const { data: config } = await supabase
        .from("studio_availability")
        .select("is_active, time_slots")
        .eq("day_of_week", dayOfWeek)
        .single();

      const weekly = new Set<string>();
      if (config?.is_active && config.time_slots) {
        config.time_slots.forEach((s: any) => {
          if (s.active) weekly.add(s.slot);
        });
      }
      setWeeklyActiveSlots(Array.from(weekly));

      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_date", dateStr)
        .in("status", ["confirmed", "pending", "cancelled"]);

      const blocked: string[] = [];
      const statusMap: Record<string, string> = {};

      const convert = (slot: string): string[] => {
        const m = slot.match(/(\d+):(\d+)\s+(AM|PM)/);
        if (!m) return /^\d{1,2}:\d{2}$/.test(slot) ? [slot] : [];
        let h = parseInt(m[1]);
        if (m[3] === "PM" && h !== 12) h += 12;
        else if (m[3] === "AM" && h === 12) h = 0;
        return [`${String(h).padStart(2, "0")}:00`, `${String(h).padStart(2, "0")}:30`];
      };

      bookings?.forEach((b: any) => {
        if (!b.time_slots?.length) return;
        const slots = b.time_slots.flatMap(convert);
        if (b.type_id === 2) {
          const target = slots.includes("00:00") || slots.length === 0 ? allTimeSlots : slots;
          blocked.push(...target);
          target.forEach((s: string) => { statusMap[s] = "blocked"; });
        } else if (["confirmed", "pending"].includes(b.status)) {
          slots.forEach((s: string) => { if (!statusMap[s]) statusMap[s] = b.status; });
        } else if (b.status === "cancelled") {
          slots.forEach((s: string) => { if (!statusMap[s]) statusMap[s] = "cancelled"; });
        }
      });

      setBlockedSlots(Array.from(new Set(blocked)));
      setSlotStatusMap(statusMap);
      setBlockDayEnabled(allTimeSlots.every((s) => statusMap[s] === "blocked"));
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWeeklyConfig = async (newActive: string[]) => {
    if (!selectedDate) return;
    const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
    const dayOfWeek = new Date(dateStr + "T00:00:00").getDay();
    const timeSlots = allTimeSlots.map((s) => ({ slot: s, active: newActive.includes(s) }));
    await supabase.from("studio_availability").update({ time_slots: timeSlots, is_active: true }).eq("day_of_week", dayOfWeek);
    clearCache();
  };

  const applyOfficeHours = async (start = officeStartHour, end = officeEndHour) => {
    const officeSlots = allTimeSlots.filter((s) => {
      const h = parseInt(s.split(":")[0]);
      return h >= start && h < end;
    });
    setWeeklyActiveSlots(officeSlots);
    await updateWeeklyConfig(officeSlots);
  };

  const handleOfficeHoursToggle = async (enabled: boolean) => {
    setOfficeHoursEnabled(enabled);
    if (enabled) {
      setAllSlotsEnabled(false);
      await applyOfficeHours();
    }
  };

  const handleAllSlotsToggle = async (enabled: boolean) => {
    setAllSlotsEnabled(enabled);
    if (enabled) {
      setOfficeHoursEnabled(false);
      setWeeklyActiveSlots([...allTimeSlots]);
      await updateWeeklyConfig([...allTimeSlots]);
    }
  };

  const handleBlockDay = async (block: boolean) => {
    if (!selectedDate) return;
    const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
    if (block) {
      await createBlockedPeriod(dateStr, dateStr, "Día completo bloqueado");
      setBlockedSlots([...allTimeSlots]);
      setBlockDayEnabled(true);
    } else {
      const { data: blocks } = await supabase
        .from("bookings").select("*").eq("type_id", 2).eq("booking_date", dateStr).neq("status", "cancelled");
      if (blocks?.length) {
        for (const b of blocks) await deleteBlockedPeriod(b.id);
      }
      setBlockedSlots([]);
      setBlockDayEnabled(false);
    }
    await getBlockedPeriods();
    await loadDayData(selectedDate);
  };

  const toggleSlot = async (timeSlot: string) => {
    if (!selectedDate) return;
    const state = getSlotState(timeSlot);
    const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;

    if (state === "blocked") {
      const { data: blocks } = await supabase
        .from("bookings").select("*").eq("type_id", 2).eq("booking_date", dateStr).neq("status", "cancelled");
      const target = blocks?.filter((b: any) => b.time_slots?.includes(timeSlot) || b.time_slots?.includes("00:00"));
      if (target?.length) {
        for (const b of target) {
          if (b.time_slots.includes("00:00")) {
            alert("Este slot forma parte de un bloqueo completo del día. Desactiva \"Bloquea el día\" primero.");
            return;
          }
          await deleteBlockedPeriod(b.id);
        }
      }
      setBlockedSlots((prev) => prev.filter((s) => s !== timeSlot));
    } else if (state === "available") {
      const result = await createSlotBlock(dateStr, timeSlot, `Slot ${timeSlot} bloqueado para ${dateStr}`);
      if (result.success) setBlockedSlots((prev) => [...prev, timeSlot]);
    } else if (state === "inactive" || state === "outside") {
      const newActive = [...weeklyActiveSlots, timeSlot];
      setWeeklyActiveSlots(newActive);
      await updateWeeklyConfig(newActive);
    }
    await getBlockedPeriods();
    await loadDayData(selectedDate);
  };

  const handleDisplayModeChange = async (mode: "30min" | "1hour") => {
    const result = await updateUserDisplayMode(mode);
    if (result.success) setUserDisplayMode(mode);
  };

  const handleMultipleSlotsChange = async (allowed: boolean) => {
    const result = await updateAllowMultipleTimeSlots(allowed);
    if (result.success) setAllowMultipleTimeSlots(allowed);
  };

  const getSlotState = (timeSlot: string) => {
    const status = slotStatusMap[timeSlot];
    if (status === "blocked") return "blocked";
    if (status === "confirmed" || status === "pending") return "reserved";
    if (status === "cancelled") return "cancelled";
    if (weeklyActiveSlots.includes(timeSlot)) return "available";
    const h = parseInt(timeSlot.split(":")[0]);
    return h >= officeStartHour && h < officeEndHour ? "inactive" : "outside";
  };

  const getSlotClasses = (state: string) => {
    const base = "w-[78px] h-[48px] flex items-center justify-center rounded-[8px] text-xs font-medium border transition-all";
    switch (state) {
      case "available":
        return `${base} bg-[#82EFCE] text-[#16305A] border-[#82EFCE] hover:bg-[#6DE0BC] cursor-pointer`;
      case "reserved":
        return `${base} bg-[#FF9800] text-white border-[#FF9800] cursor-not-allowed opacity-80`;
      case "blocked":
        return `${base} bg-[#EF5350] text-white border-[#EF5350] hover:bg-[#E53935] cursor-pointer`;
      case "inactive":
        return `${base} bg-[#EF9A9A] text-white border-[#EF9A9A] hover:bg-[#E57373] cursor-pointer`;
      case "cancelled":
        return `${base} bg-gray-400 text-white border-gray-400 cursor-pointer`;
      default:
        return `${base} bg-[#D4DEED] text-[#A7BDE2] border-[#D4DEED] hover:border-[#A7BDE2] cursor-pointer`;
    }
  };

  const formatDate = (date: any) => {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    const weekday = jsDate.toLocaleDateString("es-ES", { weekday: "long" });
    const month = jsDate.toLocaleDateString("es-ES", { month: "long" });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${date.day} ${month.charAt(0).toUpperCase() + month.slice(1)} de ${date.year}`;
  };

  const formatHour12 = (hour: number) => {
    if (hour === 0) return "12:00am";
    if (hour === 12) return "12:00pm";
    if (hour > 12) return `${hour - 12}:00pm`;
    return `${hour}:00am`;
  };

  const switchClassNames = {
    wrapper: "group-data-[selected=true]:bg-[#10E5A4]",
  };

  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }} className="space-y-3">
        <h1>
          <Text isAdmin variant="title" weight="bold" color="#678CC5">AGENDA</Text>
          {" > "}
          <Text isAdmin variant="title" weight="bold" color="#265197">Configuración</Text>
        </h1>

        <div className="flex items-center bg-white border border-[#D4DEED] rounded-xl px-4 py-2 shadow-md">
          <FilterButtonGroup
            buttons={[
              { value: "gestion", label: "Gestión disponibilidad" },
              { value: "semanal", label: "Configuración semanal" },
            ]}
            selectedValue={activeTab}
            onValueChange={(val) => router.push(`/admin/agenda/configuracion?page=${val}`)}
          />
        </div>

        {activeTab === "semanal" ? (
          <WeeklyScheduleManager />
        ) : (
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="xl:w-[475px] xl:min-w-[475px]">
              <div className="bg-white rounded-xl shadow-sm border border-[#D4DEED] px-6 pt-[12px] pb-6 h-[650px]">
                  <Text isAdmin variant="subtitle" color="#265197" weight="bold">
                    Configuración de disponibilidad
                  </Text>

                  <div>
                    <Text isAdmin variant="body" color="#16305A" weight="bold" className="mt-[20px]">
                      Horario disponible
                    </Text>

                    <div className="flex mt-[12px]">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Text isAdmin variant="label" color="#265197">¿Horario de oficina?</Text>
                          <Switch
                            isSelected={officeHoursEnabled}
                            onValueChange={handleOfficeHoursToggle}
                            classNames={switchClassNames}
                            size="sm"
                          />
                        </div>
                        <div className="flex gap-3">
                          <div className="w-[100px] h-[52px] border border-[#D4DEED] rounded-lg px-3 pt-1.5 pb-0.5">
                            <span className="block text-[10px] text-[#265197] leading-none mb-1">Hora inicio</span>
                            <input
                              type="time"
                              value={`${String(officeStartHour).padStart(2, "0")}:00`}
                              onChange={(e) => {
                                const v = parseInt(e.target.value.split(":")[0]);
                                if (!isNaN(v)) {
                                  setOfficeStartHour(v);
                                  if (officeHoursEnabled) applyOfficeHours(v, officeEndHour);
                                }
                              }}
                              className="w-full text-sm text-[#A7BDE2] font-medium bg-transparent outline-none [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:saturate-100 [&::-webkit-calendar-picker-indicator]:[filter:invert(72%)_sepia(12%)_saturate(735%)_hue-rotate(182deg)_brightness(91%)_contrast(87%)]"
                            />
                          </div>
                          <div className="w-[100px] h-[52px] border border-[#D4DEED] rounded-lg px-3 pt-1.5 pb-0.5">
                            <span className="block text-[10px] text-[#265197] leading-none mb-1">Hora fin</span>
                            <input
                              type="time"
                              value={`${String(officeEndHour).padStart(2, "0")}:00`}
                              onChange={(e) => {
                                const v = parseInt(e.target.value.split(":")[0]);
                                if (!isNaN(v)) {
                                  setOfficeEndHour(v);
                                  if (officeHoursEnabled) applyOfficeHours(officeStartHour, v);
                                }
                              }}
                              className="w-full text-sm text-[#A7BDE2] font-medium bg-transparent outline-none [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:saturate-100 [&::-webkit-calendar-picker-indicator]:[filter:invert(72%)_sepia(12%)_saturate(735%)_hue-rotate(182deg)_brightness(91%)_contrast(87%)]"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="w-px bg-[#D4DEED] mx-4 self-stretch" />
                      <div className="flex items-start pt-1">
                        <div className="flex items-center gap-2">
                          <Text isAdmin variant="label" color="#265197">Activa todos los slots</Text>
                          <Switch
                            isSelected={allSlotsEnabled}
                            onValueChange={handleAllSlotsToggle}
                            classNames={switchClassNames}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-[16px]">
                      <Text isAdmin variant="label" color="#265197">
                        Lunes a Viernes {formatHour12(officeStartHour)} - {formatHour12(officeEndHour)}
                      </Text>
                      <br />
                      <Text isAdmin variant="label" color="#265197">
                        Sábado y Domingo: Cerrado
                      </Text>
                    </div>
                  </div>

                  <Divider className="bg-[#D4DEED] mt-[16px]" />

                  <div className="space-y-4">
                    <Text isAdmin variant="body" color="#265197" weight="bold">
                      Configuración formulario público
                    </Text>

                    <div className="space-y-2">
                      <Text isAdmin variant="body" color="#16305A" weight="bold">
                        1. Administra el tiempo permitido para las reservas
                      </Text>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Text isAdmin variant="label" color="#265197">Slots de 30 minutos</Text>
                          <input
                            type="radio"
                            name="displayMode"
                            checked={userDisplayMode === "30min"}
                            onChange={() => handleDisplayModeChange("30min")}
                            className="w-4 h-4 accent-[#265197]"
                          />
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Text isAdmin variant="label" color="#265197">Horas completas</Text>
                          <input
                            type="radio"
                            name="displayMode"
                            checked={userDisplayMode === "1hour"}
                            onChange={() => handleDisplayModeChange("1hour")}
                            className="w-4 h-4 accent-[#265197]"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Text isAdmin variant="body" color="#16305A" weight="bold">
                        2. Elige cuántos horarios puede reservar un usuario por cita
                      </Text>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Text isAdmin variant="label" color="#265197">Múltiples horarios</Text>
                          <input
                            type="radio"
                            name="multipleSlots"
                            checked={allowMultipleTimeSlots}
                            onChange={() => handleMultipleSlotsChange(true)}
                            className="w-4 h-4 accent-[#265197]"
                          />
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Text isAdmin variant="label" color="#265197">Un solo horario</Text>
                          <input
                            type="radio"
                            name="multipleSlots"
                            checked={!allowMultipleTimeSlots}
                            onChange={() => handleMultipleSlotsChange(false)}
                            className="w-4 h-4 accent-[#265197]"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl shadow-sm border border-[#D4DEED] p-[16px] space-y-5">
                <Text isAdmin variant="body" color="#265197" weight="bold" className="mt-[16px]">
                  Fecha: {selectedDate && formatDate(selectedDate)}
                </Text>

                <div className="flex justify-center">
                  <div className="w-full max-w-[359px]">
                  <Calendar
                    aria-label="Seleccionar fecha"
                    value={selectedDate as any}
                    onChange={(date: any) => { if (date) setSelectedDate(date); }}
                    minValue={(serverToday || today(getLocalTimeZone())) as any}
                    showMonthAndYearPickers
                    classNames={{
                      base: "!shadow-none !border-[#D4DEED] !border !rounded-[12px] !bg-white !w-full !max-w-full",
                      content: "!w-full !bg-white",
                      headerWrapper: "!bg-transparent !rounded-t-[12px] !py-2",
                      header: "!gap-1 !bg-[#EEF1F7] !px-3 !py-1 !rounded-lg !border !border-[#D4DEED] !w-auto",
                      title: "!text-[#265197] !font-semibold !text-sm",
                      prevButton: "!text-[#265197] !min-w-6 !w-6 !h-6",
                      nextButton: "!text-[#265197] !min-w-6 !w-6 !h-6",
                      gridWrapper: "!w-full !px-0 !pb-3",
                      grid: "!w-full",
                      gridHeader: "!bg-white",
                      gridHeaderRow: "!w-full",
                      gridHeaderCell: "!text-[#265197] !font-medium !text-xs !flex-1 !w-auto !justify-center",
                      gridBody: "!bg-transparent",
                      gridBodyRow: "!w-full",
                      cell: "!text-[#265197] !flex-1",
                      cellButton: [
                        "!w-full !text-sm",
                        "data-[selected=true]:!bg-[#265197] data-[selected=true]:!text-white",
                        "data-[today=true]:!bg-[#EEF1F7] data-[today=true]:!text-[#265197]",
                        "hover:!bg-[#EEF1F7]",
                        "data-[outside-month=true]:!text-[#A7BDE2]",
                      ].join(" "),
                    }}
                  />
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Text isAdmin variant="body" color="#265197" weight="bold">Slots</Text>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 border border-[#A7BDE2] rounded-full px-2.5 py-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />
                      <Text isAdmin variant="label" color="#16305A">Disponibles</Text>
                    </div>
                    <div className="flex items-center gap-1.5 border border-[#A7BDE2] rounded-full px-2.5 py-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF9800]" />
                      <Text isAdmin variant="label" color="#16305A">Reservados</Text>
                    </div>
                    <div className="flex items-center gap-1.5 border border-[#A7BDE2] rounded-full px-2.5 py-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#EF5350]" />
                      <Text isAdmin variant="label" color="#16305A">Bloqueados</Text>
                    </div>
                    <div className="flex items-center gap-1.5 border border-[#A7BDE2] rounded-full px-2.5 py-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#D4DEED]" />
                      <Text isAdmin variant="label" color="#16305A">Inactivos</Text>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <Text isAdmin variant="body" color="#678CC5">Cargando horarios...</Text>
                  </div>
                ) : (
                  <div className="grid grid-cols-10 gap-2">
                    {allTimeSlots.map((slot) => {
                      const state = getSlotState(slot);
                      const isReserved = state === "reserved";
                      return (
                        <button
                          key={slot}
                          onClick={() => !isReserved && toggleSlot(slot)}
                          disabled={isReserved}
                          className={getSlotClasses(state)}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Text isAdmin variant="body" color="#16305A">Bloquea el día</Text>
                  <Switch
                    isSelected={blockDayEnabled}
                    onValueChange={handleBlockDay}
                    classNames={switchClassNames}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Col>
    </Container>
  );
}

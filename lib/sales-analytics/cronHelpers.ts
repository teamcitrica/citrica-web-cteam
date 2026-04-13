// =============================================
// Cron Helpers: Generación y cálculo de cron expressions
// =============================================

import type { ReportFrequency } from '@/types/sales-analytics';

/**
 * Generar cron expression según frecuencia
 * @param frequency - Frecuencia del reporte
 * @param day - Día de la semana ('monday', 'tuesday', etc.) - solo para weekly/biweekly
 * @param time - Hora en formato "HH:MM" (ej: "09:00")
 * @returns Cron expression
 */
export function generateCronExpression(
  frequency: ReportFrequency,
  day?: string,
  time: string = '09:00'
): string {
  const [hour, minute] = time.split(':').map(Number);

  switch (frequency) {
    case 'daily':
      // Todos los días a la hora especificada
      return `${minute} ${hour} * * *`;

    case 'weekly': {
      // Un día específico de la semana
      const dayOfWeek = getDayOfWeekNumber(day || 'monday');
      return `${minute} ${hour} * * ${dayOfWeek}`;
    }

    case 'biweekly': {
      // Cada 2 semanas (lunes por defecto)
      // Nota: Cron no soporta "cada 2 semanas" nativamente
      // Solución: ejecutar cada lunes y en el edge function validar si han pasado 14 días
      const dayOfWeek = getDayOfWeekNumber(day || 'monday');
      return `${minute} ${hour} * * ${dayOfWeek}`;
    }

    case 'monthly':
      // Día 1 de cada mes
      return `${minute} ${hour} 1 * *`;

    case 'custom':
      // Se espera que el usuario proporcione la expresión completa
      throw new Error(
        'Para frecuencia "custom", proporciona la cron expression manualmente'
      );

    default:
      throw new Error(`Frecuencia no soportada: ${frequency}`);
  }
}

/**
 * Convertir nombre de día a número (0-6, donde 0 = domingo)
 * @param day - Nombre del día en inglés
 * @returns Número del día
 */
function getDayOfWeekNumber(day: string): number {
  const days: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const dayLower = day.toLowerCase();
  if (!(dayLower in days)) {
    throw new Error(`Día inválido: ${day}`);
  }

  return days[dayLower];
}

/**
 * Validar si una cron expression es válida
 * @param cronExpression - Expresión cron
 * @returns true si es válida
 */
export function isValidCronExpression(cronExpression: string): boolean {
  // Formato básico: "minute hour day month dayOfWeek"
  const parts = cronExpression.trim().split(/\s+/);

  if (parts.length !== 5) {
    return false;
  }

  const [minute, hour, day, month, dayOfWeek] = parts;

  // Validar cada parte
  return (
    isValidCronPart(minute, 0, 59) &&
    isValidCronPart(hour, 0, 23) &&
    isValidCronPart(day, 1, 31) &&
    isValidCronPart(month, 1, 12) &&
    isValidCronPart(dayOfWeek, 0, 6)
  );
}

/**
 * Validar una parte individual de cron expression
 * @param part - Parte de la expresión (*, número, rango, lista)
 * @param min - Valor mínimo permitido
 * @param max - Valor máximo permitido
 * @returns true si es válida
 */
function isValidCronPart(part: string, min: number, max: number): boolean {
  // Asterisco (todos)
  if (part === '*') return true;

  // Número individual
  if (/^\d+$/.test(part)) {
    const num = parseInt(part, 10);
    return num >= min && num <= max;
  }

  // Rango (ej: 1-5)
  if (/^\d+-\d+$/.test(part)) {
    const [start, end] = part.split('-').map(Number);
    return start >= min && end <= max && start <= end;
  }

  // Lista (ej: 1,3,5)
  if (/^\d+(,\d+)+$/.test(part)) {
    const numbers = part.split(',').map(Number);
    return numbers.every((num) => num >= min && num <= max);
  }

  // Paso (ej: */5 o 0-10/2)
  if (part.includes('/')) {
    const [range, step] = part.split('/');
    const stepNum = parseInt(step, 10);

    if (isNaN(stepNum) || stepNum <= 0) return false;

    if (range === '*') return true;

    // Verificar rango antes del paso
    return isValidCronPart(range, min, max);
  }

  return false;
}

/**
 * Calcular próxima ejecución basada en cron expression
 * (Implementación simplificada - para producción usar librería como 'cron-parser')
 * @param cronExpression - Expresión cron
 * @param timezone - Timezone (ej: 'America/Caracas')
 * @returns ISO string de próxima ejecución
 */
export function getNextExecution(
  cronExpression: string,
  timezone: string = 'UTC'
): string {
  // Esta es una implementación simplificada
  // En producción, usar librería 'cron-parser' con soporte de timezone

  const now = new Date();
  const [minute, hour, day, month, dayOfWeek] = cronExpression.split(' ');

  // Calcular próxima fecha (simplificado - asume ejecución diaria/semanal)
  const next = new Date(now);

  // Si es hora/minuto específico
  if (hour !== '*' && minute !== '*') {
    next.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

    // Si ya pasó hoy, mover a mañana
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  }

  return next.toISOString();
}

/**
 * Describir cron expression en lenguaje humano
 * @param cronExpression - Expresión cron
 * @param timezone - Timezone
 * @returns Descripción legible
 */
export function describeCronExpression(
  cronExpression: string,
  timezone: string = 'UTC'
): string {
  const [minute, hour, day, month, dayOfWeek] = cronExpression.split(' ');

  // Casos comunes
  if (dayOfWeek !== '*' && hour !== '*' && minute !== '*') {
    const dayName = getDayName(parseInt(dayOfWeek, 10));
    return `Cada ${dayName} a las ${hour}:${minute.padStart(2, '0')} (${timezone})`;
  }

  if (day !== '*' && month === '*' && hour !== '*' && minute !== '*') {
    return `Día ${day} de cada mes a las ${hour}:${minute.padStart(2, '0')} (${timezone})`;
  }

  if (day === '*' && month === '*' && dayOfWeek === '*' && hour !== '*' && minute !== '*') {
    return `Todos los días a las ${hour}:${minute.padStart(2, '0')} (${timezone})`;
  }

  return `Cron: ${cronExpression} (${timezone})`;
}

/**
 * Obtener nombre de día desde número
 * @param dayNum - Número de día (0-6)
 * @returns Nombre en español
 */
function getDayName(dayNum: number): string {
  const days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];
  return days[dayNum] || 'Desconocido';
}

/**
 * Slugify nombre de proyecto
 * @param name - Nombre del proyecto
 * @returns Slug (ej: "Delix Cafe" -> "delix-cafe")
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD') // Descomponer acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, ''); // Eliminar guiones al inicio/fin
}

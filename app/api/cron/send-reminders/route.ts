import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const resendApiKey = process.env.RESEND_API_KEY!

const DEFAULT_ADMIN_EMAIL = process.env.REMINDER_EMAIL || 'teamcitrica+citrica@gmail.com'
const TIMEZONE = process.env.TIMEZONE || 'America/Lima'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/**
 * Verifica si mañana coincide con el patrón de recurrencia del recordatorio.
 * Se usa para decidir si se debe enviar la notificación hoy (un día antes).
 */
function matchesRecurrence(
  recurring: string,
  bookingDate: string,
  tomorrowDate: Date,
  tomorrowStr: string
): boolean {
  const tomorrowDay = tomorrowDate.getDay() // 0=Dom, 6=Sáb

  switch (recurring) {
    case 'daily':
      return true

    case 'weekly': {
      const [y, m, d] = bookingDate.split('-').map(Number)
      const originalDay = new Date(y, m - 1, d).getDay()
      return tomorrowDay === originalDay
    }

    case 'monthly': {
      const [y, m, d] = bookingDate.split('-').map(Number)
      const originalDate = new Date(y, m - 1, d)
      const originalDayOfWeek = originalDate.getDay()
      const originalWeekIndex = Math.floor((d - 1) / 7)
      const tomorrowWeekIndex = Math.floor((tomorrowDate.getDate() - 1) / 7)
      return tomorrowDay === originalDayOfWeek && tomorrowWeekIndex === originalWeekIndex
    }

    case 'yearly': {
      const monthDay = bookingDate.slice(5) // 'MM-DD'
      return monthDay === tomorrowStr.slice(5)
    }

    case 'weekdays':
      return tomorrowDay >= 1 && tomorrowDay <= 5

    default: {
      // Intentar parsear como JSON (recurrencia personalizada)
      try {
        const config = JSON.parse(recurring)
        return matchesCustomRecurrence(config, bookingDate, tomorrowDate, tomorrowStr)
      } catch {
        return false
      }
    }
  }
}

/**
 * Verifica si mañana coincide con una recurrencia personalizada (JSON).
 */
function matchesCustomRecurrence(
  config: { interval: number; unit: string; days: string[]; endType: string; endDate: string; endCount: number },
  bookingDate: string,
  tomorrowDate: Date,
  tomorrowStr: string
): boolean {
  const [by, bm, bd] = bookingDate.split('-').map(Number)
  const startDate = new Date(by, bm - 1, bd)

  // Verificar si ya pasó la fecha de fin
  if (config.endType === 'date' && config.endDate && tomorrowStr > config.endDate) return false

  const diffMs = tomorrowDate.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays < 0) return false

  switch (config.unit) {
    case 'day':
      return diffDays % config.interval === 0

    case 'week': {
      const weeksSinceStart = Math.floor(diffDays / 7)
      if (weeksSinceStart % config.interval !== 0) return false
      return config.days.includes(String(tomorrowDate.getDay()))
    }

    case 'month': {
      const monthsDiff =
        (tomorrowDate.getFullYear() - startDate.getFullYear()) * 12 +
        (tomorrowDate.getMonth() - startDate.getMonth())
      if (monthsDiff < 0 || monthsDiff % config.interval !== 0) return false
      return tomorrowDate.getDate() === startDate.getDate()
    }

    case 'year': {
      const yearsDiff = tomorrowDate.getFullYear() - startDate.getFullYear()
      if (yearsDiff < 0 || yearsDiff % config.interval !== 0) return false
      return (
        tomorrowDate.getMonth() === startDate.getMonth() &&
        tomorrowDate.getDate() === startDate.getDate()
      )
    }

    default:
      return false
  }
}

/**
 * GET /api/cron/send-reminders
 *
 * Busca recordatorios para notificar un día antes del evento.
 * Soporta: none, daily, weekly, monthly, yearly, weekdays, custom (JSON).
 *
 * Protegido por CRON_SECRET para evitar llamadas no autorizadas.
 */
export async function GET(request: Request) {
  const resend = new Resend(resendApiKey)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const tomorrowStr = tomorrow.toLocaleDateString('en-CA', { timeZone: TIMEZONE })

    // Traer TODOS los recordatorios activos
    const { data: allDbReminders, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'reminder')

    if (fetchError) {
      console.error('Error al consultar recordatorios:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Filtrar los que deben notificarse mañana
    const remindersToSend = (allDbReminders || []).filter((r) => {
      if (!r.booking_date) return false

      // Ya notificado para esta fecha
      if (r.last_notified_date === tomorrowStr) return false

      const recurring = r.recurring || 'none'

      if (recurring === 'none' || !recurring) {
        // One-time: fecha exacta de mañana, no notificado
        return r.booking_date === tomorrowStr && !r.notified
      }

      // Recurrente: verificar si mañana coincide con el patrón
      return matchesRecurrence(recurring, r.booking_date, tomorrow, tomorrowStr)
    })

    if (remindersToSend.length === 0) {
      return NextResponse.json({ message: 'No hay recordatorios pendientes para mañana', sent: 0 })
    }

    let sentCount = 0
    const errors: string[] = []

    for (const reminder of remindersToSend) {
      const toEmail = reminder.notification_email || DEFAULT_ADMIN_EMAIL

      // Formatear el horario
      const timeSlots = reminder.time_slots || []
      let timeLabel = 'Todo el día'
      if (timeSlots.length === 1 && timeSlots[0].includes('-')) {
        const [start, end] = timeSlots[0].split('-')
        if (start === '00:00' && end === '23:59') {
          timeLabel = 'Todo el día'
        } else {
          timeLabel = `${start} a ${end}`
        }
      } else if (timeSlots.length > 0 && timeSlots[0] !== '00:00') {
        timeLabel = `${timeSlots[0]} - ${timeSlots[timeSlots.length - 1]}`
      }

      try {
        await resend.emails.send({
          from: 'Citrica Agenda <onboarding@resend.dev>',
          to: toEmail,
          subject: `Recordatorio: ${reminder.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <div style="background: #16305A; color: white; padding: 16px 20px; border-radius: 12px 12px 0 0;">
                <h2 style="margin: 0; font-size: 18px;">Recordatorio de Agenda</h2>
              </div>
              <div style="border: 1px solid #D4DEED; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                <h3 style="color: #16305A; margin-top: 0;">${reminder.name}</h3>
                <p style="color: #265197; margin: 8px 0;">
                  <strong>Fecha:</strong> ${tomorrowStr}<br/>
                  <strong>Horario:</strong> ${timeLabel}
                </p>
                ${reminder.description ? `<p style="color: #265197; margin: 8px 0;"><strong>Descripción:</strong> ${reminder.description}</p>` : ''}
                ${reminder.message ? `<p style="color: #265197; margin: 8px 0; padding-top: 12px; border-top: 1px solid #D4DEED;"><strong>Mensaje:</strong><br/>${reminder.message}</p>` : ''}
                <p style="color: #94A3B8; font-size: 12px; margin-top: 20px;">
                  Enviado automáticamente desde Citrica Agenda
                </p>
              </div>
            </div>
          `,
        })

        // Marcar como notificado
        const recurring = reminder.recurring || 'none'
        if (recurring === 'none' || !recurring) {
          // One-time: marcar como notificado permanentemente
          await supabase
            .from('bookings')
            .update({ notified: true })
            .eq('id', reminder.id)
        } else {
          // Recurrente: guardar la fecha de la última notificación
          await supabase
            .from('bookings')
            .update({ last_notified_date: tomorrowStr })
            .eq('id', reminder.id)
        }

        sentCount++
      } catch (emailError) {
        const errMsg = `Error enviando email para "${reminder.name}": ${emailError}`
        console.error(errMsg)
        errors.push(errMsg)
      }
    }

    return NextResponse.json({
      message: `Recordatorios procesados`,
      total: remindersToSend.length,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('Error general en send-reminders:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

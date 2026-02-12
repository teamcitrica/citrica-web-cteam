import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const resendApiKey = process.env.RESEND_API_KEY!

// Configuración por variables de entorno (flexible para cambiar sin tocar código)
const DEFAULT_ADMIN_EMAIL = process.env.REMINDER_EMAIL || 'teamcitrica+citrica@gmail.com'
const TIMEZONE = process.env.TIMEZONE || 'America/Lima'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const resend = new Resend(resendApiKey)

/**
 * GET /api/cron/send-reminders
 *
 * Busca recordatorios para notificar un día antes del evento:
 * - Recordatorios únicos (recurring='none'): fecha exacta de mañana, no notificados.
 * - Recordatorios anuales (recurring='yearly'): mismo mes-día que mañana,
 *   no notificados este año (usa last_notified_year).
 *
 * Protegido por CRON_SECRET para evitar llamadas no autorizadas.
 */
export async function GET(request: Request) {
  // Verificar autenticación del cron (opcional pero recomendado)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Obtener fecha de mañana en formato YYYY-MM-DD (zona horaria configurable)
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const tomorrowStr = tomorrow.toLocaleDateString('en-CA', { timeZone: TIMEZONE })
    const tomorrowMonthDay = tomorrowStr.slice(5) // 'MM-DD'
    const currentYear = parseInt(tomorrowStr.slice(0, 4))

    // 1. Recordatorios únicos: fecha exacta de mañana, no notificados
    const { data: oneTimeReminders, error: oneTimeError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'reminder')
      .eq('booking_date', tomorrowStr)
      .or('recurring.is.null,recurring.eq.none')
      .eq('notified', false)

    if (oneTimeError) {
      console.error('Error al consultar recordatorios únicos:', oneTimeError)
      return NextResponse.json({ error: oneTimeError.message }, { status: 500 })
    }

    // 2. Recordatorios anuales: traer todos los yearly y filtrar por mes-día en JS
    const { data: yearlyReminders, error: yearlyError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'reminder')
      .eq('recurring', 'yearly')

    if (yearlyError) {
      console.error('Error al consultar recordatorios anuales:', yearlyError)
      return NextResponse.json({ error: yearlyError.message }, { status: 500 })
    }

    // Filtrar anuales: mismo mes-día que mañana Y no notificados este año
    const yearlyToSend = (yearlyReminders || []).filter((r) => {
      if (!r.booking_date) return false
      const monthDay = r.booking_date.slice(5) // 'MM-DD'
      return monthDay === tomorrowMonthDay && r.last_notified_year !== currentYear
    })

    const allReminders = [...(oneTimeReminders || []), ...yearlyToSend]

    if (allReminders.length === 0) {
      return NextResponse.json({ message: 'No hay recordatorios pendientes para mañana', sent: 0 })
    }

    let sentCount = 0
    const errors: string[] = []

    for (const reminder of allReminders) {
      const toEmail = reminder.notification_email || DEFAULT_ADMIN_EMAIL

      // Formatear el horario
      const timeSlots = reminder.time_slots || []
      let timeLabel = 'Todo el día'
      if (timeSlots.length === 1 && timeSlots[0].includes('-')) {
        const [start, end] = timeSlots[0].split('-')
        timeLabel = `${start} a ${end}`
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
                  <strong>Fecha:</strong> ${reminder.booking_date}<br/>
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
        if (reminder.recurring === 'yearly') {
          // Anuales: guardar el año en que fue notificado
          await supabase
            .from('bookings')
            .update({ last_notified_year: currentYear })
            .eq('id', reminder.id)
        } else {
          // Únicos: marcar como notificado permanentemente
          await supabase
            .from('bookings')
            .update({ notified: true })
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
      total: allReminders.length,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('Error general en send-reminders:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

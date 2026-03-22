import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY!
const ADMIN_EMAIL = process.env.REMINDER_EMAIL || 'teamcitrica+citrica@gmail.com'

export async function POST(request: Request) {
  const resend = new Resend(resendApiKey)

  try {
    const { name, email, phone, phoneCode, date, timeSlot, message } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 })
    }

    const phoneDisplay = phoneCode && phone ? `${phoneCode} ${phone}` : phone || 'No proporcionado'
    const dateDisplay = date || 'No seleccionada'
    const timeDisplay = timeSlot || 'No seleccionado'

    // Enviar ambos emails en paralelo
    const [adminResult, userResult] = await Promise.allSettled([
      // Email 1: Notificacion al admin
      resend.emails.send({
        from: 'Citrica Agenda <onboarding@resend.dev>',
        to: ADMIN_EMAIL,
        subject: `Nuevo registro: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #16305A; color: white; padding: 16px 20px; border-radius: 12px 12px 0 0;">
              <h2 style="margin: 0; font-size: 18px;">Nuevo Registro en Citrica</h2>
            </div>
            <div style="border: 1px solid #D4DEED; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
              <p style="color: #265197; margin: 8px 0;"><strong>Nombre:</strong> ${name}</p>
              <p style="color: #265197; margin: 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #265197; margin: 8px 0;"><strong>Telefono:</strong> ${phoneDisplay}</p>
              <p style="color: #265197; margin: 8px 0;"><strong>Fecha solicitada:</strong> ${dateDisplay}</p>
              <p style="color: #265197; margin: 8px 0;"><strong>Horario:</strong> ${timeDisplay}</p>
              ${message ? `<p style="color: #265197; margin: 8px 0; padding-top: 12px; border-top: 1px solid #D4DEED;"><strong>Mensaje:</strong><br/>${message}</p>` : ''}
              <p style="color: #94A3B8; font-size: 12px; margin-top: 20px;">
                Enviado automaticamente desde Citrica Agenda
              </p>
            </div>
          </div>
        `,
      }),
      // Email 2: Confirmacion al usuario
      resend.emails.send({
        from: 'Citrica Agenda <onboarding@resend.dev>',
        to: email,
        subject: 'Gracias por tu registro en Citrica!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #16305A; color: white; padding: 16px 20px; border-radius: 12px 12px 0 0;">
              <h2 style="margin: 0; font-size: 18px;">Registro Recibido!</h2>
            </div>
            <div style="border: 1px solid #D4DEED; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
              <p style="color: #16305A; font-size: 16px; margin-top: 0;">Hola <strong>${name}</strong>,</p>
              <p style="color: #265197;">Hemos recibido tu solicitud correctamente. Nuestro equipo se pondra en contacto contigo a la brevedad.</p>
              <div style="background: #F0F4FA; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="color: #265197; margin: 4px 0;"><strong>Fecha:</strong> ${dateDisplay}</p>
                <p style="color: #265197; margin: 4px 0;"><strong>Horario:</strong> ${timeDisplay}</p>
              </div>
              <p style="color: #94A3B8; font-size: 12px; margin-top: 20px;">
                Enviado automaticamente desde Citrica Agenda
              </p>
            </div>
          </div>
        `,
      }),
    ])

    return NextResponse.json({
      success: true,
      adminEmail: adminResult.status === 'fulfilled' ? 'sent' : 'failed',
      userEmail: userResult.status === 'fulfilled' ? 'sent' : 'failed',
    })
  } catch (err) {
    console.error('Error en registration-notification:', err)
    return NextResponse.json({ error: 'Error al enviar notificaciones' }, { status: 500 })
  }
}

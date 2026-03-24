import { NextResponse } from 'next/server'
import { sendWhatsAppTemplate } from '@/shared/utils/whatsapp'

export async function POST(request: Request) {
  try {
    const { name, email, phone } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })
    }

    // ⚠️ Lee los números admin desde la variable de entorno
    // Puede ser uno: "51925201579" o varios: "51925201579,51987654321"
    const adminPhones = process.env.WHATSAPP_ADMIN_PHONES?.split(',') || []

    // ⚠️ Lee el nombre del template desde la variable de entorno
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'notificacion_reserva_yashifoods'

    if (adminPhones.length === 0) {
      return NextResponse.json({ error: 'No hay números admin configurados' }, { status: 500 })
    }

    // ⚠️ Envía a TODOS los admin en paralelo
    const results = await Promise.all(
      adminPhones.map((adminPhone) =>
        sendWhatsAppTemplate({
          to: adminPhone.trim(),
          templateName,
          // ⚠️ AQUÍ es donde se mapean los datos del formulario al template
          // Estos nombres DEBEN coincidir con los {{variables}} del template en Meta:
          // {{nombre_cliente}}, {{correo_cliente}}, {{telefono_cliente}}
          parameters: [
            { name: 'nombre_cliente', value: name },
            { name: 'correo_cliente', value: email || 'No proporcionado' },
            { name: 'telefono_cliente', value: phone || 'No proporcionado' },
          ],
        })
      )
    )

    const sent = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success)

    if (failed.length > 0) {
      console.error('Errores WhatsApp:', failed.map((f) => f.error))
    }

    return NextResponse.json({
      success: true,
      sent,
      total: adminPhones.length,
      errors: failed.length > 0 ? failed.map((f) => f.error) : undefined,
    })
  } catch (err) {
    console.error('Error en notificación WhatsApp:', err)
    return NextResponse.json({ error: 'Error al enviar WhatsApp' }, { status: 500 })
  }
}

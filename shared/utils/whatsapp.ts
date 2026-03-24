interface WhatsAppTemplateParams {
  to: string;
  templateName: string;
  languageCode?: string;
  parameters: { name: string; value: string }[];
}

interface WhatsAppResult {
  success: boolean;
  error?: string;
}

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = "es_PE",  // ⚠️ Idioma del template, debe coincidir con el que aprobaste en Meta
  parameters,
}: WhatsAppTemplateParams): Promise<WhatsAppResult> {
  const token = process.env.WHATSAPP_API_TOKEN;           // ⚠️ Token secreto de Meta
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID; // ⚠️ ID del número de WhatsApp Business

  if (!token || !phoneNumberId) {
    return { success: false, error: "Faltan variables de entorno de WhatsApp" };
  }

  // ⚠️ Este es el body que Meta espera para mensajes de template
  const body = {
    messaging_product: "whatsapp",
    to,                    // Número destino con código de país (ej: "51925201579")
    type: "template",
    template: {
      name: templateName,  // Nombre exacto del template aprobado en Meta
      language: { code: languageCode },
      components: [
        {
          type: "body",
          // ⚠️ Cada parámetro se mapea al {{nombre}} del template
          parameters: parameters.map((p) => ({
            type: "text",
            parameter_name: p.name,  // "nombre_cliente", "correo_cliente", etc.
            text: p.value,
          })),
        },
      ],
    },
  };

  try {
    // ⚠️ Endpoint oficial de Meta Graph API v22.0
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || JSON.stringify(data);
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

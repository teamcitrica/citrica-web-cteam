import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Crear cliente de Supabase con Service Role Key (SOLO para servidor)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ NUNCA expongas esta key en el cliente
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name, last_name, role_id } = await request.json();

    console.log('📥 Recibiendo solicitud para crear usuario:', { email, first_name, last_name, role_id });

    // Validar datos
    if (!email || !password || !first_name || !last_name || !role_id) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Crear usuario con Admin API (NO inicia sesión en el cliente)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        first_name,
        last_name,
        role_id: Number(role_id),
      }
    });

    if (authError) {
      console.error('❌ Error creando usuario en auth:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    console.log('✅ Usuario creado en auth.users:', authData.user.id);

    // Esperar un momento para que el trigger de Supabase cree el registro en public.users
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      user: authData.user,
      message: 'Usuario creado correctamente'
    });

  } catch (error: any) {
    console.error('❌ Error en create-user API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

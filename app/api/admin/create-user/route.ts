import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role_id, first_name, last_name } = await request.json();

    // Validar datos requeridos
    if (!email || !password || !role_id) {
      return NextResponse.json(
        { error: 'Email, password y role_id son requeridos' },
        { status: 400 }
      );
    }

    // Crear cliente Admin con service_role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Variables de entorno no configuradas');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Crear usuario en auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        role_id,
        first_name,
        last_name,
      },
    });

    if (authError) {
      console.error('Error al crear usuario en auth:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    console.log('✅ Usuario creado en auth.users:', authData.user.id);

    // Insertar o actualizar en la tabla public.users
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authData.user.id,
        email,
        first_name,
        last_name,
        role_id,
      });

    if (userError) {
      console.error('Error al crear registro en public.users:', userError);
      console.error('Detalles del error:', {
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        code: userError.code,
      });

      // Rollback: eliminar usuario de auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: `Error al crear perfil de usuario: ${userError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Usuario creado en public.users');

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role_id,
      },
    });
  } catch (error: any) {
    console.error('Error general en create-user:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

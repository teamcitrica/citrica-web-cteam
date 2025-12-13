import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    // Validar datos requeridos
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id es requerido' },
        { status: 400 }
      );
    }

    // Crear cliente Admin con service_role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Variables de entorno no configuradas');
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

    console.log('🔴 Eliminando usuario:', user_id);

    // 1. Primero eliminar de auth.users usando admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (authError) {
      console.error('❌ Error al eliminar de auth.users:', authError);
      return NextResponse.json(
        { error: `Error al eliminar autenticación: ${authError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Usuario eliminado de auth.users');

    // 2. Luego eliminar de public.users
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', user_id);

    if (deleteError) {
      console.error('❌ Error al eliminar de public.users:', deleteError);
      // Si falla, el usuario ya se eliminó de auth pero no de public
      // Esto está bien, public.users se puede limpiar manualmente si es necesario
      return NextResponse.json(
        {
          success: true,
          partial: true,
          warning: 'Usuario eliminado de auth pero falló en public.users'
        }
      );
    }

    console.log('✅ Usuario eliminado completamente');

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente',
    });
  } catch (error: any) {
    console.error('Error general en delete-user:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

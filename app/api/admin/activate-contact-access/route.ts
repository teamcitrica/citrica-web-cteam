import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Función para generar contraseña temporal
function generateTemporaryPassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const { contact_id, generate_password = true } = await request.json();

    // Validar datos requeridos
    if (!contact_id) {
      return NextResponse.json(
        { error: 'contact_id es requerido' },
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

    // 1. Obtener datos del contacto
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contact_clients')
      .select('*')
      .eq('id', contact_id)
      .single();

    if (contactError || !contact) {
      console.error('Error al obtener contacto:', contactError);
      return NextResponse.json(
        { error: 'Contacto no encontrado' },
        { status: 404 }
      );
    }

    // 2. Verificar si el contacto ya tiene acceso
    if (contact.user_id) {
      return NextResponse.json(
        { error: 'Este contacto ya tiene acceso al sistema' },
        { status: 400 }
      );
    }

    // 3. Validar que el contacto tenga email
    if (!contact.email) {
      return NextResponse.json(
        { error: 'El contacto debe tener un email válido' },
        { status: 400 }
      );
    }

    // 4. Generar contraseña temporal
    const temporaryPassword = generate_password ? generateTemporaryPassword() : undefined;

    if (!temporaryPassword) {
      return NextResponse.json(
        { error: 'No se pudo generar la contraseña temporal' },
        { status: 500 }
      );
    }

    // 5. Crear usuario en auth.users con role_id = 12 (Cliente)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: contact.email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        role_id: 12,
        first_name: contact.name?.split(' ')[0] || 'Cliente',
        last_name: contact.name?.split(' ').slice(1).join(' ') || '',
        contact_id: contact_id,
      },
    });

    if (authError) {
      console.error('Error al crear usuario en auth:', authError);
      return NextResponse.json(
        { error: `Error al crear usuario: ${authError.message}` },
        { status: 400 }
      );
    }

    console.log('✅ Usuario creado en auth.users:', authData.user.id);

    // 6. Crear/actualizar registro en public.users (usar upsert por si ya existe)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authData.user.id,
        email: contact.email,
        first_name: contact.name?.split(' ')[0] || 'Cliente',
        last_name: contact.name?.split(' ').slice(1).join(' ') || '',
        role_id: 12,
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.error('Error al crear registro en public.users:', userError);

      // Rollback: eliminar usuario de auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: `Error al crear perfil de usuario: ${userError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Usuario creado en public.users');

    // 7. Actualizar contact_clients con user_id y has_system_access
    const { error: updateError } = await supabaseAdmin
      .from('contact_clients')
      .update({
        user_id: authData.user.id,
        has_system_access: true,
      })
      .eq('id', contact_id);

    if (updateError) {
      console.error('Error al actualizar contacto:', updateError);

      // Rollback: eliminar usuario de auth y public.users
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      await supabaseAdmin.from('users').delete().eq('id', authData.user.id);

      return NextResponse.json(
        { error: `Error al vincular contacto con usuario: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Contacto actualizado con acceso al sistema');

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role_id: 12,
      },
      temporary_password: temporaryPassword,
      message: 'Acceso activado correctamente. Envía la contraseña temporal al contacto por un canal seguro.',
    });
  } catch (error: any) {
    console.error('Error general en activate-contact-access:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para desactivar acceso de un contacto
export async function DELETE(request: NextRequest) {
  try {
    const { contact_id } = await request.json();

    if (!contact_id) {
      return NextResponse.json(
        { error: 'contact_id es requerido' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
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

    // Obtener el contacto con su user_id
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contact_clients')
      .select('user_id')
      .eq('id', contact_id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: 'Contacto no encontrado' },
        { status: 404 }
      );
    }

    if (!contact.user_id) {
      return NextResponse.json(
        { error: 'Este contacto no tiene acceso al sistema' },
        { status: 400 }
      );
    }

    // Eliminar usuario de auth.users (esto también eliminará de public.users por CASCADE)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
      contact.user_id
    );

    if (deleteAuthError) {
      console.error('Error al eliminar usuario de auth:', deleteAuthError);
      return NextResponse.json(
        { error: `Error al desactivar acceso: ${deleteAuthError.message}` },
        { status: 500 }
      );
    }

    // Actualizar contact_clients
    const { error: updateError } = await supabaseAdmin
      .from('contact_clients')
      .update({
        user_id: null,
        has_system_access: false,
      })
      .eq('id', contact_id);

    if (updateError) {
      console.error('Error al actualizar contacto:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Acceso desactivado correctamente',
    });
  } catch (error: any) {
    console.error('Error en DELETE activate-contact-access:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

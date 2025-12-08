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
    const {
      contact_id,
      generate_password = true,
      user_data
    } = await request.json();

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
    console.log('🔍 Buscando contacto con ID:', contact_id);
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contact_clients')
      .select('*')
      .eq('id', contact_id)
      .single();

    if (contactError || !contact) {
      console.error('❌ Error al obtener contacto:', contactError);
      return NextResponse.json(
        { error: 'Contacto no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Contacto encontrado:', {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      company_id: contact.company_id,
      has_system_access: contact.has_system_access,
      user_id: contact.user_id,
    });

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

    // 4. Verificar si el email ya existe en auth.users
    console.log('🔍 Verificando si el email ya existe:', contact.email);
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingAuthUsers?.users?.some(u => u.email === contact.email);

    if (emailExists) {
      console.error('❌ Email ya existe en auth.users:', contact.email);
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email en el sistema' },
        { status: 400 }
      );
    }
    console.log('✅ Email no existe, se puede crear el usuario');

    // 5. Generar contraseña temporal
    const temporaryPassword = generate_password ? generateTemporaryPassword() : undefined;

    if (!temporaryPassword) {
      return NextResponse.json(
        { error: 'No se pudo generar la contraseña temporal' },
        { status: 500 }
      );
    }

    // 6. Preparar datos del usuario
    // Usar datos proporcionados por el usuario o parsear del nombre del contacto
    const firstName = user_data?.first_name || contact.name?.split(' ')[0] || 'Cliente';
    const lastName = user_data?.last_name || contact.name?.split(' ').slice(1).join(' ') || '';
    const fullName = user_data?.full_name || contact.name || 'Cliente';
    const roleId = user_data?.role_id || 12;
    const avatarUrl = user_data?.avatar_url || null;

    console.log('📝 Datos del usuario a crear:', {
      email: contact.email,
      firstName,
      lastName,
      fullName,
      roleId,
      avatarUrl,
      companyId: contact.company_id,
    });

    console.log('🔐 Contraseña temporal generada (longitud):', temporaryPassword?.length);

    // 7. Crear usuario en auth.users
    console.log('⏳ Intentando crear usuario en auth.users...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: contact.email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        role_id: roleId,
        first_name: firstName,
        last_name: lastName,
        company_id: contact.company_id,
        avatar_url: avatarUrl,
        contact_id: contact_id,
      },
    });
    console.log('✅ Respuesta de createUser recibida');

    if (authError) {
      console.error('❌ Error completo al crear usuario en auth:', JSON.stringify(authError, null, 2));
      console.error('❌ Mensaje de error:', authError.message);
      console.error('❌ Código de error:', authError.code);
      console.error('❌ Status de error:', authError.status);

      // Dar mensaje más específico según el error
      let errorMessage = 'Error al crear usuario';
      if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
        errorMessage = 'Ya existe un usuario con este email';
      } else if (authError.message?.includes('invalid email') || authError.message?.includes('invalid_email')) {
        errorMessage = 'El formato del email no es válido';
      } else if (authError.message?.includes('Database error')) {
        errorMessage = `Error de base de datos: ${authError.message}. Verifica que el email sea válido y que no exista otro usuario con el mismo email.`;
      } else {
        errorMessage = authError.message || 'Error desconocido al crear usuario';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    console.log('✅ Usuario creado en auth.users:', authData.user.id);

    // 8. Crear registro en public.users
    // NOTA: full_name es una columna generada, no la incluimos en el insert
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: contact.email,
        first_name: firstName,
        last_name: lastName,
        role_id: roleId,
        company_id: contact.company_id,
        avatar_url: avatarUrl,
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

    // 9. Actualizar contact_clients con user_id, has_system_access y active_users
    const { error: updateError } = await supabaseAdmin
      .from('contact_clients')
      .update({
        user_id: authData.user.id,
        has_system_access: true,
        active_users: true,
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
        active_users: false,
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

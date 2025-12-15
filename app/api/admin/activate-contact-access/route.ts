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
      user_data,
      password, // Contraseña proporcionada desde el formulario
      email_access, // Email de acceso proporcionado desde el formulario
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
      .from('contact')
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
      user_id: contact.user_id,
    });

    // 2. Verificar si es una reactivación (ya tiene user_id) o creación nueva
    if (contact.user_id) {
      console.log('🔄 Reactivando acceso para usuario existente:', contact.user_id);

      // Obtener datos del usuario existente
      const { data: existingUser, error: getUserError } = await supabaseAdmin
        .from('users')
        .select('email, first_name, last_name, role_id, company_id')
        .eq('id', contact.user_id)
        .single();

      if (getUserError) {
        console.error('❌ Error al obtener datos del usuario:', getUserError);
        return NextResponse.json(
          { error: `Error al obtener datos del usuario: ${getUserError.message}` },
          { status: 500 }
        );
      }

      // Reactivar usando upsert (esto funciona porque upsert tiene permisos)
      const { error: reactivateError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: contact.user_id,
          email: existingUser.email,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name,
          role_id: existingUser.role_id,
          company_id: existingUser.company_id,
          active_users: true,
        });

      if (reactivateError) {
        console.error('❌ Error al reactivar acceso:', reactivateError);
        return NextResponse.json(
          { error: `Error al reactivar acceso: ${reactivateError.message}` },
          { status: 500 }
        );
      }

      console.log('✅ Acceso reactivado correctamente');

      return NextResponse.json({
        success: true,
        reactivated: true,
        user: {
          id: contact.user_id,
          email: contact.email_access || contact.email,
        },
        message: 'Acceso reactivado correctamente',
      });
    }

    // 3. Validar que el contacto tenga email
    if (!contact.email) {
      return NextResponse.json(
        { error: 'El contacto debe tener un email válido' },
        { status: 400 }
      );
    }

    // 4. Determinar el email a usar (email_access si está disponible, sino el email normal)
    const emailToUse = email_access || contact.email;

    if (!emailToUse) {
      return NextResponse.json(
        { error: 'Se requiere un email para crear el usuario' },
        { status: 400 }
      );
    }

    // 5. Usar la contraseña proporcionada o generar una temporal
    const temporaryPassword = password || (generate_password ? generateTemporaryPassword() : undefined);

    if (!temporaryPassword) {
      return NextResponse.json(
        { error: 'Se requiere una contraseña' },
        { status: 400 }
      );
    }

    // 6. Preparar datos del usuario
    const firstName = user_data?.first_name || contact.name?.split(' ')[0] || 'Cliente';
    const lastName = user_data?.last_name || contact.name?.split(' ').slice(1).join(' ') || '';
    // Determinar role_id: Si viene en user_data lo usa, sino:
    // - company_id === 1 (Citrica) -> role_id = 1 (Admin/Staff)
    // - Otras empresas -> role_id = 12 (Cliente)
    const roleId = user_data?.role_id || (contact.company_id === 1 ? 1 : 12);
    const avatarUrl = user_data?.avatar_url || null;

    console.log('📝 Datos del usuario a crear:', {
      email: emailToUse,
      firstName,
      lastName,
      roleId,
      companyId: contact.company_id,
    });

    // 7. Llamar al endpoint create-user para crear el usuario
    console.log('⏳ Llamando a /api/admin/create-user...');

    // Construir URL base desde el request actual
    const baseUrl = new URL(request.url).origin;
    const createUserUrl = `${baseUrl}/api/admin/create-user`;

    const createUserResponse = await fetch(createUserUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailToUse,
        password: temporaryPassword,
        first_name: firstName,
        last_name: lastName,
        role_id: roleId,
        company_id: contact.company_id,
      }),
    });

    const createUserResult = await createUserResponse.json();

    if (!createUserResponse.ok) {
      console.error('❌ Error al crear usuario:', createUserResult.error);
      return NextResponse.json(
        { error: createUserResult.error || 'Error al crear usuario' },
        { status: createUserResponse.status }
      );
    }

    const userId = createUserResult.user.id;
    console.log('✅ Usuario creado exitosamente:', userId);

    // 8. Actualizar contact con user_id, email_access, code y last_name
    const { error: updateContactError } = await supabaseAdmin
      .from('contact')
      .update({
        user_id: userId,
        email_access: emailToUse,
        code: temporaryPassword,
        last_name: lastName,
      })
      .eq('id', contact_id);

    if (updateContactError) {
      console.error('Error al actualizar contacto:', updateContactError);

      // Rollback: eliminar usuario de auth y public.users
      await supabaseAdmin.auth.admin.deleteUser(userId);
      await supabaseAdmin.from('users').delete().eq('id', userId);

      return NextResponse.json(
        { error: `Error al vincular contacto con usuario: ${updateContactError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Contacto actualizado con acceso al sistema (active_users se estableció durante la creación del usuario)');

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: emailToUse,
        role_id: roleId,
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
      .from('contact')
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

    // Obtener datos del usuario existente
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('email, first_name, last_name, role_id, company_id')
      .eq('id', contact.user_id)
      .single();

    if (getUserError) {
      console.error('Error al obtener datos del usuario:', getUserError);
      return NextResponse.json(
        { error: `Error al obtener datos del usuario: ${getUserError.message}` },
        { status: 500 }
      );
    }

    // Desactivar usando upsert (esto funciona porque upsert tiene permisos)
    const { error: deactivateError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: contact.user_id,
        email: existingUser.email,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
        role_id: existingUser.role_id,
        company_id: existingUser.company_id,
        active_users: false,
      });

    if (deactivateError) {
      console.error('Error al desactivar usuario:', deactivateError);
      return NextResponse.json(
        { error: `Error al desactivar usuario: ${deactivateError.message}` },
        { status: 500 }
      );
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

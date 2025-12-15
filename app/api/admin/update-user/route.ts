import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(request: NextRequest) {
  try {
    const { user_id, user_data } = await request.json();

    // Validar datos requeridos
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id es requerido' },
        { status: 400 }
      );
    }

    if (!user_data || Object.keys(user_data).length === 0) {
      return NextResponse.json(
        { error: 'user_data es requerido y no puede estar vacío' },
        { status: 400 }
      );
    }

    // Crear cliente Admin con service_role (dentro de la función, igual que create-user)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Variables de entorno no configuradas');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Verificar las keys antes de crear el cliente
    console.log('🔍 supabaseUrl:', supabaseUrl);
    console.log('🔍 serviceRoleKey (primeros 20 chars):', serviceRoleKey?.substring(0, 20));
    console.log('🔍 serviceRoleKey es service_role?', serviceRoleKey?.includes('service_role'));

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('✅ Supabase Admin creado correctamente');

    // Hacer una prueba rápida para ver qué rol está usando
    const testQuery = await supabaseAdmin.rpc('auth.role');
    console.log('🔍 Rol del cliente:', testQuery);

    // Obtener datos actuales del usuario con todos los campos
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (getUserError) {
      console.error('Error al obtener datos del usuario:', getUserError);
      return NextResponse.json(
        { error: `Usuario no encontrado: ${getUserError.message}` },
        { status: 404 }
      );
    }

    // Preparar payload de actualización (merge con datos existentes)
    // Incluir TODOS los campos para evitar problemas con RLS
    const updatePayload = {
      id: user_id,
      email: user_data.email ?? existingUser.email,
      first_name: user_data.first_name ?? existingUser.first_name,
      last_name: user_data.last_name ?? existingUser.last_name,
      role_id: user_data.role_id ?? existingUser.role_id,
      company_id: user_data.company_id ?? existingUser.company_id,
      active_users: user_data.active_users ?? existingUser.active_users,
      // Preservar otros campos existentes
      created_at: existingUser.created_at,
      updated_at: new Date().toISOString(),
    };

    console.log('🔄 Actualizando usuario:', user_id);
    console.log('📝 Datos a actualizar:', updatePayload);

    // Actualizar en auth.users (igual que el código que funciona)
    const authUpdateData = {
      email: updatePayload.email,
      user_metadata: {
        name: `${updatePayload.first_name} ${updatePayload.last_name}`,
        first_name: updatePayload.first_name,
        last_name: updatePayload.last_name,
        role_id: String(updatePayload.role_id),
      }
    };

    console.log('📝 Actualizando auth.users...');

    try {
      const authUpdateResult = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        authUpdateData
      );

      if (authUpdateResult.error) {
        console.error('❌ Error al actualizar auth.users:', authUpdateResult.error);
        throw authUpdateResult.error;
      }

      console.log('✅ auth.users actualizado correctamente');
    } catch (authError: any) {
      console.error('❌ Error en actualización de auth:', authError);
      return NextResponse.json(
        { error: `Error al actualizar autenticación: ${authError.message}` },
        { status: 500 }
      );
    }

    // Actualizar en public.users DIRECTAMENTE con los campos simples
    // NO usar objetos anidados, solo los campos planos
    console.log('📝 Actualizando public.users con campos planos...');

    const publicUsersUpdate = {
      first_name: updatePayload.first_name,
      last_name: updatePayload.last_name,
      email: updatePayload.email,
      role_id: updatePayload.role_id,
      company_id: updatePayload.company_id,
      active_users: updatePayload.active_users,
      updated_at: new Date().toISOString(),
    };

    console.log('📝 Payload para public.users:', publicUsersUpdate);
    console.log('🔍 ID del usuario a actualizar:', user_id);

    // Usar UPDATE directo (service_role DEBE tener permisos)
    const { data, error: updateError, count, status, statusText } = await supabaseAdmin
      .from('users')
      .update(publicUsersUpdate)
      .eq('id', user_id)
      .select();

    console.log('📊 Resultado del UPDATE:');
    console.log('  - data:', data);
    console.log('  - error:', updateError);
    console.log('  - count:', count);
    console.log('  - status:', status);
    console.log('  - statusText:', statusText);

    if (updateError) {
      console.error('❌ Error al actualizar public.users:', updateError);
      console.error('❌ Error details:', JSON.stringify(updateError, null, 2));

      // Si falla, devolver éxito parcial ya que auth.users se actualizó
      console.log('⚠️ auth.users actualizado pero public.users falló');
      return NextResponse.json({
        success: true,
        partial: true,
        user: existingUser,
        warning: 'Usuario actualizado en autenticación, pero la tabla de usuarios tuvo un error',
      });
    }

    console.log('✅ public.users UPDATE ejecutado');
    console.log('📦 Datos devueltos:', JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      user: data && data.length > 0 ? data[0] : existingUser,
    });
  } catch (error: any) {
    console.error('Error general en update-user:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

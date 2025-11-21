import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { name, utm_source } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'El campo name es requerido' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Variables de entorno de Supabase no configuradas');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Insertar visita en la tabla qr_visits
    const { data, error } = await supabase
      .from('qr_visits')
      .insert({
        name,
        utm_source: utm_source || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error al insertar visita:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      visit: data,
    });
  } catch (error: any) {
    console.error('Error general en track-qr-visit:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

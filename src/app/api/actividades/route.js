import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Buscar si ya existe una actividad para ese día
    const existente = await prisma.actividad.findFirst({
      where: { dia: body.dia }
    });

    let actividadGuardada;

    if (existente) {
      // Si existe, la actualizamos
      actividadGuardada = await prisma.actividad.update({
        where: { id: existente.id },
        data: {
          hora: body.hora,
          lugar: body.lugar,
          director: body.director,
          predicador: body.predicador,
        },
      });
    } else {
      // Si no existe, la creamos
      actividadGuardada = await prisma.actividad.create({
        data: {
          dia: body.dia,
          hora: body.hora,
          lugar: body.lugar,
          director: body.director,
          predicador: body.predicador,
        },
      });
    }

    return NextResponse.json({ success: true, data: actividadGuardada });
  } catch (error) {
    console.error("Error guardando la actividad:", error);
    return NextResponse.json(
      { success: false, error: 'Hubo un error guardando la actividad' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const actividades = await prisma.actividad.findMany();
    return NextResponse.json({ success: true, data: actividades });
  } catch (error) {
    console.error("Error obteniendo actividades:", error);
    return NextResponse.json(
      { success: false, error: 'Hubo un error obteniendo las actividades' },
      { status: 500 }
    );
  }
}

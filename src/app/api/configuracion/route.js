import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let config = await prisma.configuracion.findUnique({
      where: { id: 'global' }
    });

    if (!config) {
      config = await prisma.configuracion.create({
        data: {
          id: 'global',
          nombre: 'Iglesia',
          descripcion: 'Portal oficial de actividades'
        }
      });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching configuracion:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener la configuración' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, descripcion } = body;

    const config = await prisma.configuracion.upsert({
      where: { id: 'global' },
      update: {
        nombre: nombre || 'Iglesia',
        descripcion: descripcion !== undefined ? descripcion : ''
      },
      create: {
        id: 'global',
        nombre: nombre || 'Iglesia',
        descripcion: descripcion !== undefined ? descripcion : ''
      }
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error updating configuracion:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar la configuración' }, { status: 500 });
  }
}

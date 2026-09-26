import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const directiva = await prisma.directiva.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ success: true, data: directiva });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.id) {
      // Actualizar
      const actualizado = await prisma.directiva.update({
        where: { id: body.id },
        data: { nombre: body.nombre, cargo: body.cargo }
      });
      return NextResponse.json({ success: true, data: actualizado });
    } else {
      // Crear
      const nuevo = await prisma.directiva.create({
        data: { nombre: body.nombre, cargo: body.cargo }
      });
      return NextResponse.json({ success: true, data: nuevo });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await prisma.directiva.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
  }
}

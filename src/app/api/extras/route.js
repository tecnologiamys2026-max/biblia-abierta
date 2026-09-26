import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const extras = await prisma.actividadExtra.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: extras });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.id) {
      const actualizado = await prisma.actividadExtra.update({
        where: { id: body.id },
        data: { titulo: body.titulo, descripcion: body.descripcion, fecha: body.fecha }
      });
      return NextResponse.json({ success: true, data: actualizado });
    } else {
      const nuevo = await prisma.actividadExtra.create({
        data: { titulo: body.titulo, descripcion: body.descripcion, fecha: body.fecha }
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
    await prisma.actividadExtra.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
  }
}

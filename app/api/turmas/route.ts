import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Busca todas as turmas cadastradas
    const turmas = await prisma.turma.findMany({
      select: {
        idturma: true,
        nome_turma: true,
        ano_letivo: true,
        limite_vagas: true,
      },
      orderBy: {
        nome_turma: 'asc',
      },
    });

    // Caso não exista nenhuma turma
    if (!turmas || turmas.length === 0) {
      return NextResponse.json(
        { message: 'Nenhuma turma cadastrada no sistema.' },
        { status: 404 }
      );
    }

    return NextResponse.json(turmas, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar turmas.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

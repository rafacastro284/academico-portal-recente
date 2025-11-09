import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/aluno/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    // Busca o aluno e suas disciplinas relacionadas
    const aluno = await prisma.usuario.findUnique({
      where: { idusuario: id },
      include: {
        turma: true, // se houver relação 1:1
        disciplinas: {
          include: {
            professor: true,
          },
        },
      },
    });

    if (!aluno) {
      return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar aluno.' },
      { status: 500 }
    );
  }
}

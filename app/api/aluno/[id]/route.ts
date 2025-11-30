import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    const aluno = await prisma.usuario.findUnique({
      where: { idusuario: id },
      include: {
        // disciplinas do aluno
        alunodisciplina: {
          include: {
            disciplina: {
              include: {
                usuario: true, // professor da disciplina
              },
            },
            nota: true,
            frequencia: true,
          },
        },

        // turma(s) do aluno
        matriculaturma: {
          include: {
            turma: true, // agora funciona, pois está no schema!
          },
        },
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(aluno);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json(
      { error: "Erro no servidor." },
      { status: 500 }
    );
  }
}

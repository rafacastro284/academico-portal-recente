import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const professores = await prisma.usuario.findMany({
      where: { tipo: "professor" },
      select: {
        idusuario: true,
        nome: true,
        cpf: true,
        disciplina: {
          select: {
            iddisciplina: true,
            nome_disciplina: true,
          },
        },
      },
    });

    const data = professores.map((p) => ({
      ...p,
      disciplinas: p.disciplina,
      turmas: [],            // ❗ Não existe relação no banco
      totalAlunos: 0,        // ❗ Só existe se professor tiver turmas
      status: "Ativo",
    }));

    return NextResponse.json(data);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao carregar professores" },
      { status: 500 }
    );
  }
}

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { idprofessor } = await req.json();

    const disciplina = await prisma.disciplina.update({
      where: { iddisciplina: Number(id) },
      data: { idprofessor: Number(idprofessor) },
    });

    return NextResponse.json(
      { message: "Professor atualizado!", disciplina },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar professor:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar professor" },
      { status: 500 }
    );
  }
}

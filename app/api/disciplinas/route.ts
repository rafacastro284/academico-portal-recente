import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      include: {
        usuario: { select: { idusuario: true, nome: true, cpf: true } }
      }
    });

    return NextResponse.json(disciplinas);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao listar disciplinas" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const total = await prisma.usuario.count({
      where: {
        tipo: "aluno",
      },
    });

    return NextResponse.json({ total });
  } catch (error) {
    console.error("Erro ao contar alunos:", error);
    return NextResponse.json(
      { error: "Erro interno ao contar alunos" },
      { status: 500 }
    );
  }
}

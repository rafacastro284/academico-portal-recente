import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { idusuario } = await req.json();

    if (!idusuario) {
      return NextResponse.json(
        { error: "ID do usuário não enviado." },
        { status: 400 }
      );
    }

    const disciplinas = await prisma.alunodisciplina.findMany({
      where: { idaluno: idusuario },
      include: {
        disciplina: {
          include: {
            usuario: true, // professor
          },
        },
      },
    });

    return NextResponse.json({ disciplinas });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar disciplinas." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const total = await prisma.usuario.count({
      where: { tipo: "professor" },
    });

    return NextResponse.json({ total });
  } catch (error) {
    console.error("Erro ao contar professores:", error);
    return NextResponse.json(
      { error: "Erro ao contar professores" },
      { status: 500 }
    );
  }
}

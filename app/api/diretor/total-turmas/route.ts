import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const total = await prisma.turma.count();

    return NextResponse.json({ total });
  } catch (error) {
    console.error("Erro ao contar turmas:", error);
    return NextResponse.json(
      { error: "Erro ao contar turmas" },
      { status: 500 }
    );
  }
}

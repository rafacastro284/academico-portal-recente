// app/api/notas/media-geral/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.nota.aggregate({
      _avg: {
        valor: true,
      },
    });

    // result._avg.valor pode ser null se não houver notas
    const media = result._avg.valor ?? 0;

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Erro ao calcular média geral:", error);
    return NextResponse.json(
      { error: "Erro ao calcular média" },
      { status: 500 }
    );
  }
}

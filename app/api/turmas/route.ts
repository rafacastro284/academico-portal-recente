// app/api/turmas/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const turmas = await prisma.turma.findMany({
      select: {
        idturma: true,
        nome_turma: true,
        ano_letivo: true,
        limite_vagas: true,
        serie: true,
        turno: true,
      },
      orderBy: { nome_turma: "asc" },
    });

    return NextResponse.json(turmas, { status: 200 });
  } catch (err) {
    console.error("Erro ao buscar turmas:", err);
    return NextResponse.json({ error: "Erro ao buscar turmas." }, { status: 500 });
  } finally {
    // não desconectar sempre em cada request em produção; ok para dev
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });

    const { nome_turma, ano_letivo, limite_vagas, serie, turno, professorId } = body;

    if (typeof nome_turma !== "string" || nome_turma.trim() === "") {
      return NextResponse.json({ error: "nome_turma inválido." }, { status: 400 });
    }

    const ano = Number(ano_letivo);
    const vagas = Number(limite_vagas);

    if (!Number.isInteger(ano) || ano <= 0) {
      return NextResponse.json({ error: "ano_letivo inválido." }, { status: 400 });
    }
    if (!Number.isInteger(vagas) || vagas < 0) {
      return NextResponse.json({ error: "limite_vagas inválido." }, { status: 400 });
    }

    // Criação: salva campos opcionais serie/turno quando presentes
    const novaTurma = await prisma.turma.create({
      data: {
        nome_turma: nome_turma.trim(),
        ano_letivo: ano,
        limite_vagas: vagas,
        serie: typeof serie === "string" && serie.trim() !== "" ? serie.trim() : null,
        turno: typeof turno === "string" && turno.trim() !== "" ? turno.trim() : null,
      },
    });

    return NextResponse.json(novaTurma, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar turma:", err);
    return NextResponse.json({ error: "Erro ao criar turma." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

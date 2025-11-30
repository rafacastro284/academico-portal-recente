import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - listar disciplinas
export async function GET() {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      include: {
        professor: { select: { nome: true, email: true } },
        turmas: { include: { turma:true } }
      }
    });
    return NextResponse.json(disciplinas);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao listar disciplinas" }, { status: 500 });
  }
}

// POST - criar disciplina com professor e turmas
export async function POST(req: Request) {
  try {
    const { nome_disciplina, idprofessor, carga_horaria, turmas } = await req.json();

    const nova = await prisma.disciplina.create({
      data: {
        nome_disciplina,
        idprofessor,
        carga_horaria,
        turmas: {
          create: turmas?.map((t:number)=>({ turmaId:t })) || []
        }
      }
    });

    return NextResponse.json({ message:"Criada com sucesso!", nova });
  } catch (error) {
    return NextResponse.json({ error:"Erro ao criar disciplina"},{status:500});
  }
}

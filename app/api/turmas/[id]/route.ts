import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🎯 DELETE /api/turmas/[id] chamado");
    console.log("ID recebido:", params.id);
    
    const turmaId = parseInt(params.id);
    
    if (isNaN(turmaId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    console.log("Buscando turma ID:", turmaId);
    const turma = await prisma.turma.findUnique({
      where: { idturma: turmaId },
    });

    if (!turma) {
      console.log("Turma não encontrada");
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    console.log("Excluindo turma:", turma.nome_turma);
    await prisma.turma.delete({
      where: { idturma: turmaId },
    });

    console.log("Turma excluída com sucesso!");
    return NextResponse.json(
      { 
        success: true, 
        message: `Turma "${turma.nome_turma}" excluída`,
        turmaId: turmaId
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro:", error);
    
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Turma possui vínculos. Remova alunos primeiro." },
        { status: 400 }
      );
    }
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 GET /api/turmas/[id]");
    
    const turmaId = parseInt(params.id);
    
    if (isNaN(turmaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const turma = await prisma.turma.findUnique({
      where: { idturma: turmaId },
    });

    if (!turma) {
      return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
    }

    return NextResponse.json(turma, { status: 200 });
  } catch (error) {
    console.error("Erro GET:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

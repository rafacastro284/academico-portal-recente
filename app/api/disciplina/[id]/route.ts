import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// atualizar professor da disciplina
export async function PATCH(req: Request,{params}:{params:{id:string}}) {
  try {
    const { idprofessor, turmas } = await req.json();

    const disciplina = await prisma.disciplina.update({
      where: { iddisciplina:Number(params.id) },
      data: {
        idprofessor,
        turmas: turmas
          ? { set: turmas.map((t:number)=>({turmaId:t})) }
          : undefined
      }
    });

    return NextResponse.json({message:"Atualizada!", disciplina});
  } catch {
    return NextResponse.json({error:"Erro ao atualizar"},{status:500});
  }
}

// excluir disciplina
export async function DELETE(req: Request,{params}:{params:{id:string}}) {
  try {
    await prisma.disciplina.delete({ where:{iddisciplina:Number(params.id)}});
    return NextResponse.json({ message:"Apagada com sucesso!" });
  } catch {
    return NextResponse.json({error:"Erro ao excluir"},{status:500});
  }
}

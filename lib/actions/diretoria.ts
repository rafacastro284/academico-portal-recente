'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function listarProfessoresAction() {
    try {
      const professores = await prisma.usuario.findMany({
        where: { tipo: 'professor' },
        select: { idusuario: true, nome: true },
        orderBy: { nome: 'asc' },
      });
      return { success: true, data: professores };
    } catch (error) { return { success: false, error: "Erro ao buscar." }; }
}

export async function listarDisciplinasAction() {
    try {
      const disciplinas = await prisma.disciplina.findMany({
        include: { 
          professor: { select: { nome: true } }, 
          turmas: { include: { turma: true } } 
        },
        orderBy: { nome_disciplina: 'asc' },
      });
      return { success: true, data: disciplinas };
    } catch (error) { return { success: false, error: "Erro ao buscar." }; }
}

// A função mais complexa: Cadastra disciplina E atualiza vínculos dos alunos
export async function cadastrarDisciplinaComVinculoAction(dados: { nome_disciplina: string; idprofessor: number; carga_horaria: number; turmaId: number; }) {
  try {
    const matriculas = await prisma.matriculaturma.findMany({ where: { idturma: dados.turmaId }, select: { idusuario: true } });

    const resultadoTransacao = await prisma.$transaction(async (tx) => {
      // 1. Cria a Disciplina
      const disciplinaCriada = await tx.disciplina.create({
        data: { nome_disciplina: dados.nome_disciplina, idprofessor: dados.idprofessor, carga_horaria: dados.carga_horaria },
      });
      
      // 2. Vincula à Turma
      await tx.turmadisciplina.create({ data: { disciplinaid: disciplinaCriada.iddisciplina, turmaid: dados.turmaId } });
      
      // 3. Inscreve alunos matriculados nessa turma na nova disciplina
      if (matriculas.length > 0) {
        await tx.alunodisciplina.createMany({
          data: matriculas.map(m => ({ idaluno: m.idusuario, iddisciplina: disciplinaCriada.iddisciplina })),
          skipDuplicates: true
        });
      }
      return disciplinaCriada; 
    });

    revalidatePath('/diretor/disciplinas'); revalidatePath('/diretor/turmas'); revalidatePath('/aluno/dashboard');
    return { success: true, data: resultadoTransacao };
  } catch (error) { return { success: false, error: "Falha ao cadastrar." }; }
}

export async function inscreverAlunosDaTurmaEmDisciplinaAction(dados: { disciplinaId: number; turmaId: number; }) {
    try {
      const matriculas = await prisma.matriculaturma.findMany({
        where: { idturma: dados.turmaId }, select: { idusuario: true },
      });
      const alunosIds = matriculas.map(m => m.idusuario);
  
      if (alunosIds.length === 0) return { success: true, count: 0 };
  
      const resultado = await prisma.alunodisciplina.createMany({
        data: alunosIds.map(idAluno => ({ idaluno: idAluno, iddisciplina: dados.disciplinaId })),
        skipDuplicates: true, 
      });
  
      revalidatePath('/aluno/dashboard');
      return { success: true, count: resultado.count };
    } catch (error) { return { success: false, error: "Falha na inscrição." }; }
}
export async function getDashboardDiretorAction(idUsuario: number) {
  try {
    const diretor = await prisma.usuario.findUnique({
      where: { idusuario: idUsuario },
      select: { nome: true }
    });

    if (!diretor) return { success: false, error: "Usuário não encontrado." };

    // Executa todas as consultas em paralelo para ser rápido
    const [totalAlunos, totalProfessores, totalTurmas, mediaGeralAgg] = await prisma.$transaction([
      prisma.usuario.count({ where: { tipo: 'aluno' } }),
      prisma.usuario.count({ where: { tipo: 'professor' } }),
      prisma.turma.count(),
      prisma.nota.aggregate({
        _avg: { valor: true }
      })
    ]);

    // Trata a média (pode ser null se não houver notas)
    const mediaFormatada = mediaGeralAgg._avg.valor 
      ? Number(mediaGeralAgg._avg.valor).toFixed(1) 
      : "0.0";

    return {
      success: true,
      data: {
        nome: diretor.nome,
        stats: {
          alunos: totalAlunos,
          professores: totalProfessores,
          turmas: totalTurmas,
          mediaGeral: mediaFormatada
        }
      }
    };
  } catch (error) {
    console.error("Erro dashboard diretor:", error);
    return { success: false, error: "Erro ao carregar dados." };
  }
}
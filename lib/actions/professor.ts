'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- DASHBOARD ---
export async function getDashboardProfessorAction(idProfessor: number) {
  try {
    const vinculos = await prisma.turmadisciplina.findMany({
      where: { disciplina: { idprofessor: idProfessor } },
      include: { 
        turma: true, 
        disciplina: { 
            select: {
                iddisciplina: true, nome_disciplina: true,
                _count: { select: { alunodisciplina: true } }
            }
        } 
      }
    });

    const professor = await prisma.usuario.findUnique({ where: { idusuario: idProfessor }, select: { nome: true } });

    const turmasFormatadas = vinculos.map((v) => ({
      idTurma: v.turma.idturma,
      idDisciplina: v.disciplina.iddisciplina,
      nomeTurma: v.turma.nome_turma || "Turma",
      nomeDisciplina: v.disciplina.nome_disciplina || "Disciplina",
      serie: v.turma.serie || "-", turno: v.turma.turno || "Manhã",
      totalAlunos: v.disciplina._count.alunodisciplina || 0
    }));

    const totalAlunos = turmasFormatadas.reduce((acc, t) => acc + t.totalAlunos, 0);

    return {
      success: true,
      data: {
        nomeProfessor: professor?.nome || "Professor", 
        totalTurmas: turmasFormatadas.length, totalAlunos: totalAlunos, 
        turmas: turmasFormatadas
      }
    };
  } catch (error) { return { success: false, error: "Erro interno." }; }
}

// --- LISTAGEM DE ALUNOS ---
export async function getAlunosDaTurmaAction(turmaId: number, disciplinaId: number) {
  try {
    const turmaInfo = await prisma.turma.findUnique({ where: { idturma: turmaId } });
    const discInfo = await prisma.disciplina.findUnique({ where: { iddisciplina: disciplinaId } });

    if (!turmaInfo || !discInfo) return { success: true, data: { turma: null, disciplina: null, alunos: [] } };

    const alunosVinculados = await prisma.alunodisciplina.findMany({
      where: {
        iddisciplina: disciplinaId,
        aluno: { matriculaturma: { some: { idturma: turmaId } } }
      },
      include: { 
        aluno: { select: { idusuario: true, nome: true, matricula: true } }, 
        nota: true, frequencia: true 
      },
      orderBy: { aluno: { nome: 'asc' } }
    });

    const alunosFormatados = alunosVinculados.map((ad) => {
      const somaNotas = ad.nota.reduce((acc, n) => acc + Number(n.valor || 0), 0);
      const media = ad.nota.length > 0 ? (somaNotas / ad.nota.length).toFixed(1) : "-"; 
      const faltas = ad.frequencia.reduce((acc, f) => acc + (Number(f.faltas) || 0), 0);

      return {
        idAlunoDisciplina: ad.idalunodisciplina, idAluno: ad.idaluno,
        nome: ad.aluno.nome, matricula: ad.aluno.matricula,
        mediaAtual: media, faltas: faltas
      };
    });

    return { success: true, data: { turma: turmaInfo.nome_turma, disciplina: discInfo.nome_disciplina, alunos: alunosFormatados } };
  } catch (error) { return { success: false, error: "Erro ao buscar alunos." }; }
}

// --- LANÇAMENTO DE NOTAS ---
export async function getDadosLancamentoNotasAction(alunoIdDisciplina: number) {
  try {
    const vinculo = await prisma.alunodisciplina.findUnique({
      where: { idalunodisciplina: alunoIdDisciplina },
      include: {
        aluno: { select: { nome: true, matricula: true } },
        disciplina: { select: { nome_disciplina: true } },
        nota: { orderBy: { data: 'asc' } }
      }
    });

    if (!vinculo) return { success: false, error: "Vínculo não encontrado." };

    const notasExistentes = vinculo.nota.map(n => ({
      descricao: n.descricao, valor: Number(n.valor), idNota: n.idnota, data: n.data
    }));
    
    const somaNotas = notasExistentes.reduce((acc, n) => acc + (n.valor || 0), 0);
    const mediaAtual = notasExistentes.length > 0 ? (somaNotas / notasExistentes.length).toFixed(1) : "-";

    return { success: true, data: { aluno: vinculo.aluno, disciplina: vinculo.disciplina.nome_disciplina, notas: notasExistentes, mediaAtual: mediaAtual } };
  } catch (error) { return { success: false, error: "Erro ao carregar notas." }; }
}

export async function lancarNotasAction(dados: { descricaoAvaliacao: string; notas: { idAlunoDisciplina: number; valor: number }[] }) {
    try {
        await prisma.$transaction(async (tx) => {
          for (const notaItem of dados.notas) {
            const notaExistente = await tx.nota.findFirst({
              where: { idalunodisciplina: notaItem.idAlunoDisciplina, descricao: dados.descricaoAvaliacao }
            });
            if (notaExistente) {
              await tx.nota.update({ where: { idnota: notaExistente.idnota }, data: { valor: notaItem.valor, data: new Date() } });
            } else {
              await tx.nota.create({ data: { idalunodisciplina: notaItem.idAlunoDisciplina, descricao: dados.descricaoAvaliacao, valor: notaItem.valor, data: new Date() } });
            }
          }
        });
        revalidatePath('/aluno/dashboard'); 
        revalidatePath('/professor/turma/[turmaid]/alunos');
        return { success: true };
      } catch (error) { return { success: false, error: "Erro ao salvar notas." }; }
}

export async function excluirNotaAction(disciplinaId: number, descricaoAvaliacao: string) {
  try {
    const vinculos = await prisma.alunodisciplina.findMany({ where: { iddisciplina: disciplinaId }, select: { idalunodisciplina: true } });
    const idsVinculos = vinculos.map(v => v.idalunodisciplina);
    const resultado = await prisma.nota.deleteMany({ where: { idalunodisciplina: { in: idsVinculos }, descricao: descricaoAvaliacao } });
    revalidatePath('/professor/dashboard'); revalidatePath('/professor/turma/[turmaid]/alunos');
    return { success: true, count: resultado.count };
  } catch (error) { return { success: false, error: "Erro ao excluir." }; }
}

// --- LANÇAMENTO DE FREQUÊNCIA ---
export async function getDadosLancamentoFrequenciaAction(alunoIdDisciplina: number, dataConsulta: string) {
    try {
      const data = new Date(dataConsulta);
      const vinculo = await prisma.alunodisciplina.findUnique({
        where: { idalunodisciplina: alunoIdDisciplina },
        include: {
          aluno: { select: { nome: true, matricula: true } },
          disciplina: { select: { nome_disciplina: true } },
        }
      });
  
      if (!vinculo) return { success: false, error: "Vínculo não encontrado." };
      
      const frequenciaDoDia = await prisma.frequencia.findFirst({
          where: { idalunodisciplina: alunoIdDisciplina, data: data }
      });
      
      const statusAtual = frequenciaDoDia && frequenciaDoDia.faltas !== null ? (frequenciaDoDia.faltas === 0 ? 'P' : 'F') : 'N/A';
      
      const totalFaltas = await prisma.frequencia.aggregate({
          _sum: { faltas: true },
          where: { idalunodisciplina: alunoIdDisciplina }
      });
      
      return {
        success: true,
        data: {
          aluno: vinculo.aluno,
          disciplina: vinculo.disciplina.nome_disciplina,
          statusAtual: statusAtual,
          totalFaltas: totalFaltas._sum.faltas || 0,
        }
      };
    } catch (error) { return { success: false, error: "Erro ao carregar frequência." }; }
}

export async function lancarFrequenciaAction(dados: { disciplinaId: number; data: string; registros: { idAlunoDisciplina: number; status: 'P' | 'F' }[] }) {
    try {
        const dataFrequencia = new Date(dados.data);
        const idsVinculos = dados.registros.map(r => r.idAlunoDisciplina);
    
        await prisma.$transaction([
          prisma.frequencia.deleteMany({
            where: { idalunodisciplina: { in: idsVinculos }, data: dataFrequencia }
          }),
          ...dados.registros.map((reg) => 
            prisma.frequencia.create({
              data: {
                idalunodisciplina: reg.idAlunoDisciplina,
                data: dataFrequencia,
                faltas: reg.status === 'F' ? 1 : 0
              }
            })
          )
        ]);
        revalidatePath('/aluno/dashboard'); 
        revalidatePath('/professor/turma/[turmaid]/alunos');
        return { success: true };
      } catch (error) { return { success: false, error: "Erro ao salvar frequência." }; }
}

export async function excluirLancamentoFrequenciaAction(disciplinaId: number, dataRegistro: string) {
    try {
      const data = new Date(dataRegistro);
      const vinculos = await prisma.alunodisciplina.findMany({
        where: { iddisciplina: disciplinaId },
        select: { idalunodisciplina: true }
      });
      const idsVinculos = vinculos.map(v => v.idalunodisciplina);
      const resultado = await prisma.frequencia.deleteMany({
        where: { idalunodisciplina: { in: idsVinculos }, data: data }
      });
      revalidatePath('/professor/dashboard'); revalidatePath('/professor/turma/[turmaid]/alunos');
      return { success: true, count: resultado.count };
    } catch (error) { return { success: false, error: "Erro ao excluir." }; }
}
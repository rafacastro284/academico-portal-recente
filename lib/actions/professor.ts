'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==================== DASHBOARD ====================
export async function getDashboardProfessorAction(idProfessor: number) {
  try {
    const vinculos = await prisma.turmadisciplina.findMany({
      where: { disciplina: { idprofessor: idProfessor } },
      include: { 
        turma: true, 
        disciplina: { 
          select: {
            iddisciplina: true, 
            nome_disciplina: true,
            _count: { select: { alunodisciplina: true } }
          }
        } 
      }
    });

    const professor = await prisma.usuario.findUnique({ 
      where: { idusuario: idProfessor }, 
      select: { nome: true } 
    });

    const turmasFormatadas = vinculos.map((v) => ({
      idTurma: v.turma.idturma,
      idDisciplina: v.disciplina.iddisciplina,
      nomeTurma: v.turma.nome_turma || "Turma",
      nomeDisciplina: v.disciplina.nome_disciplina || "Disciplina",
      serie: v.turma.serie || "-", 
      turno: v.turma.turno || "Manhã",
      totalAlunos: v.disciplina._count.alunodisciplina || 0
    }));

    const totalAlunos = turmasFormatadas.reduce((acc, t) => acc + t.totalAlunos, 0);

    return {
      success: true,
      data: {
        nomeProfessor: professor?.nome || "Professor", 
        totalTurmas: turmasFormatadas.length, 
        totalAlunos: totalAlunos, 
        turmas: turmasFormatadas
      }
    };
  } catch (error) { 
    console.error("Erro getDashboardProfessorAction:", error);
    return { success: false, error: "Erro ao carregar dashboard." }; 
  }
}

// ==================== BUSCAR USUÁRIO ====================
export async function buscarUsuarioPorIdAction(id: number) {
  try {
    const u = await prisma.usuario.findUnique({ where: { idusuario: id } });
    return u ? { success: true, data: u } : { success: false, error: "Não encontrado" };
  } catch (error) {
    console.error("Erro buscarUsuarioPorIdAction:", error);
    return { success: false, error: "Erro ao buscar usuário." };
  }
}

// ==================== LISTA DE ALUNOS ====================
export async function getAlunosDaTurmaAction(turmaId: number, disciplinaId: number) {
  try {
    const turmaInfo = await prisma.turma.findUnique({ where: { idturma: turmaId } });
    const discInfo = await prisma.disciplina.findUnique({ where: { iddisciplina: disciplinaId } });

    if (!turmaInfo || !discInfo) {
      return { success: true, data: { turma: null, disciplina: null, alunos: [] } };
    }

    const alunosVinculados = await prisma.alunodisciplina.findMany({
      where: {
        iddisciplina: disciplinaId,
        aluno: { matriculaturma: { some: { idturma: turmaId } } }
      },
      include: { 
        aluno: { select: { idusuario: true, nome: true, matricula: true } }, 
        nota: true, 
        frequencia: true 
      },
      orderBy: { aluno: { nome: 'asc' } }
    });

    const alunosFormatados = alunosVinculados.map((ad) => {
      const somaNotas = ad.nota.reduce((acc, n) => acc + Number(n.valor || 0), 0);
      const media = ad.nota.length > 0 ? (somaNotas / ad.nota.length).toFixed(1) : "-"; 
      const faltas = ad.frequencia.reduce((acc, f) => acc + (Number(f.faltas) || 0), 0);

      return {
        idAlunoDisciplina: ad.idalunodisciplina, 
        idAluno: ad.idaluno,
        nome: ad.aluno.nome,
        matricula: ad.aluno.matricula,
        mediaAtual: media,
        faltas: faltas
      };
    });

    return { 
      success: true, 
      data: { 
        turma: turmaInfo.nome_turma, 
        disciplina: discInfo.nome_disciplina, 
        alunos: alunosFormatados 
      } 
    };
  } catch (error) { 
    console.error("Erro getAlunosDaTurmaAction:", error);
    return { success: false, error: "Erro ao buscar alunos." }; 
  }
}

// ==================== LANÇAMENTO DE FREQUÊNCIA (LISTA) ====================
export async function getDadosLancamentoFrequenciaListaAction(turmaId: number, disciplinaId: number, dataConsulta: string) {
  try {
    const data = new Date(dataConsulta);
    
    const turmaInfo = await prisma.turma.findUnique({ where: { idturma: turmaId } });
    const discInfo = await prisma.disciplina.findUnique({ where: { iddisciplina: disciplinaId } });

    if (!turmaInfo || !discInfo) {
      return { success: false, error: "Turma ou disciplina não encontrada." };
    }

    const alunosVinculados = await prisma.alunodisciplina.findMany({
      where: {
        iddisciplina: disciplinaId,
        aluno: { matriculaturma: { some: { idturma: turmaId } } }
      },
      include: { 
        aluno: { select: { idusuario: true, nome: true, matricula: true } },
        frequencia: { where: { data: data } }
      },
      orderBy: { aluno: { nome: 'asc' } }
    });

    const alunosComStatus = alunosVinculados.map((ad) => {
      const frequenciaDoDia = ad.frequencia[0];
      
      let statusAtual: 'P' | 'F' | 'N/A' = 'N/A';
      if (frequenciaDoDia && frequenciaDoDia.faltas !== null) {
        statusAtual = frequenciaDoDia.faltas === 0 ? 'P' : 'F';
      }

      return {
        idAlunoDisciplina: ad.idalunodisciplina,
        idAluno: ad.idaluno,
        nome: ad.aluno.nome || null,
        matricula: ad.aluno.matricula || null,
        statusAtual: statusAtual
      };
    });

    return {
      success: true,
      data: {
        turma: turmaInfo.nome_turma,
        disciplina: discInfo.nome_disciplina,
        alunos: alunosComStatus
      }
    };
  } catch (error) {
    console.error("Erro getDadosLancamentoFrequenciaListaAction:", error);
    return { success: false, error: "Erro ao carregar dados de frequência." };
  }
}

export async function lancarFrequenciaAction(dados: { 
  disciplinaId: number; 
  data: string; 
  registros: { idAlunoDisciplina: number; status: 'P' | 'F' }[] 
}) {
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

    revalidatePath('/professor/turma/[turmaid]/alunos');
    revalidatePath('/professor/turma/[turmaid]/lancar-frequencia');
    return { success: true };
  } catch (error) { 
    console.error("Erro lancarFrequenciaAction:", error);
    return { success: false, error: "Erro ao salvar frequência." }; 
  }
}

// ==================== LANÇAMENTO DE NOTAS (INDIVIDUAL) ====================
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
      descricao: n.descricao,
      valor: Number(n.valor),
      idNota: n.idnota,
      data: n.data
    }));
    
    const somaNotas = notasExistentes.reduce((acc, n) => acc + (n.valor || 0), 0);
    const mediaAtual = notasExistentes.length > 0 ? (somaNotas / notasExistentes.length).toFixed(1) : "-";

    return { 
      success: true, 
      data: { 
        aluno: vinculo.aluno, 
        disciplina: vinculo.disciplina.nome_disciplina, 
        notas: notasExistentes, 
        mediaAtual: mediaAtual 
      } 
    };
  } catch (error) { 
    console.error("Erro getDadosLancamentoNotasAction:", error);
    return { success: false, error: "Erro ao carregar notas." }; 
  }
}

export async function lancarNotaAction(dados: { 
  idAlunoDisciplina: number; 
  descricaoAvaliacao: string; 
  valor: number 
}) {
  try {
    const notaExistente = await prisma.nota.findFirst({
      where: { 
        idalunodisciplina: dados.idAlunoDisciplina, 
        descricao: dados.descricaoAvaliacao 
      }
    });

    if (notaExistente) {
      await prisma.nota.update({ 
        where: { idnota: notaExistente.idnota }, 
        data: { valor: dados.valor, data: new Date() } 
      });
    } else {
      await prisma.nota.create({ 
        data: { 
          idalunodisciplina: dados.idAlunoDisciplina, 
          descricao: dados.descricaoAvaliacao, 
          valor: dados.valor, 
          data: new Date() 
        } 
      });
    }

    revalidatePath('/professor/turma/[turmaid]/alunos');
    revalidatePath('/professor/turma/[turmaid]/lancar-notas');
    return { success: true };
  } catch (error) { 
    console.error("Erro lancarNotaAction:", error);
    return { success: false, error: "Erro ao salvar nota." }; 
  }
}

export async function excluirNotaAction(idNota: number) {
  try {
    await prisma.nota.delete({ where: { idnota: idNota } });
    revalidatePath('/professor/turma/[turmaid]/lancar-notas');
    return { success: true };
  } catch (error) {
    console.error("Erro excluirNotaAction:", error);
    return { success: false, error: "Erro ao excluir nota." };
  }
}
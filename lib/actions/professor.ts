'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. DASHBOARD DO PROFESSOR
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
      nomeTurma: v.turma.nome_turma || "Turma Sem Nome",
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

// 2. LISTA DE ALUNOS (Com Notas Detalhadas)
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
      // Calcula a média (converte Decimal para Number aqui apenas para cálculo)
      const somaNotas = ad.nota.reduce((acc, n) => acc + Number(n.valor || 0), 0);
      const media = ad.nota.length > 0 ? (somaNotas / ad.nota.length).toFixed(1) : "-"; 
      const faltas = ad.frequencia.reduce((acc, f) => acc + (Number(f.faltas) || 0), 0);

      return {
        idAlunoDisciplina: ad.idalunodisciplina, 
        idAluno: ad.idaluno,
        nome: ad.aluno.nome, 
        matricula: ad.aluno.matricula,
        mediaAtual: media,
        faltas: faltas,
        
        // 👇 CORREÇÃO DO ERRO "Decimal objects are not supported" 👇
        // Mapeamos as notas criando um novo objeto onde 'valor' é transformado em Number
        nota: ad.nota.map((n) => ({
          idnota: n.idnota,
          descricao: n.descricao,
          data: n.data,
          valor: Number(n.valor), // Converte Decimal do Prisma para Number do JS
          idalunodisciplina: n.idalunodisciplina
        }))
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

// 3. FREQUÊNCIA
export async function getDadosLancamentoFrequenciaListaAction(turmaId: number, disciplinaId: number, dataConsulta: string) {
  try {
    const data = new Date(dataConsulta);
    
    const turmaInfo = await prisma.turma.findUnique({ where: { idturma: turmaId } });
    const discInfo = await prisma.disciplina.findUnique({ where: { iddisciplina: disciplinaId } });

    if (!turmaInfo || !discInfo) return { success: false, error: "Dados não encontrados." };

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
      const f = ad.frequencia[0];
      let statusAtual: 'P' | 'F' | 'N/A' = 'N/A';
      if (f && f.faltas !== null) {
        statusAtual = f.faltas === 0 ? 'P' : 'F';
      }

      return {
        idAlunoDisciplina: ad.idalunodisciplina,
        idAluno: ad.idaluno,
        nome: ad.aluno.nome,
        matricula: ad.aluno.matricula,
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
    return { success: true };
  } catch (error) { 
    console.error("Erro lancarFrequenciaAction:", error);
    return { success: false, error: "Erro ao salvar frequência." }; 
  }
}

// 4. LANÇAMENTO DE NOTAS EM LOTE (NOVO)
export async function lancarNotasEmLoteAction(dados: { 
  descricaoAvaliacao: string; 
  notas: { idAlunoDisciplina: number; valor: number }[] 
}) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of dados.notas) {
        // Verifica se já existe nota com essa descrição para esse aluno
        const existe = await tx.nota.findFirst({
          where: { 
            idalunodisciplina: item.idAlunoDisciplina, 
            descricao: dados.descricaoAvaliacao 
          }
        });

        if (existe) {
          // Atualiza nota existente
          await tx.nota.update({ 
            where: { idnota: existe.idnota }, 
            data: { valor: item.valor, data: new Date() } 
          });
        } else {
          // Cria nova nota
          await tx.nota.create({
            data: { 
              idalunodisciplina: item.idAlunoDisciplina, 
              descricao: dados.descricaoAvaliacao, 
              valor: item.valor, 
              data: new Date() 
            }
          });
        }
      }
    });

    // Revalida as páginas afetadas
    revalidatePath('/professor/turma/[turmaid]/alunos');
    return { success: true };
  } catch (error) {
    console.error("Erro lancarNotasEmLoteAction:", error);
    return { success: false, error: "Erro ao salvar notas em lote." };
  }
}

// 5. EXCLUIR NOTAS
export async function excluirNotaAction(idNota: number) {
  try {
    await prisma.nota.delete({ where: { idnota: idNota } });
    revalidatePath('/professor/turma/[turmaid]/alunos');
    return { success: true };
  } catch (error) {
    console.error("Erro excluirNotaAction:", error);
    return { success: false, error: "Erro ao excluir nota." };
  }
}

// 6. LANÇAMENTO DE NOTA INDIVIDUAL
export async function lancarNotaAction(dados: { 
  idAlunoDisciplina: number; 
  descricaoAvaliacao: string; 
  valor: number;
}) {
  try {
    // Verifica se já existe nota com essa descrição para esse aluno
    const notaExistente = await prisma.nota.findFirst({
      where: { 
        idalunodisciplina: dados.idAlunoDisciplina, 
        descricao: dados.descricaoAvaliacao 
      }
    });

    if (notaExistente) {
      // Atualiza nota existente
      await prisma.nota.update({
        where: { idnota: notaExistente.idnota },
        data: { 
          valor: dados.valor,
          data: new Date()
        }
      });
    } else {
      // Cria nova nota
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
    return { success: true };
  } catch (error) {
    console.error("Erro lancarNotaAction:", error);
    return { success: false, error: "Erro ao salvar nota." };
  }
}
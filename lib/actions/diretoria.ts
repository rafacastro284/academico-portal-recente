'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function listarProfessoresAction() {
  try {
    const professores = await prisma.usuario.findMany({
      where: { tipo: 'professor' },
      select: {
        idusuario: true,
        nome: true
      },
      orderBy: { nome: 'asc' }
    });

    return {
      success: true,
      data: professores
    };
  } catch (error) {
    console.error("Erro ao listar professores:", error);
    return { success: false, error: "Erro ao listar professores" };
  }
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
      
      // Converter nome_disciplina de string | null para string
      const disciplinasFormatadas = disciplinas.map(disciplina => ({
        ...disciplina,
        nome_disciplina: disciplina.nome_disciplina || "Disciplina sem nome"
      }));
      
      return { success: true, data: disciplinasFormatadas };
    } catch (error) { 
      console.error("Erro ao listar disciplinas:", error);
      return { success: false, error: "Erro ao buscar disciplinas." }; 
    }
}

export async function cadastrarDisciplinaComVinculoAction(dados: { 
  nome_disciplina: string; 
  idprofessor: number; 
  turmaId: number; 
}) {
  try {
    console.log("📝 Cadastrando disciplina com dados:", dados);
    
    // Verificar se o professor existe
    const professorExiste = await prisma.usuario.findUnique({
      where: { 
        idusuario: dados.idprofessor,
        tipo: 'professor'
      }
    });
    
    if (!professorExiste) {
      return { success: false, error: "Professor não encontrado." };
    }
    
    // Verificar se a turma existe
    const turmaExiste = await prisma.turma.findUnique({
      where: { idturma: dados.turmaId }
    });
    
    if (!turmaExiste) {
      return { success: false, error: "Turma não encontrada." };
    }
    
    // Criar a disciplina
    const disciplina = await prisma.disciplina.create({
      data: { 
        nome_disciplina: dados.nome_disciplina, 
        idprofessor: dados.idprofessor,
        carga_horaria: null
      },
    });
    
    console.log("✅ Disciplina criada:", disciplina.iddisciplina);
    
    // Vincular à turma
    await prisma.turmadisciplina.create({
      data: {
        turmaid: dados.turmaId,
        disciplinaid: disciplina.iddisciplina
      }
    });
    
    // Buscar alunos da turma
    const matriculas = await prisma.matriculaturma.findMany({
      where: { idturma: dados.turmaId },
      select: { idusuario: true }
    });
    
    // Inscrição dos alunos na disciplina
    if (matriculas.length > 0) {
      for (const matricula of matriculas) {
        await prisma.alunodisciplina.create({
          data: {
            idaluno: matricula.idusuario,
            iddisciplina: disciplina.iddisciplina
          }
        });
      }
      console.log(`✅ ${matriculas.length} alunos inscritos`);
    }
    
    // Revalidar páginas
    revalidatePath('/diretor/disciplinas');
    revalidatePath('/diretor/turmas');
    revalidatePath('/aluno/dashboard');
    
    return {
      success: true,
      data: disciplina,
      message: "Disciplina cadastrada com sucesso!"
    };
    
  } catch (error: any) {
    console.error("❌ Erro ao cadastrar disciplina:", error);
    
    let mensagemErro = "Erro ao cadastrar disciplina";
    
    if (error.code === 'P2002') {
      mensagemErro = "Já existe uma disciplina com este nome.";
    } else if (error.code === 'P2003') {
      mensagemErro = "Erro de referência. Verifique se o professor ou turma existem.";
    }
    
    return {
      success: false,
      error: mensagemErro
    };
  }
}

export async function buscarTurmaPorIdAction(idTurma: number) {
  try {
    const turma = await prisma.turma.findUnique({
      where: { idturma: idTurma }
    });

    if (!turma) {
      return { success: false, error: "Turma não encontrada" };
    }

    return {
      success: true,
      data: turma
    };
  } catch (error) {
    console.error("Erro ao buscar turma:", error);
    return { success: false, error: "Erro ao buscar turma" };
  }
}


export async function getDashboardDiretorAction(idUsuario: number) {
  try {
    const diretor = await prisma.usuario.findUnique({
      where: { idusuario: idUsuario },
      select: { nome: true }
    });

    if (!diretor) return { success: false, error: "Usuário não encontrado." };

    const [totalAlunos, totalProfessores, totalTurmas, mediaGeralAgg] = await prisma.$transaction([
      prisma.usuario.count({ where: { tipo: 'aluno' } }),
      prisma.usuario.count({ where: { tipo: 'professor' } }),
      prisma.turma.count(),
      prisma.nota.aggregate({ _avg: { valor: true } })
    ]);

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

// LISTAR ALUNOS COM FREQUÊNCIA
export async function listarAlunosComTurmaEAcoesAction() {
  try {
    // Buscar todos os alunos
    const alunos = await prisma.usuario.findMany({
      where: { tipo: 'aluno' },
      include: {
        matriculaturma: {
          include: { 
            turma: true 
          },
          take: 1,
          orderBy: { idmatriculaturma: 'desc' }
        },
        // Incluir frequência das disciplinas através de alunodisciplina
        alunodisciplina: {
          include: {
            frequencia: {
              select: {
                idfrequencia: true,
                idalunodisciplina: true,
                data: true,
                faltas: true
              }
            }
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    const dadosFormatados = alunos.map(aluno => {
      const turmaAtual = aluno.matriculaturma[0]?.turma;
      
      // Calcular frequência média baseada nas faltas
      const frequencias = aluno.alunodisciplina.flatMap(ad => 
        ad.frequencia.map(f => {
          const faltas = f.faltas || 0;
          // Estimativa simples baseada em faltas
          if (faltas === 0) return 100;
          if (faltas === 1) return 95;
          if (faltas === 2) return 90;
          if (faltas <= 5) return 80;
          if (faltas <= 10) return 70;
          return 50;
        })
      );
      
      const frequenciaMedia = frequencias.length > 0 
        ? frequencias.reduce((sum, freq) => sum + freq, 0) / frequencias.length
        : 0;
      
      // Contar total de faltas
      const totalFaltas = aluno.alunodisciplina.flatMap(ad => 
        ad.frequencia.map(f => f.faltas || 0)
      ).reduce((sum, faltas) => sum + faltas, 0);
      
      // Estimativa de presenças (assumindo 100 dias letivos como base)
      const totalDiasBase = 100;
      const totalPresencasEstimadas = Math.max(0, totalDiasBase - totalFaltas);

      return {
        id: aluno.idusuario,
        nome: aluno.nome || "Sem Nome",
        cpf: aluno.cpf || "N/A",
        matricula: aluno.matricula || "N/A",
        turma: turmaAtual?.nome_turma || "Não Matriculado",
        serie: turmaAtual?.serie || "-",
        status: turmaAtual ? "Cursando" : "Pendente",
        frequenciaMedia: parseFloat(frequenciaMedia.toFixed(1)),
        totalPresencas: totalPresencasEstimadas,
        totalFaltas: totalFaltas
      };
    });

    return { 
      success: true, 
      data: { 
        alunos: dadosFormatados,
        totalAlunos: alunos.length
      } 
    };
  } catch (error) {
    console.error("Erro listarAlunosComTurmaEAcoesAction:", error);
    return { success: false, error: "Erro ao buscar lista de alunos." };
  }
}

// EXCLUIR DISCIPLINA
export async function excluirDisciplinaAction(disciplinaId: number) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Primeiro, buscar todos os alunodisciplina relacionados
      const alunodisciplinas = await tx.alunodisciplina.findMany({
        where: { iddisciplina: disciplinaId },
        select: { idalunodisciplina: true }
      });
      
      const alunodisciplinaIds = alunodisciplinas.map(ad => ad.idalunodisciplina);

      // 2. Remover frequências relacionadas aos alunodisciplina
      if (alunodisciplinaIds.length > 0) {
        await tx.frequencia.deleteMany({
          where: { idalunodisciplina: { in: alunodisciplinaIds } }
        });
      }

      // 3. Remover notas da disciplina (nota está vinculada a alunodisciplina)
      if (alunodisciplinaIds.length > 0) {
        await tx.nota.deleteMany({
          where: { idalunodisciplina: { in: alunodisciplinaIds } }
        });
      }

      // 4. Remover vínculos com turmas
      await tx.turmadisciplina.deleteMany({
        where: { disciplinaid: disciplinaId }
      });

      // 5. Remover inscrições de alunos (alunodisciplina)
      await tx.alunodisciplina.deleteMany({
        where: { iddisciplina: disciplinaId }
      });

      // 6. Remover tarefas da disciplina
      await tx.tarefa.deleteMany({
        where: { iddisciplina: disciplinaId }
      });

      // 7. Excluir a disciplina
      await tx.disciplina.delete({
        where: { iddisciplina: disciplinaId }
      });
    });

    revalidatePath("/diretor/gerenciar-disciplinas");
    revalidatePath("/diretor/dashboard");
    revalidatePath("/diretor/turmas");
    return { success: true, message: "Disciplina excluída com sucesso" };
  } catch (error: any) {
    console.error("Erro excluirDisciplinaAction:", error);
    
    if (error.code === "P2025") {
      return { success: false, error: "Disciplina não encontrada" };
    }
    
    return { success: false, error: "Erro ao excluir disciplina." };
  }
}

export async function excluirProfessorAction(idProfessor: number) {
  try {
    await prisma.usuario.delete({
      where: { idusuario: idProfessor }
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir professor:", error);
    return { success: false, error: "Erro ao excluir professor. Verifique se não há vínculos ativos." };
  }
}

export async function excluirTurmaAction(idTurma: number) {
  try {
    await prisma.turma.delete({
      where: { idturma: idTurma }
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir turma:", error);
    return { success: false, error: "Erro ao excluir turma. Verifique se não há alunos matriculados." };
  }
}

export async function excluirAlunoAction(idAluno: number) {
  try {
    await prisma.usuario.delete({
      where: { idusuario: idAluno }
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    return { success: false, error: "Erro ao excluir aluno." };
  }
}

// LISTAR PROFESSORES COM DISCIPLINAS
export async function listarProfessoresComDisciplinasAction() {
  try {
    const professores = await prisma.usuario.findMany({
      where: { tipo: 'professor' },
      include: {
        disciplinasMinistradas: {
          include: {
            turmas: {
              include: {
                turma: true
              }
            }
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    const professoresFormatados = professores.map(prof => {
      // Usar disciplinasMinistradas conforme o schema
      const disciplinas = prof.disciplinasMinistradas || [];
      
      // Obter nomes das disciplinas (filtrando valores nulos)
      const disciplinasNomes = disciplinas
        .map((d: any) => d.nome_disciplina)
        .filter((nome: string | null): nome is string => nome !== null && nome !== undefined);
      
      // Obter nomes das turmas (filtrando valores nulos)
      const turmasVinculadas = disciplinas.flatMap((d: any) => 
        d.turmas
          .map((t: any) => t.turma.nome_turma)
          .filter((nome: string | null): nome is string => nome !== null && nome !== undefined)
      );

      return {
        idusuario: prof.idusuario,
        nome: prof.nome || 'Sem nome',
        cpf: prof.cpf || undefined,
        matricula: prof.matricula || undefined,
        email: prof.email || undefined,
        disciplinas: disciplinasNomes,
        turmas: [...new Set(turmasVinculadas)],
        totalDisciplinas: disciplinasNomes.length,
        totalTurmas: [...new Set(turmasVinculadas)].length
      };
    });

    return { success: true, data: professoresFormatados };
  } catch (error) {
    console.error('Erro ao listar professores com disciplinas:', error);
    return { success: false, error: 'Erro ao carregar professores.' };
  }
}

// LISTAR TURMAS PARA DIRETOR (simplificado)
export async function listarTurmasParaDiretorAction() {
  try {
    const turmas = await prisma.turma.findMany({
      include: {
        matriculaturma: {
          select: { 
            idusuario: true // Apenas conta, não busca nomes
          }
        },
        disciplinas: {
          include: {
            disciplina: {
              include: {
                professor: {
                  select: { nome: true }
                }
              }
            }
          },
          take: 1
        }
      },
      orderBy: [{ serie: 'asc' }, { nome_turma: 'asc' }]
    });

    const dadosFormatados = turmas.map(turma => {
      const professorRegente = turma.disciplinas[0]?.disciplina?.professor?.nome || "Sem Professor";
      const totalAlunos = turma.matriculaturma.length;

      return {
        id: turma.idturma,
        nome: turma.nome_turma || "Turma Sem Nome",
        serie: turma.serie || "-",
        turno: turma.turno || "Não Definido",
        professorNome: professorRegente,
        totalAlunos: totalAlunos,
        anoLetivo: turma.ano_letivo || new Date().getFullYear()
      };
    });

    return { success: true, data: dadosFormatados };
  } catch (error) {
    console.error("Erro listarTurmasParaDiretorAction:", error);
    return { success: false, error: "Erro ao buscar turmas." };
  }
}

// BUSCAR DISCIPLINA POR PROFESSOR
export async function buscarDisciplinasPorProfessorAction(professorId: number) {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      where: { idprofessor: professorId },
      include: {
        turmas: {
          include: {
            turma: true
          }
        }
      },
      orderBy: { nome_disciplina: 'asc' }
    });

    return { success: true, data: disciplinas };
  } catch (error) {
    console.error('Erro ao buscar disciplinas do professor:', error);
    return { success: false, error: 'Erro ao buscar disciplinas.' };
  }
}

export async function atualizarTurmaAction(dados: {
  idturma: number;
  nome_turma: string;
  serie: string;
  turno: string;
  ano_letivo: number | null;
  limite_vagas: number | null;
}) {
  try {
    const turmaAtualizada = await prisma.turma.update({
      where: { idturma: dados.idturma },
      data: {
        nome_turma: dados.nome_turma,
        serie: dados.serie,
        turno: dados.turno,
        ano_letivo: dados.ano_letivo,
        limite_vagas: dados.limite_vagas
      }
    });

    return {
      success: true,
      data: turmaAtualizada
    };
  } catch (error) {
    console.error("Erro ao atualizar turma:", error);
    return { success: false, error: "Erro ao atualizar turma" };
  }
}

// ATUALIZAR DISCIPLINA
export async function atualizarDisciplinaAction(dados: {
  iddisciplina: number;
  nome_disciplina: string;
  idprofessor: number;
  carga_horaria: number | null;
}) {
  try {
    const disciplinaAtualizada = await prisma.disciplina.update({
      where: { iddisciplina: dados.iddisciplina },
      data: {
        nome_disciplina: dados.nome_disciplina,
        idprofessor: dados.idprofessor,
        carga_horaria: dados.carga_horaria
      }
    });

    return {
      success: true,
      data: disciplinaAtualizada
    };
  } catch (error) {
    console.error("Erro ao atualizar disciplina:", error);
    return { success: false, error: "Erro ao atualizar disciplina" };
  }
}

export async function buscarDisciplinaPorIdAction(idDisciplina: number) {
  try {
    const disciplina = await prisma.disciplina.findUnique({
      where: { iddisciplina: idDisciplina },
      include: {
        professor: {
          select: { nome: true }
        }
      }
    });

    if (!disciplina) {
      return { success: false, error: "Disciplina não encontrada" };
    }

    return {
      success: true,
      data: disciplina
    };
  } catch (error) {
    console.error("Erro ao buscar disciplina:", error);
    return { success: false, error: "Erro ao buscar disciplina" };
  }
}

export async function getRelatorioCompletoAction() {
  try {
    // Obter dados do dashboard
    const dashboardRes = await getDashboardDiretorAction(0); // 0 será substituído pelo ID real
    
    // Obter listas completas
    const [turmasRes, professoresRes, disciplinasRes, alunosRes] = await Promise.all([
      listarTurmasParaDiretorAction(),
      listarProfessoresComDisciplinasAction(),
      listarDisciplinasAction(),
      listarAlunosComTurmaEAcoesAction()
    ]);

    return {
      success: true,
      data: {
        stats: dashboardRes.success ? dashboardRes.data?.stats : null,
        turmas: turmasRes.success ? turmasRes.data : [],
        professores: professoresRes.success ? professoresRes.data : [],
        disciplinas: disciplinasRes.success ? disciplinasRes.data : [],
        alunos: alunosRes.success ? alunosRes.data?.alunos : []
      }
    };
  } catch (error) {
    console.error('Erro ao gerar relatório completo:', error);
    return {
      success: false,
      error: 'Erro ao gerar relatório completo'
    };
  }
}
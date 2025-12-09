'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==================== DASHBOARD ====================
export async function getDashboardSecretarioAction(idUsuario: number) {
  try {
    const usuario = await prisma.usuario.findUnique({ 
      where: { idusuario: idUsuario },
      select: { nome: true, tipo: true }
    });
    
    if (!usuario) return { success: false, error: "Usuário não encontrado." };

    const [totalAlunos, totalProfessores, totalDiretores, totalAdmins, totalTurmas] = await prisma.$transaction([
      prisma.usuario.count({ where: { tipo: 'aluno' } }),
      prisma.usuario.count({ where: { tipo: 'professor' } }),
      prisma.usuario.count({ where: { tipo: 'diretor' } }),
      prisma.usuario.count({ where: { tipo: 'admin' } }),
      prisma.turma.count(),
    ]);

    return {
      success: true,
      data: { 
        nome: usuario.nome || "Secretário",
        tipo: usuario.tipo,
        stats: { 
          alunos: totalAlunos, 
          professores: totalProfessores,
          diretores: totalDiretores,
          administradores: totalAdmins,
          turmas: totalTurmas
        } 
      }
    };
  } catch (error) { 
    console.error("Erro getDashboardSecretarioAction:", error);
    return { success: false, error: "Erro ao carregar dashboard." }; 
  }
}

// ==================== LISTAR ALUNOS ====================
export async function listarAlunosComTurmaAction() {
  try {
    const alunos = await prisma.usuario.findMany({
      where: { tipo: 'aluno' },
      include: {
        matriculaturma: {
          include: { turma: true },
          take: 1,
          orderBy: { idmatriculaturma: 'desc' }
        }
      },
      orderBy: { nome: 'asc' }
    });

    const dadosFormatados = alunos.map(aluno => {
      const turmaAtual = aluno.matriculaturma[0]?.turma;
      
      return {
        id: aluno.idusuario,
        nome: aluno.nome || "Sem Nome",
        cpf: aluno.cpf || "N/A",
        matricula: aluno.matricula || "N/A",
        turma: turmaAtual?.nome_turma || "Não Matriculado",
        serie: turmaAtual?.serie || "-",
        status: turmaAtual ? "Cursando" : "Pendente"
      };
    });

    return { success: true, data: dadosFormatados };
  } catch (error) {
    console.error("Erro listarAlunosComTurmaAction:", error);
    return { success: false, error: "Erro ao buscar lista de alunos." };
  }
}

// ==================== LISTAR TURMAS ====================
export async function listarTurmasAction() {
  try {
    const turmas = await prisma.turma.findMany({
      include: {
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
        },
        matriculaturma: {
          select: { idusuario: true }
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
    console.error("Erro listarTurmasAction:", error);
    return { success: false, error: "Erro ao buscar turmas." };
  }
}

// ==================== BUSCAR TURMA POR ID ====================
export async function buscarTurmaPorIdAction(turmaId: number) {
  try {
    console.log(`🔍 Buscando turma ID: ${turmaId}`);
    
    const turma = await prisma.turma.findUnique({
      where: { idturma: turmaId },
      include: {
        disciplinas: {
          include: {
            disciplina: {
              include: {
                professor: {
                  select: { idusuario: true, nome: true }
                }
              }
            }
          }
        },
        matriculaturma: {
          select: { 
            idusuario: true,
            usuario: {
              select: {
                nome: true,
                matricula: true
              }
            }
          }
        }
      }
    });

    if (!turma) {
      console.error(`❌ Turma ${turmaId} não encontrada`);
      return { success: false, error: 'Turma não encontrada' };
    }

    console.log(`✅ Turma encontrada: ${turma.nome_turma}`);
    console.log(`📚 Disciplinas vinculadas: ${turma.disciplinas.length}`);
    
    // Formatar dados para o formato esperado pelo componente
    const professorId = turma.disciplinas[0]?.disciplina?.professor?.idusuario || null;
    const professorNome = turma.disciplinas[0]?.disciplina?.professor?.nome || null;
    const alunosIds = turma.matriculaturma.map(m => m.idusuario);

    console.log(`👨‍🏫 Professor atual: ${professorNome} (ID: ${professorId})`);
    console.log(`👥 Total de alunos: ${alunosIds.length}`);

    const dadosFormatados: {
      id: number;
      nome: string | null;
      serie: string | null;
      turno: string | null;
      anoLetivo: number | null;
      limiteVagas: number | null;
      professorId: number | null;
      professorNome: string | null;
      alunosIds: number[];
    } = {
      id: turma.idturma,
      nome: turma.nome_turma,
      serie: turma.serie,
      turno: turma.turno,
      anoLetivo: turma.ano_letivo,
      limiteVagas: turma.limite_vagas,
      professorId: professorId,
      professorNome: professorNome,
      alunosIds: alunosIds
    };

    return { success: true, data: dadosFormatados };
  } catch (error) {
    console.error('❌ Erro ao buscar turma:', error);
    return { success: false, error: 'Erro ao carregar turma' };
  }
}

// ==================== DADOS PARA CADASTRO DE TURMA ====================
export async function getDadosCadastroTurmaAction() {
  try {
    const [disciplinas, professores, alunos] = await prisma.$transaction([
      prisma.disciplina.findMany({
        include: { professor: { select: { idusuario: true, nome: true } } },
        orderBy: { nome_disciplina: 'asc' }
      }),
      prisma.usuario.findMany({
        where: { tipo: 'professor' },
        select: { idusuario: true, nome: true },
        orderBy: { nome: 'asc' }
      }),
      prisma.usuario.findMany({
        where: { tipo: 'aluno' },
        select: { idusuario: true, nome: true, matricula: true },
        orderBy: { nome: 'asc' }
      })
    ]);

    return { success: true, data: { disciplinas, professores, alunos } };
  } catch (error) {
    console.error("Erro getDadosCadastroTurmaAction:", error);
    return { success: false, error: "Erro ao carregar dados para cadastro." };
  }
}

// ==================== CADASTRAR TURMA ====================
export async function cadastrarTurmaAction(dados: {
  nome_turma: string;
  serie: string;
  turno: string;
  ano_letivo: number;
  limite_vagas?: number | null;
  disciplinaId: number;
  alunosIds: number[];
}) {
  try {
    const novaTurma = await prisma.$transaction(async (tx) => {
      const turmaCriada = await tx.turma.create({
        data: {
          nome_turma: dados.nome_turma,
          serie: dados.serie,
          turno: dados.turno,
          ano_letivo: dados.ano_letivo,
          limite_vagas: dados.limite_vagas ?? null
        }
      });

      await tx.turmadisciplina.create({
        data: {
          turmaid: turmaCriada.idturma,
          disciplinaid: dados.disciplinaId
        }
      });

      if (dados.alunosIds.length > 0) {
        await tx.matriculaturma.createMany({
          data: dados.alunosIds.map(idAluno => ({
            idusuario: idAluno,
            idturma: turmaCriada.idturma
          }))
        });
      }

      return turmaCriada;
    });

    revalidatePath("/secretaria/turmas");
    revalidatePath("/secretaria/dashboard");
    return { success: true, data: novaTurma };
  } catch (error) {
    console.error("Erro cadastrarTurmaAction:", error);
    return { success: false, error: "Erro ao cadastrar turma." };
  }
}

// ==================== ATUALIZAR TURMA ====================
export async function atualizarTurmaAction(dados: {
  turmaId: number;
  nome_turma: string;
  serie: string;
  turno: string;
  ano_letivo: number;
  limite_vagas: number | null;
  professorId: number | null;
  alunosIds: number[];
}) {
  try {
    console.log("🔄 Iniciando atualização de turma:", {
      turmaId: dados.turmaId,
      professorId: dados.professorId,
      totalAlunos: dados.alunosIds.length
    });

    const turmaAtualizada = await prisma.$transaction(async (tx) => {
      // 1. Atualizar dados básicos da turma
      const turma = await tx.turma.update({
        where: { idturma: dados.turmaId },
        data: {
          nome_turma: dados.nome_turma,
          serie: dados.serie,
          turno: dados.turno,
          ano_letivo: dados.ano_letivo,
          limite_vagas: dados.limite_vagas
        }
      });

      console.log("✅ Turma básica atualizada");

      // 2. SEMPRE remover vínculos antigos de disciplinas
      const vinculosRemovidos = await tx.turmadisciplina.deleteMany({
        where: { turmaid: dados.turmaId }
      });
      
      console.log(`🗑️ Removidos ${vinculosRemovidos.count} vínculos antigos`);

      // 3. Atualizar professor (através da disciplina)
      if (dados.professorId) {
        // Buscar disciplina onde o professor é o responsável
        const disciplinaProfessor = await tx.disciplina.findFirst({
          where: { 
            professor: {
              idusuario: dados.professorId
            }
          },
          select: {
            iddisciplina: true,
            nome_disciplina: true
          }
        });

        if (disciplinaProfessor) {
          // Criar novo vínculo com a disciplina do professor
          await tx.turmadisciplina.create({
            data: {
              turmaid: dados.turmaId,
              disciplinaid: disciplinaProfessor.iddisciplina
            }
          });
          
          console.log(`✅ Professor vinculado: disciplina ${disciplinaProfessor.nome_disciplina}`);
        } else {
          console.warn(`⚠️ Nenhuma disciplina encontrada para o professor ${dados.professorId}`);
        }
      } else {
        console.log("ℹ️ Nenhum professor selecionado");
      }

      // 4. Atualizar alunos
      // Remover todas as matrículas antigas
      const matriculasRemovidas = await tx.matriculaturma.deleteMany({
        where: { idturma: dados.turmaId }
      });
      
      console.log(`🗑️ Removidas ${matriculasRemovidas.count} matrículas antigas`);

      // Adicionar novas matrículas
      if (dados.alunosIds.length > 0) {
        const novasMatriculas = await tx.matriculaturma.createMany({
          data: dados.alunosIds.map(idAluno => ({
            idusuario: idAluno,
            idturma: dados.turmaId
          }))
        });
        
        console.log(`✅ Adicionadas ${novasMatriculas.count} novas matrículas`);
      } else {
        console.log("ℹ️ Nenhum aluno selecionado");
      }

      return turma;
    });

    console.log("🎉 Transação concluída com sucesso");

    revalidatePath("/secretaria/turmas");
    revalidatePath(`/secretaria/turmas/editar/${dados.turmaId}`);
    revalidatePath("/secretaria/dashboard");
    
    return { success: true, data: turmaAtualizada };
  } catch (error) {
    console.error("❌ Erro atualizarTurmaAction:", error);
    return { success: false, error: "Erro ao atualizar turma." };
  }
}

// ==================== EXCLUIR TURMA ====================
export async function excluirTurmaAction(turmaId: number) {
  try {
    await prisma.$transaction(async (tx) => {
      // Remover vínculos com disciplinas
      await tx.turmadisciplina.deleteMany({
        where: { turmaid: turmaId }
      });

      // Remover matrículas de alunos
      await tx.matriculaturma.deleteMany({
        where: { idturma: turmaId }
      });

      // Excluir a turma
      await tx.turma.delete({
        where: { idturma: turmaId }
      });
    });

    revalidatePath("/secretaria/turmas");
    revalidatePath("/secretaria/dashboard");
    return { success: true, message: "Turma excluída com sucesso" };
  } catch (error: any) {
    console.error("Erro excluirTurmaAction:", error);
    
    if (error.code === "P2025") {
      return { success: false, error: "Turma não encontrada" };
    }
    
    return { success: false, error: "Erro ao excluir turma." };
  }
}

// ==================== LISTAR PROFESSORES ====================
export async function listarProfessoresAction() {
  try {
    // Buscar professores e suas disciplinas através da tabela disciplina
    const professores = await prisma.usuario.findMany({
      where: { tipo: 'professor' },
      select: {
        idusuario: true,
        nome: true,
        cpf: true,
        matricula: true,
        email: true
      },
      orderBy: { nome: 'asc' }
    });

    // Buscar disciplinas para cada professor
    const professoresComDisciplinas = await Promise.all(
      professores.map(async (prof) => {
        const disciplina = await prisma.disciplina.findFirst({
          where: {
            professor: {
              idusuario: prof.idusuario
            }
          },
          select: {
            nome_disciplina: true
          }
        });

        return {
          idusuario: prof.idusuario,
          nome: prof.nome || 'Sem nome',
          cpf: prof.cpf || undefined,
          matricula: prof.matricula || undefined,
          email: prof.email || undefined,
          status: 'ATIVO',
          disciplina: disciplina?.nome_disciplina || 'Sem disciplina'
        };
      })
    );

    return { success: true, data: professoresComDisciplinas };
  } catch (error) {
    console.error('Erro ao listar professores:', error);
    return { success: false, error: 'Erro ao carregar professores' };
  }
}

// ==================== LISTAR ALUNOS ====================
export async function listarAlunosAction() {
  try {
    const alunos = await prisma.usuario.findMany({
      where: { tipo: 'aluno' },
      select: { 
        idusuario: true, 
        nome: true, 
        matricula: true,
        cpf: true,
        email: true
      },
      orderBy: { nome: 'asc' }
    });

    return { success: true, data: alunos };
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    return { success: false, error: 'Erro ao carregar alunos' };
  }
}

// ==================== DIAGNÓSTICO: VERIFICAR DISCIPLINAS DOS PROFESSORES ====================
export async function verificarDisciplinasProfessoresAction() {
  try {
    const professores = await prisma.usuario.findMany({
      where: { tipo: 'professor' },
      select: {
        idusuario: true,
        nome: true
      }
    });

    const resultado = await Promise.all(
      professores.map(async (prof) => {
        const disciplinas = await prisma.disciplina.findMany({
          where: {
            professor: {
              idusuario: prof.idusuario
            }
          },
          select: {
            iddisciplina: true,
            nome_disciplina: true
          }
        });

        return {
          professorId: prof.idusuario,
          professorNome: prof.nome,
          totalDisciplinas: disciplinas.length,
          disciplinas: disciplinas.map(d => ({
            id: d.iddisciplina,
            nome: d.nome_disciplina
          }))
        };
      })
    );

    console.log("📊 DIAGNÓSTICO DE PROFESSORES E DISCIPLINAS:");
    resultado.forEach(r => {
      console.log(`\n👨‍🏫 ${r.professorNome} (ID: ${r.professorId})`);
      console.log(`   📚 Total de disciplinas: ${r.totalDisciplinas}`);
      if (r.totalDisciplinas > 0) {
        r.disciplinas.forEach(d => {
          console.log(`   - ${d.nome} (ID: ${d.id})`);
        });
      } else {
        console.log(`   ⚠️ PROBLEMA: Professor sem disciplinas cadastradas!`);
      }
    });

    return { success: true, data: resultado };
  } catch (error) {
    console.error('Erro ao verificar disciplinas:', error);
    return { success: false, error: 'Erro no diagnóstico' };
  }
}
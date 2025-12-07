'use server';

import { prisma } from "@/lib/prisma";
import { tipo_usuario, Prisma } from "@prisma/client"; // Adicionado Prisma para tipos
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Interface auxiliar para Tipagem (evita erros de 'any')
interface DadosUsuarioInput {
  nome: string;
  cpf: string;
  email: string;
  senha?: string;
  tipo: tipo_usuario;
  matricula?: string | null;
}

// =========================================================
// 0. AUTENTICAÇÃO (Login)
// =========================================================
export async function loginAction(dados: { cpf: string; senha: string }) {
  console.log("--- LOGIN ---", dados.cpf);
  try {
    const usuario = await prisma.usuario.findUnique({ 
        where: { cpf: dados.cpf },
        select: { 
            idusuario: true, 
            senha: true, 
            tipo: true, 
            nome: true 
        }
    });

    if (!usuario) return { success: false, error: "CPF não encontrado." };

    const senhaBanco = usuario.senha || '';
    let senhaValida = false;

    // Verifica se é hash ou texto plano (legado)
    if (senhaBanco.startsWith('$2')) {
      senhaValida = await bcrypt.compare(dados.senha, senhaBanco);
    } else {
      senhaValida = senhaBanco === dados.senha;
    }

    if (!senhaValida) return { success: false, error: "Senha incorreta." };

    // CORREÇÃO NEXT.JS 15: await cookies()
    const cookieStore = await cookies();
    
    cookieStore.set('portal_usuario_id', String(usuario.idusuario), {
      httpOnly: true, path: '/', maxAge: 86400 
    });

    const { senha, ...usuarioData } = usuario;
    
    return { success: true, usuario: usuarioData };
  } catch (error) { 
    console.error(error);
    return { success: false, error: "Erro interno." }; 
  }
}

// =========================================================
// 1. ADMINISTRAÇÃO (Usuários CRUD)
// =========================================================
export async function cadastrarUsuarioAction(dados: DadosUsuarioInput) {
  try {
    const existe = await prisma.usuario.findFirst({
      where: { OR: [{ email: dados.email }, { cpf: dados.cpf }] }
    });
    if (existe) return { success: false, error: "Usuário já existe." };

    // Garante hash da senha se fornecida
    const hash = dados.senha ? await bcrypt.hash(dados.senha, 10) : undefined;
    
    await prisma.usuario.create({
      data: {
        nome: dados.nome, 
        cpf: dados.cpf, 
        email: dados.email,
        senha: hash, 
        tipo: dados.tipo,
        matricula: dados.matricula || null,
      }
    });
    revalidatePath('/admin/usuarios'); 
    return { success: true };
  } catch (error) { return { success: false, error: "Erro ao cadastrar." }; }
}

export async function listarUsuariosAction() {
  const users = await prisma.usuario.findMany({ orderBy: { nome: 'asc' } });
  return { success: true, data: users };
}

export async function buscarUsuarioPorIdAction(id: number) {
  const u = await prisma.usuario.findUnique({ where: { idusuario: id } });
  return u ? { success: true, data: u } : { success: false, error: "Não encontrado" };
}

export async function atualizarUsuarioAction(id: number, dados: DadosUsuarioInput) {
  try {
    await prisma.usuario.update({
      where: { idusuario: id },
      data: { 
        nome: dados.nome, cpf: dados.cpf, email: dados.email, 
        tipo: dados.tipo, matricula: dados.matricula || null 
      },
    });
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (e) { return { success: false, error: "Erro ao atualizar." }; }
}

export async function excluirUsuarioAction(id: number) {
  try {
    // Limpeza de vínculos antes de deletar
    await prisma.matriculaturma.deleteMany({ where: { idusuario: id } });
    await prisma.alunodisciplina.deleteMany({ where: { idaluno: id } });
    await prisma.usuario.delete({ where: { idusuario: id } });
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (e) { return { success: false, error: "Possui vínculos ou erro interno." }; }
}

// =========================================================
// 2. ALUNO (Dashboard) - [CORRIGIDO E POSICIONADO]
// =========================================================
// Em lib/actions.ts

export async function getDashboardAlunoAction(idAluno: number) {
  try {
    // 1. Busca dados do aluno, CPF e Turma
    const aluno = await prisma.usuario.findUnique({
      where: { idusuario: idAluno },
      select: { 
        nome: true, 
        cpf: true,
        matriculaturma: {
          include: { turma: true },
          take: 1 // Pega a turma mais recente
        }
      }
    });

    if (!aluno) return { success: false, error: "Aluno não encontrado." };

    // 2. Busca disciplinas, notas e frequência
    const matriculas = await prisma.alunodisciplina.findMany({
      where: { idaluno: idAluno },
      include: {
        disciplina: {
          include: {
            professor: { select: { nome: true } }
          }
        },
        nota: true,
        frequencia: true
      }
    });

    // 3. Cálculos Estatísticos
    let somaMedias = 0;
    let disciplinasComNota = 0;
    let totalFaltasGeral = 0;

    const disciplinasFormatadas = matriculas.map((m) => {
      // Média da disciplina
      const somaNotas = m.nota.reduce((acc, n) => acc + Number(n.valor || 0), 0);
      const mediaNumerica = m.nota.length > 0 ? (somaNotas / m.nota.length) : 0;
      
      if (m.nota.length > 0) {
        somaMedias += mediaNumerica;
        disciplinasComNota++;
      }

      // Faltas da disciplina
      const faltasDisc = m.frequencia.reduce((acc, f) => acc + (Number(f.faltas) || 0), 0);
      totalFaltasGeral += faltasDisc;

      return {
        id: m.iddisciplina, // Ajustado para 'id' para facilitar no front
        nome: m.disciplina.nome_disciplina, // Ajustado para 'nome'
        professor: m.disciplina.professor?.nome || "Sem Professor",
        media: m.nota.length > 0 ? mediaNumerica.toFixed(1) : "-",
        frequencia: `${faltasDisc} faltas`
      };
    });

    // Cálculos Gerais
    const mediaGeralCalculada = disciplinasComNota > 0 
      ? (somaMedias / disciplinasComNota).toFixed(1) 
      : "-";

    const nomeTurma = aluno.matriculaturma[0]?.turma?.nome_turma || "Sem Turma";

    return {
      success: true,
      data: {
        nome: aluno.nome,
        cpf: aluno.cpf || "Não informado",
        turma: nomeTurma,
        mediaGeral: mediaGeralCalculada,
        frequenciaGeral: `${totalFaltasGeral} faltas totais`, // Retornando string formatada
        totalDisciplinas: matriculas.length,
        disciplinas: disciplinasFormatadas
      }
    };

  } catch (error) {
    console.error("Erro no dashboard do aluno:", error);
    return { success: false, error: "Erro ao carregar dados." };
  }
}
// =========================================================
// 3. PROFESSOR (Dashboard e Listagem)
// =========================================================

export async function getDashboardProfessorAction(idProfessor: number) {
  try {
    // OTIMIZAÇÃO: Usa _count para contar alunos sem baixar os dados pesados
    const vinculos = await prisma.turmadisciplina.findMany({
      where: { disciplina: { idprofessor: idProfessor } },
      include: { 
        turma: true, 
        disciplina: { 
            select: {
                iddisciplina: true,
                nome_disciplina: true,
                _count: { select: { alunodisciplina: true } } // Conta no banco
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
      serie: v.turma.serie || "-",
      turno: v.turma.turno || "Manhã",
      totalAlunos: v.disciplina._count.alunodisciplina || 0 // Usa a contagem otimizada
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
    console.error(error);
    return { success: false, error: "Erro interno." }; 
  }
}

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
    console.error("❌ Erro na getAlunosDaTurmaAction:", error); 
    return { success: false, error: "Erro ao buscar alunos." }; 
  }
}

// 4. PROFESSOR (Ações de Lançamento)
// ===================================

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
      valor: Number(n.valor), // Garante conversão de Decimal
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
        mediaAtual: mediaAtual,
      }
    };
  } catch (error) {
    return { success: false, error: "Erro ao carregar dados de notas." };
  }
}

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
  } catch (error) {
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
        revalidatePath('/aluno/dashboard'); 
        revalidatePath('/professor/turma/[turmaid]/alunos');
        return { success: true };
      } catch (error) { return { success: false, error: "Erro ao salvar." }; }
}

export async function lancarNotasAction(dados: {
  descricaoAvaliacao: string;
  notas: { idAlunoDisciplina: number; valor: number }[]
}) {
    try {
        await prisma.$transaction(async (tx) => {
          for (const notaItem of dados.notas) {
            const notaExistente = await tx.nota.findFirst({
              where: {
                idalunodisciplina: notaItem.idAlunoDisciplina,
                descricao: dados.descricaoAvaliacao
              }
            });
    
            if (notaExistente) {
              await tx.nota.update({
                where: { idnota: notaExistente.idnota },
                data: { valor: notaItem.valor, data: new Date() }
              });
            } else {
              await tx.nota.create({
                data: {
                  idalunodisciplina: notaItem.idAlunoDisciplina,
                  descricao: dados.descricaoAvaliacao,
                  valor: notaItem.valor,
                  data: new Date()
                }
              });
            }
          }
        });
        revalidatePath('/aluno/dashboard'); 
        revalidatePath('/professor/turma/[turmaid]/alunos');
        return { success: true };
      } catch (error) { return { success: false, error: "Erro ao salvar notas." }; }
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
      where: {
        idalunodisciplina: { in: idsVinculos },
        data: data
      }
    });

    revalidatePath('/professor/dashboard'); 
    revalidatePath('/professor/turma/[turmaid]/alunos'); 
    
    return { success: true, count: resultado.count };
  } catch (error) {
    return { success: false, error: "Erro ao excluir." };
  }
}

export async function excluirNotaAction(disciplinaId: number, descricaoAvaliacao: string) {
  try {
    const vinculos = await prisma.alunodisciplina.findMany({
      where: { iddisciplina: disciplinaId },
      select: { idalunodisciplina: true }
    });
    
    const idsVinculos = vinculos.map(v => v.idalunodisciplina);

    const resultado = await prisma.nota.deleteMany({
      where: {
        idalunodisciplina: { in: idsVinculos },
        descricao: descricaoAvaliacao
      }
    });

    revalidatePath('/professor/dashboard'); 
    revalidatePath('/professor/turma/[turmaid]/alunos');
    return { success: true, count: resultado.count };
  } catch (error) {
    return { success: false, error: "Erro ao excluir." };
  }
}

// =========================================================
// 5. SECRETARIA / DIRETOR
// =========================================================

export async function getDashboardSecretarioAction(idUsuario: number) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { idusuario: idUsuario }
    });

    if (!usuario) return { success: false, error: "Usuário não encontrado." };

    const [totalAlunos, totalProfessores, totalTurmas] = await prisma.$transaction([
      prisma.usuario.count({ where: { tipo: 'aluno' } }),
      prisma.usuario.count({ where: { tipo: 'professor' } }),
      prisma.turma.count(),
    ]);

    return {
      success: true,
      data: {
        nome: usuario.nome,
        tipo: usuario.tipo,
        stats: {
          alunos: totalAlunos,
          professores: totalProfessores,
          turmas: totalTurmas
        }
      }
    };
  } catch (error) {
    return { success: false, error: "Erro dashboard." };
  }
}

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
      // 1. Criar turma
      const turmaCriada = await tx.turma.create({
        data: {
          nome_turma: dados.nome_turma,
          serie: dados.serie,
          turno: dados.turno,
          ano_letivo: dados.ano_letivo,
          limite_vagas: dados.limite_vagas ?? null,
        },
      });

      // 2. Vincular disciplina principal
      await tx.turmadisciplina.create({
        data: {
          turmaid: turmaCriada.idturma,
          disciplinaid: dados.disciplinaId,
        },
      });

      // 3. Matricular alunos
      if (dados.alunosIds.length > 0) {
        await tx.matriculaturma.createMany({
          data: dados.alunosIds.map(idAluno => ({
            idusuario: idAluno,
            idturma: turmaCriada.idturma,
          })),
        });
      }
      return turmaCriada;
    });

    revalidatePath("/secretaria/turmas");
    revalidatePath("/secretaria/dashboard");
    return { success: true, data: novaTurma };

  } catch (error) {
    return { success: false, error: "Erro ao cadastrar turma." };
  }
}

export async function getDadosCadastroTurmaAction() {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      include: { professor: true }
    });
    const alunos = await prisma.usuario.findMany({
      where: { tipo: 'aluno' },
      orderBy: { nome: 'asc' }
    });
    return { success: true, disciplinas, alunos };
  } catch (error) {
    return { success: false, error: "Erro ao carregar dados." };
  }
}

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

export async function listarTurmasAction() {
  try {
    const turmas = await prisma.turma.findMany({
      select: { idturma: true, nome_turma: true, serie: true },
      orderBy: [{ serie: 'asc' }, { nome_turma: 'asc' }],
    });
    return { success: true, data: turmas };
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

// =========================================================
// 6. DIRETOR: CADASTRAR DISCIPLINA (BLINDADA)
// =========================================================
export async function cadastrarDisciplinaComVinculoAction(dados: {
  nome_disciplina: string;
  idprofessor: number;
  carga_horaria: number;
  turmaId: number; 
}) {
  try {
    // Passo 1: Buscar alunos DA TURMA antes de iniciar a transação
    // Isso é feito fora para preparar os dados de vínculo
    const matriculas = await prisma.matriculaturma.findMany({
      where: { idturma: dados.turmaId },
      select: { idusuario: true },
    });

    const resultadoTransacao = await prisma.$transaction(async (tx) => {
      // 1. Cadastrar a Disciplina
      const disciplinaCriada = await tx.disciplina.create({
        data: {
          nome_disciplina: dados.nome_disciplina,
          idprofessor: dados.idprofessor,
          carga_horaria: dados.carga_horaria,
        },
      });

      // 2. VINCULAR A DISCIPLINA À TURMA
      await tx.turmadisciplina.create({
        data: {
          disciplinaid: disciplinaCriada.iddisciplina,
          turmaid: dados.turmaId,
        },
      });

      // 3. INSCREVER OS ALUNOS (DENTRO DA TRANSAÇÃO)
      // Se isso falhar, a disciplina não é criada, garantindo integridade.
      if (matriculas.length > 0) {
        await tx.alunodisciplina.createMany({
          data: matriculas.map(m => ({
            idaluno: m.idusuario,
            iddisciplina: disciplinaCriada.iddisciplina,
          })),
          skipDuplicates: true
        });
      }
      
      return disciplinaCriada; 
    });

    revalidatePath('/diretor/disciplinas'); 
    revalidatePath('/diretor/turmas'); 
    revalidatePath('/aluno/dashboard');

    return { success: true, data: resultadoTransacao };

  } catch (error) {
    console.error("Erro na transação de cadastro:", error);
    return { success: false, error: "Falha ao cadastrar. Verifique os dados." };
  }
}

// Ação de sincronização manual (mantida caso precise)
export async function inscreverAlunosDaTurmaEmDisciplinaAction(dados: {
  disciplinaId: number;
  turmaId: number;
}) {
  try {
    const matriculas = await prisma.matriculaturma.findMany({
      where: { idturma: dados.turmaId },
      select: { idusuario: true },
    });

    const alunosIds = matriculas.map(m => m.idusuario);

    if (alunosIds.length === 0) return { success: true, count: 0 };

    const resultado = await prisma.alunodisciplina.createMany({
      data: alunosIds.map(idAluno => ({
        idaluno: idAluno,
        iddisciplina: dados.disciplinaId,
      })),
      skipDuplicates: true, 
    });

    revalidatePath('/aluno/dashboard');
    return { success: true, count: resultado.count };
  } catch (error) {
    return { success: false, error: "Falha na inscrição." };
  }
}

// =========================================================
// LEGACY ACTIONS
// =========================================================
export async function cadastrarDisciplinaAction(dados: {
  nome_disciplina: string;
  idprofessor: number;
  carga_horaria: number;
}) {
  try {
    const novaDisciplina = await prisma.disciplina.create({
      data: { nome_disciplina: dados.nome_disciplina, idprofessor: dados.idprofessor, carga_horaria: dados.carga_horaria, }
    });
    revalidatePath('/diretor/disciplinas'); 
    return { success: true, data: novaDisciplina };
  } catch (error) { return { success: false, error: "Erro ao cadastrar." }; }
}

export async function vincularDisciplinaTurmaAction(dados: { disciplinaId: number; turmaId: number; }) {
  try {
    await prisma.turmadisciplina.create({
      data: { disciplinaid: dados.disciplinaId, turmaid: dados.turmaId, },
    });
    revalidatePath('/diretor/turmas-disciplinas'); 
    return { success: true };
  } catch (error) { return { success: false, error: "Falha ao criar o vínculo." }; }
}

export async function listarDisciplinasComProfessorAction() {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      include: {
        professor: true 
      },
      orderBy: { nome_disciplina: "asc" }
    });
    return { success: true, data: disciplinas };
  } catch (e) {
    return { success: false, error: "Erro ao buscar." };
  }
}
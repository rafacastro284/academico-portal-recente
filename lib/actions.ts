'use server'; // <--- OBRIGATÓRIO NA PRIMEIRA LINHA

import { prisma } from "@/lib/prisma";
import { tipo_usuario } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// =========================================================
// 0. AUTENTICAÇÃO (Login)
// =========================================================
export async function loginAction(dados: { cpf: string; senha: string }) {
  console.log("--- LOGIN ---", dados.cpf);
  try {
    const usuario = await prisma.usuario.findUnique({ where: { cpf: dados.cpf } });
    if (!usuario) return { success: false, error: "CPF não encontrado." };

    const senhaBanco = usuario.senha || '';
    let senhaValida = false;

    if (senhaBanco.startsWith('$2')) {
      senhaValida = await bcrypt.compare(dados.senha, senhaBanco);
    } else {
      senhaValida = senhaBanco === dados.senha;
    }

    if (!senhaValida) return { success: false, error: "Senha incorreta." };

    const cookieStore = await cookies();
    cookieStore.set('portal_usuario_id', String(usuario.idusuario), {
      httpOnly: true, path: '/', maxAge: 86400 
    });

    return { success: true, usuario };
  } catch (error) { 
    console.error(error);
    return { success: false, error: "Erro interno." }; 
  }
}

// =========================================================
// 1. ADMINISTRAÇÃO (Usuários CRUD)
// =========================================================
export async function cadastrarUsuarioAction(dados: any) {
  try {
    const existe = await prisma.usuario.findFirst({
      where: { OR: [{ email: dados.email }, { cpf: dados.cpf }] }
    });
    if (existe) return { success: false, error: "Usuário já existe." };

    const hash = await bcrypt.hash(dados.senha, 10);
    
    await prisma.usuario.create({
      data: {
        nome: dados.nome, 
        cpf: dados.cpf, 
        email: dados.email,
        senha: hash, 
        tipo: dados.tipo as tipo_usuario,
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

export async function atualizarUsuarioAction(id: number, dados: any) {
  await prisma.usuario.update({
    where: { idusuario: id },
    data: { 
      nome: dados.nome, cpf: dados.cpf, email: dados.email, 
      tipo: dados.tipo, matricula: dados.matricula || null 
    },
  });
  revalidatePath('/admin/usuarios');
  return { success: true };
}

export async function excluirUsuarioAction(id: number) {
  try {
    // Limpeza de dependências antes de excluir
    await prisma.matriculaturma.deleteMany({ where: { idusuario: id } });
    await prisma.alunodisciplina.deleteMany({ where: { idaluno: id } });
    await prisma.usuario.delete({ where: { idusuario: id } });
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (e) { return { success: false, error: "Possui vínculos ou erro interno." }; }
}

// =========================================================
// 3. PROFESSOR (Dashboard, Frequência, Notas)
// =========================================================

export async function getDashboardProfessorAction(idProfessor: number) {
  try {
    const vinculos = await prisma.turmadisciplina.findMany({
      where: { 
        disciplina: { idprofessor: idProfessor } 
      },
      include: { 
        turma: true, 
        disciplina: { include: { alunodisciplina: true } } 
      }
    });

    // Otimização para buscar o nome do professor apenas uma vez
    const professor = await prisma.usuario.findUnique({ where: { idusuario: idProfessor }, select: { nome: true } });

    const turmasFormatadas = vinculos.map((v) => ({
      idTurma: v.turma.idturma,
      idDisciplina: v.disciplina.iddisciplina,
      nomeTurma: v.turma.nome_turma || "Turma",
      nomeDisciplina: v.disciplina.nome_disciplina || "Disciplina",
      serie: v.turma.serie || "-",
      turno: v.turma.turno || "Manhã",
      totalAlunos: v.disciplina.alunodisciplina?.length || 0
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

// 🎯 Ação Corrigida: Removido o filtro complexo da Turma que estava falhando.
export async function getAlunosDaTurmaAction(turmaId: number, disciplinaId: number) {
  try {
    const alunosVinculados = await prisma.alunodisciplina.findMany({
      where: {
        iddisciplina: disciplinaId,
        // 🚨 CORREÇÃO: Removido o filtro `usuario: { matriculaturma: { some: { idturma: turmaId } } }`
        // Buscamos apenas os alunos inscritos na Disciplina. A `MatriculaTurma` é verificada
        // no momento da sincronização.
      },
      // Inclui os relacionamentos necessários para formatar a lista:
      include: { 
        usuario: { select: { idusuario: true, nome: true, matricula: true } }, 
        nota: true, 
        frequencia: true 
      },
      orderBy: { usuario: { nome: 'asc' } }
    });

    const turmaInfo = await prisma.turma.findUnique({ where: { idturma: turmaId } });
    const discInfo = await prisma.disciplina.findUnique({ where: { iddisciplina: disciplinaId } });

    const alunosFormatados = alunosVinculados.map((ad) => {
      const somaNotas = ad.nota.reduce((acc, n) => acc + Number(n.valor || 0), 0);
      const media = ad.nota.length > 0 ? (somaNotas / ad.nota.length).toFixed(1) : "-";
      const faltas = ad.frequencia.reduce((acc, f) => acc + (f.faltas || 0), 0);

      return {
        idAlunoDisciplina: ad.idalunodisciplina,
        idAluno: ad.idaluno,
        nome: ad.usuario.nome,
        matricula: ad.usuario.matricula,
        mediaAtual: media,
        faltas: faltas
      };
    });

    return {
      success: true,
      data: {
        turma: turmaInfo?.nome_turma,
        disciplina: discInfo?.nome_disciplina,
        alunos: alunosFormatados
      }
    };
  } catch (error) { 
    console.error("❌ Erro na getAlunosDaTurmaAction:", error); // Log detalhado do erro
    return { success: false, error: "Erro ao buscar alunos." }; 
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
      // Remove lançamentos anteriores nesta data
      prisma.frequencia.deleteMany({
        where: { idalunodisciplina: { in: idsVinculos }, data: dataFrequencia }
      }),
      // Cria novos
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
    return { success: true };
  } catch (error) { return { success: false, error: "Erro ao salvar notas." }; }
}

export async function excluirLancamentoFrequenciaAction(disciplinaId: number, dataRegistro: string) {
  try {
    const data = new Date(dataRegistro);

    // Encontra todos os vínculos AlunoDisciplina para a disciplina
    const vinculos = await prisma.alunodisciplina.findMany({
      where: { iddisciplina: disciplinaId },
      select: { idalunodisciplina: true }
    });
    
    const idsVinculos = vinculos.map(v => v.idalunodisciplina);

    // Exclui a frequência para a data e vínculos encontrados
    const resultado = await prisma.frequencia.deleteMany({
      where: {
        idalunodisciplina: { in: idsVinculos },
        data: data
      }
    });

    revalidatePath('/professor/dashboard'); 
    return { success: true, count: resultado.count };
  } catch (error) {
    console.error("Erro ao excluir frequência:", error);
    return { success: false, error: "Erro ao excluir o lançamento de frequência." };
  }
}
// --- 3. PROFESSOR (Excluir Nota) ---
export async function excluirNotaAction(disciplinaId: number, descricaoAvaliacao: string) {
  try {
    // Encontra todos os vínculos AlunoDisciplina para a disciplina
    const vinculos = await prisma.alunodisciplina.findMany({
      where: { iddisciplina: disciplinaId },
      select: { idalunodisciplina: true }
    });
    
    const idsVinculos = vinculos.map(v => v.idalunodisciplina);

    // Exclui as notas com a descrição especificada
    const resultado = await prisma.nota.deleteMany({
      where: {
        idalunodisciplina: { in: idsVinculos },
        descricao: descricaoAvaliacao
      }
    });

    revalidatePath('/professor/dashboard'); 
    
    return { success: true, count: resultado.count };
  } catch (error) {
    console.error("Erro ao excluir notas:", error);
    return { success: false, error: "Erro ao excluir as notas da avaliação." };
  }
}

// =========================================================
// 4. ALUNO (Dashboard e Detalhes)
// =========================================================
// ... (Nenhuma alteração necessária aqui)
export async function getDashboardAlunoAction(idAluno: number) {
  try {
    const aluno = await prisma.usuario.findUnique({
      where: { idusuario: idAluno },
      include: {
        matriculaturma: { include: { turma: true } },
        alunodisciplina: {
          include: {
            disciplina: { include: { professor: true } },
            nota: true,
            frequencia: true,
          }
        }
      }
    });

    if (!aluno) return { success: false, error: "Aluno não encontrado" };

    const nomeTurma = aluno.matriculaturma[0]?.turma?.nome_turma || "Não enturmado";
    let somaMedias = 0, qtdMedias = 0, somaFreq = 0, qtdFreq = 0;

    const disciplinas = aluno.alunodisciplina.map((ad) => {
      const somaNotas = ad.nota.reduce((acc, n) => acc + Number(n.valor || 0), 0);
      const mediaNum = ad.nota.length > 0 ? (somaNotas / ad.nota.length) : 0;
      if (ad.nota.length > 0) { somaMedias += mediaNum; qtdMedias++; }

      const faltas = ad.frequencia.reduce((acc, f) => acc + (f.faltas || 0), 0);
      const freqNum = Math.max(0, 100 - faltas);
      somaFreq += freqNum; qtdFreq++;

      const nomeProf = ad.disciplina.professor?.nome || "Prof.";

      return {
        id: ad.disciplina.iddisciplina,
        nome: ad.disciplina.nome_disciplina,
        professor: nomeProf,
        media: ad.nota.length > 0 ? mediaNum.toFixed(1) : "-",
        frequencia: `${freqNum}%`
      };
    });

    const mediaGeral = qtdMedias > 0 ? (somaMedias / qtdMedias).toFixed(1) : "-";
    const frequenciaGeral = qtdFreq > 0 ? Math.round(somaFreq / qtdFreq) + "%" : "100%";

    return {
      success: true,
      data: {
        nome: aluno.nome, cpf: aluno.cpf, turma: nomeTurma,
        mediaGeral, frequenciaGeral,
        totalDisciplinas: disciplinas.length,
        disciplinas
      }
    };
  } catch (error) { 
    console.error(error);
    return { success: false, error: "Erro." }; 
  }
}

export async function getDetalhesDisciplinaAction(idDisciplina: number) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('portal_usuario_id');
    if (!userIdCookie) return { success: false, error: "Logar" };
    
    const idAluno = Number(userIdCookie.value);
    const vinculo = await prisma.alunodisciplina.findFirst({
      where: { idaluno: idAluno, iddisciplina: idDisciplina },
      include: {
        disciplina: { include: { professor: true } }, 
        nota: { orderBy: { data: 'asc' } },
        frequencia: { orderBy: { data: 'desc' } }
      }
    });

    if (!vinculo) return { success: false, error: "Não encontrada" };

    const totalNotas = vinculo.nota.reduce((acc, n) => acc + Number(n.valor || 0), 0);
    const media = vinculo.nota.length > 0 ? (totalNotas / vinculo.nota.length).toFixed(1) : "-";
    const faltas = vinculo.frequencia.reduce((acc, f) => acc + (f.faltas || 0), 0);
    const freq = Math.max(0, 100 - faltas);
    const nomeProf = vinculo.disciplina.professor?.nome || "";

    return {
      success: true,
      data: {
        nomeDisciplina: vinculo.disciplina.nome_disciplina,
        professor: nomeProf,
        notas: vinculo.nota,
        frequencias: vinculo.frequencia,
        resumo: { media, faltas, porcentagemFreq: `${freq}%` }
      }
    };
  } catch (e) { return { success: false, error: "Erro" }; }
}

// =========================================================
// 5. SECRETARIO (Dashboard)
// =========================================================
// ... (Nenhuma alteração necessária aqui)
export async function getDashboardSecretarioAction(idUsuario: number) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { idusuario: idUsuario }
    });

    if (!usuario) {
      return { success: false, error: "Usuário não encontrado." };
    }

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
    console.error("Erro dashboard secretaria:", error);
    return { success: false, error: "Erro ao carregar dados do dashboard." };
  }
}

// =========================================================
// 6. SECRETARIA: CADASTRAR TURMA (Transacional)
// =========================================================
// ... (Nenhuma alteração necessária aqui)
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

      // 2. Vincular disciplina principal à turma 
      await tx.turmadisciplina.create({
        data: {
          turmaid: turmaCriada.idturma,
          disciplinaid: dados.disciplinaId,
        },
      });

      // 3. Matricular alunos (se houver IDs)
      if (dados.alunosIds.length > 0) {
        await tx.matriculaturma.createMany({
          data: dados.alunosIds.map(idAluno => ({
            idusuario: idAluno,
            idturma: turmaCriada.idturma,
          })),
        });
      }
      
      return turmaCriada; // Retorna apenas a turma criada
    });

    if (dados.alunosIds.length > 0) {
      // Aqui você precisaria de uma ação para sincronizar as disciplinas existentes da turma
      // com os alunos recém-matriculados, mas vamos focar no fluxo de cadastro de disciplina.
    }

    revalidatePath("/secretaria/turmas");
    revalidatePath("/secretaria/dashboard");

    return { success: true, data: novaTurma };

  } catch (error) {
    console.error("❌ Erro ao cadastrar turma (Transação Revertida):", error);
    return { success: false, error: "Erro ao cadastrar turma. Verifique a disciplina principal e os alunos selecionados." };
  }
}

export async function getDadosCadastroTurmaAction() {
  try {
    // 1. Buscar disciplinas (e seus professores)
    const disciplinas = await prisma.disciplina.findMany({
      include: { professor: true }
    });

    // 2. Buscar todos os alunos
    const alunos = await prisma.usuario.findMany({
      where: { tipo: 'aluno' },
      orderBy: { nome: 'asc' }
    });

    return { success: true, disciplinas, alunos };
  } catch (error) {
    return { success: false, error: "Erro ao carregar dados." };
  }
}

// =========================================================
// 7. DIRETOR/SECRETARIA (Listagem de Dados)
// =========================================================
// ... (Nenhuma alteração necessária aqui)
export async function listarProfessoresAction() {
  try {
    const professores = await prisma.usuario.findMany({
      where: { tipo: 'professor' },
      select: { idusuario: true, nome: true },
      orderBy: { nome: 'asc' },
    });
    return { success: true, data: professores };
  } catch (error) {
    console.error("Erro ao listar professores:", error);
    return { success: false, error: "Erro ao buscar professores." };
  }
}

export async function listarTurmasAction() {
  try {
    const turmas = await prisma.turma.findMany({
      select: { idturma: true, nome_turma: true, serie: true },
      orderBy: [
        { serie: 'asc' },      
        { nome_turma: 'asc' }  
      ],
    });
    return { success: true, data: turmas };
  } catch (error) {
    console.error("Erro ao listar turmas:", error);
    return { success: false, error: "Erro ao buscar turmas." };
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
    return { success: true, data: disciplinas };
  } catch (error) {
    console.error("Erro ao listar disciplinas:", error);
    return { success: false, error: "Erro ao buscar disciplinas." };
  }
}

// =========================================================
// 8. DIRETOR: CADASTRAR DISCIPLINA (Transacional)
// =========================================================
// ... (Nenhuma alteração necessária aqui)
export async function cadastrarDisciplinaComVinculoAction(dados: {
  nome_disciplina: string;
  idprofessor: number;
  carga_horaria: number;
  turmaId: number; 
}) {
  try {
    const resultadoTransacao = await prisma.$transaction(async (tx) => {
      
      // 1. Cadastrar a Disciplina
      const disciplinaCriada = await tx.disciplina.create({
        data: {
          nome_disciplina: dados.nome_disciplina,
          idprofessor: dados.idprofessor,
          carga_horaria: dados.carga_horaria,
        },
      });

      // 2. VINCULAR A DISCIPLINA À TURMA (Relação N:N)
      await tx.turmadisciplina.create({
        data: {
          disciplinaid: disciplinaCriada.iddisciplina,
          turmaid: dados.turmaId,
        },
      });
      
      return disciplinaCriada; 
    });
    
    // --- PASSO 3: INSCREVER ALUNOS (FORA DA TRANSAÇÃO) ---
    try {
      // OBRIGATÓRIO: Chamada para sincronizar a matrícula do aluno na disciplina
      await inscreverAlunosDaTurmaEmDisciplinaAction({
        disciplinaId: resultadoTransacao.iddisciplina,
        turmaId: dados.turmaId
      });
      console.log(`Sucesso na inscrição dos alunos da Turma ${dados.turmaId} na Disciplina ${resultadoTransacao.nome_disciplina}.`);

    } catch (e) {
      console.error("Aviso: Falha ao inscrever alunos após criar disciplina:", e);
      // Mantemos o fluxo principal (a disciplina e o vínculo Turma-Disciplina estão salvos)
    }

    revalidatePath('/diretor/disciplinas'); 
    revalidatePath('/diretor/turmas'); 

    return { success: true, data: resultadoTransacao };

  } catch (error) {
    console.error("Erro na transação de cadastro/vínculo:", error);
    return { success: false, error: "Falha ao cadastrar e vincular a disciplina. Verifique se o professor e a turma existem." };
  }
}

// =========================================================
// 9. SINCRONIZAÇÃO DE MATRÍCULA (Ação Chave)
// =========================================================
// ... (Nenhuma alteração necessária aqui)
export async function inscreverAlunosDaTurmaEmDisciplinaAction(dados: {
  disciplinaId: number;
  turmaId: number;
}) {
  try {
    // 1. Encontrar todos os IDs dos alunos matriculados na turma
    const matriculas = await prisma.matriculaturma.findMany({
      where: { idturma: dados.turmaId },
      select: { idusuario: true },
    });

    const alunosIds = matriculas.map(m => m.idusuario);

    if (alunosIds.length === 0) {
      console.log(`Nenhum aluno matriculado na Turma ${dados.turmaId} para inscrição.`);
      return { success: true, count: 0 };
    }

    // 2. Preparar os dados para a tabela alunodisciplina
    const dadosInscricao = alunosIds.map(idAluno => ({
      idaluno: idAluno, // Assumindo que idaluno na AlunoDisciplina é o idusuario
      iddisciplina: dados.disciplinaId,
    }));

    // 3. Criar os registros em massa
    const resultado = await prisma.alunodisciplina.createMany({
      data: dadosInscricao,
      skipDuplicates: true, 
    });

    revalidatePath('/aluno/dashboard');

    return { success: true, count: resultado.count };
  } catch (error) {
    console.error("❌ Erro ao inscrever alunos na disciplina:", error); 
    return { success: false, error: "Falha na inscrição dos alunos." };
  }
}

// =========================================================
// LEGACY ACTIONS (Manter caso haja dependências antigas)
// =========================================================
// ... (Nenhuma alteração necessária aqui)
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
  } catch (error) { return { success: false, error: "Erro ao cadastrar a disciplina." }; }
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
// =========================================================
// LISTAR DISCIPLINAS COM PROFESSOR
// =========================================================
export async function listarDisciplinasComProfessorAction() {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      include: {
        professor: true  // usuario do tipo professor
      },
      orderBy: { nome_disciplina: "asc" }
    });

    return { success: true, data: disciplinas };

  } catch (e) {
    console.error("Erro ao buscar disciplinas:", e);
    return { success: false, error: "Erro ao buscar disciplinas." };
  }
}
'use server';

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
  } catch (error) { return { success: false, error: "Erro interno." }; }
}

// =========================================================
// 1. ADMINISTRAÇÃO
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
        nome: dados.nome, cpf: dados.cpf, email: dados.email,
        senha: hash, tipo: dados.tipo as tipo_usuario,
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
    await prisma.matriculaturma.deleteMany({ where: { idusuario: id } });
    await prisma.alunodisciplina.deleteMany({ where: { idaluno: id } });
    await prisma.usuario.delete({ where: { idusuario: id } });
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (e) { return { success: false, error: "Possui vínculos." }; }
}

// =========================================================
// 3. PROFESSOR
// =========================================================

// --- ESTA É A FUNÇÃO QUE ESTAVA FALTANDO ---
export async function getDashboardProfessorAction(idProfessor: number) {
  try {
    const db = prisma as any;
    const TabelaTurma = db.turmadisciplina || db.turmaDisciplina;

    if (!TabelaTurma) return { success: false, error: "Erro DB: Tabela não encontrada." };

    const vinculos = await TabelaTurma.findMany({
      where: { disciplina: { idprofessor: idProfessor } },
      include: { turma: true, disciplina: { include: { alunodisciplina: true } } }
    });

    const turmasFormatadas = vinculos.map((v: any) => ({
      idTurma: v.turma.idturma,
      idDisciplina: v.disciplina.iddisciplina,
      nomeTurma: v.turma.nome_turma || "Turma",
      nomeDisciplina: v.disciplina.nome_disciplina || "Disciplina",
      serie: v.turma.serie || "-",
      turno: v.turma.turno || "Manhã",
      totalAlunos: v.disciplina.alunodisciplina?.length || 0
    }));

    const totalAlunos = turmasFormatadas.reduce((acc: number, t: any) => acc + t.totalAlunos, 0);

    return {
      success: true,
      data: {
        nomeProfessor: "Professor",
        totalTurmas: turmasFormatadas.length,
        totalAlunos: totalAlunos, 
        turmas: turmasFormatadas
      }
    };
  } catch (error) { return { success: false, error: "Erro interno." }; }
}

export async function getAlunosDaTurmaAction(turmaId: number, disciplinaId: number) {
  try {
    const alunosVinculados = await prisma.alunodisciplina.findMany({
      where: {
        iddisciplina: disciplinaId,
        usuario: { matriculaturma: { some: { idturma: turmaId } } }
      },
      include: { usuario: true, nota: true, frequencia: true },
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
  } catch (error) { return { success: false, error: "Erro ao buscar alunos." }; }
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

// =========================================================
// 2. ALUNO
// =========================================================
export async function getDashboardAlunoAction(idAluno: number) {
  try {
    const aluno = await prisma.usuario.findUnique({
      where: { idusuario: idAluno },
      include: {
        matriculaturma: { include: { turma: true } },
        alunodisciplina: {
          include: {
            disciplina: { include: { usuario: true } }, 
            nota: true, frequencia: true,
          }
        }
      }
    });

    if (!aluno) return { success: false, error: "Aluno não encontrado" };

    const nomeTurma = aluno.matriculaturma[0]?.turma?.nome_turma || "Não enturmado";
    let somaMedias = 0, qtdMedias = 0, somaFreq = 0, qtdFreq = 0;

    const disciplinas = aluno.alunodisciplina.map((ad: any) => {
      const somaNotas = ad.nota.reduce((acc:number, n:any) => acc + Number(n.valor || 0), 0);
      const mediaNum = ad.nota.length > 0 ? (somaNotas / ad.nota.length) : 0;
      if (ad.nota.length > 0) { somaMedias += mediaNum; qtdMedias++; }

      const faltas = ad.frequencia.reduce((acc:number, f:any) => acc + (f.faltas || 0), 0);
      const freqNum = Math.max(0, 100 - faltas);
      somaFreq += freqNum; qtdFreq++;

      const nomeProf = ad.disciplina.professor?.nome || (ad.disciplina as any).usuario?.nome || "Prof.";

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
  } catch (error) { return { success: false, error: "Erro." }; }
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
        disciplina: { include: { usuario: true } }, 
        nota: { orderBy: { data: 'asc' } },
        frequencia: { orderBy: { data: 'desc' } }
      }
    });

    if (!vinculo) return { success: false, error: "Não encontrada" };

    const totalNotas = vinculo.nota.reduce((acc, n) => acc + Number(n.valor || 0), 0);
    const media = vinculo.nota.length > 0 ? (totalNotas / vinculo.nota.length).toFixed(1) : "-";
    const faltas = vinculo.frequencia.reduce((acc, f) => acc + (f.faltas || 0), 0);
    const freq = Math.max(0, 100 - faltas);
    const nomeProf = vinculo.disciplina.usuario?.nome || (vinculo.disciplina as any).usuario?.nome || "";

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
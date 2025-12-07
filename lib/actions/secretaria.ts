'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDashboardSecretarioAction(idUsuario: number) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { idusuario: idUsuario } });
    if (!usuario) return { success: false, error: "Usuário não encontrado." };

    const [totalAlunos, totalProfessores, totalTurmas] = await prisma.$transaction([
      prisma.usuario.count({ where: { tipo: 'aluno' } }),
      prisma.usuario.count({ where: { tipo: 'professor' } }),
      prisma.turma.count(),
    ]);

    return {
      success: true,
      data: { nome: usuario.nome, tipo: usuario.tipo, stats: { alunos: totalAlunos, professores: totalProfessores, turmas: totalTurmas } }
    };
  } catch (error) { return { success: false, error: "Erro dashboard." }; }
}

export async function cadastrarTurmaAction(dados: { nome_turma: string; serie: string; turno: string; ano_letivo: number; limite_vagas?: number | null; disciplinaId: number; alunosIds: number[]; }) {
  try {
    const novaTurma = await prisma.$transaction(async (tx) => {
      // 1. Criar turma
      const turmaCriada = await tx.turma.create({
        data: { nome_turma: dados.nome_turma, serie: dados.serie, turno: dados.turno, ano_letivo: dados.ano_letivo, limite_vagas: dados.limite_vagas ?? null },
      });
      
      // 2. Vincular disciplina inicial
      await tx.turmadisciplina.create({ data: { turmaid: turmaCriada.idturma, disciplinaid: dados.disciplinaId } });
      
      // 3. Matricular alunos
      if (dados.alunosIds.length > 0) {
        await tx.matriculaturma.createMany({ data: dados.alunosIds.map(idAluno => ({ idusuario: idAluno, idturma: turmaCriada.idturma })) });
      }
      return turmaCriada;
    });
    revalidatePath("/secretaria/turmas"); revalidatePath("/secretaria/dashboard");
    return { success: true, data: novaTurma };
  } catch (error) { return { success: false, error: "Erro ao cadastrar turma." }; }
}

export async function getDadosCadastroTurmaAction() {
    try {
      const disciplinas = await prisma.disciplina.findMany({ include: { professor: true } });
      const alunos = await prisma.usuario.findMany({ where: { tipo: 'aluno' }, orderBy: { nome: 'asc' } });
      return { success: true, disciplinas, alunos };
    } catch (error) { return { success: false, error: "Erro ao carregar dados." }; }
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
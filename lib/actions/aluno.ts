'use server';

import { prisma } from "@/lib/prisma";
import { cookies } from 'next/headers';

export async function getDashboardAlunoAction(idAluno: number) {
  try {
    const aluno = await prisma.usuario.findUnique({
      where: { idusuario: idAluno },
      select: { 
        nome: true, 
        cpf: true,
        matriculaturma: { include: { turma: true }, take: 1 }
      }
    });

    if (!aluno) return { success: false, error: "Aluno não encontrado." };

    const matriculas = await prisma.alunodisciplina.findMany({
      where: { idaluno: idAluno },
      include: {
        disciplina: { include: { professor: { select: { nome: true } } } },
        nota: true, 
        frequencia: true
      }
    });

    let somaMedias = 0;
    let disciplinasComNota = 0;
    let totalFaltasGeral = 0;

    const disciplinasFormatadas = matriculas.map((m) => {
      const somaNotas = m.nota.reduce((acc, n) => acc + Number(n.valor || 0), 0);
      const mediaNumerica = m.nota.length > 0 ? (somaNotas / m.nota.length) : 0;
      
      if (m.nota.length > 0) { 
        somaMedias += mediaNumerica; 
        disciplinasComNota++; 
      }
      
      const faltasDisc = m.frequencia.reduce((acc, f) => acc + (Number(f.faltas) || 0), 0);
      totalFaltasGeral += faltasDisc;

      return {
        id: m.iddisciplina,
        nome: m.disciplina.nome_disciplina,
        professor: m.disciplina.professor?.nome || "Sem Professor",
        media: m.nota.length > 0 ? mediaNumerica.toFixed(1) : "-",
        frequencia: `${faltasDisc} faltas`
      };
    });

    const mediaGeralCalculada = disciplinasComNota > 0 ? (somaMedias / disciplinasComNota).toFixed(1) : "-";
    const nomeTurma = aluno.matriculaturma[0]?.turma?.nome_turma || "Sem Turma";

    return {
      success: true,
      data: {
        nome: aluno.nome,
        cpf: aluno.cpf || "Não informado",
        turma: nomeTurma,
        mediaGeral: mediaGeralCalculada,
        frequenciaGeral: `${totalFaltasGeral} faltas totais`,
        totalDisciplinas: matriculas.length,
        disciplinas: disciplinasFormatadas
      }
    };
  } catch (error) { 
    return { success: false, error: "Erro ao carregar dados." }; 
  }
}

export async function getDetalhesDisciplinaAction(idDisciplinaRaw: number) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('portal_usuario_id');
    
    if (!userIdCookie) {
      return { success: false, error: "Sessão expirada. Faça login novamente." };
    }
    const idAluno = Number(userIdCookie.value);

    const vinculo = await prisma.alunodisciplina.findFirst({
      where: { idaluno: idAluno, iddisciplina: idDisciplinaRaw },
      include: {
        disciplina: { include: { professor: { select: { nome: true } } } },
        nota: { orderBy: { data: 'desc' } },
        frequencia: { orderBy: { data: 'desc' } }
      }
    });

    if (!vinculo) {
      return { success: false, error: "Disciplina não encontrada ou você não está matriculado nela." };
    }

    const somaNotas = vinculo.nota.reduce((acc, n) => acc + Number(n.valor || 0), 0);
    const mediaCalculada = vinculo.nota.length > 0 ? (somaNotas / vinculo.nota.length).toFixed(1) : "-";

    const totalFaltas = vinculo.frequencia.reduce((acc, f) => acc + (Number(f.faltas) || 0), 0);

    const cargaHoraria = vinculo.disciplina.carga_horaria || 0;
    let porcentagemFreq = "100%";
    
    if (cargaHoraria > 0) {
       const calc = 100 - ((totalFaltas / cargaHoraria) * 100);
       porcentagemFreq = `${calc.toFixed(0)}%`;
    } else if (totalFaltas > 0) {
        porcentagemFreq = "Verif. Carga";
    }

    const frequenciasComFaltas = vinculo.frequencia.filter(f => (f.faltas || 0) > 0);

    return {
      success: true,
      data: {
        nomeDisciplina: vinculo.disciplina.nome_disciplina,
        professor: vinculo.disciplina.professor?.nome,
        resumo: { media: mediaCalculada, faltas: totalFaltas, porcentagemFreq },
        notas: vinculo.nota.map(n => ({
          idnota: n.idnota, descricao: n.descricao, valor: n.valor, data: n.data
        })),
        frequencias: frequenciasComFaltas.map(f => ({
          idfrequencia: f.idfrequencia, data: f.data, faltas: f.faltas
        }))
      }
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes da disciplina:", error);
    return { success: false, error: "Erro interno ao carregar dados." };
  }
}
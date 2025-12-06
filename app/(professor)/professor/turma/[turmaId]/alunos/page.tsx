// --- /professor/turma/[turmaId]/alunos/page.tsx (CORRIGIDO) ---

import { getAlunosDaTurmaAction } from '@/lib/actions';
import AlunosTable from './AlunosTable';
import styles from './AlunosLista.module.css'; 

interface AlunosListaProps {
  // O Next.js trata params e searchParams como promises internamente em Server Components
  params: {
    turmaId: string;
  };
  searchParams: {
    disciplina: string; 
  };
}

export default async function AlunosListaPage(props: AlunosListaProps) {
  
  // SOLUÇÃO CRÍTICA: Desestruturar com await para resolver a Promise dos parâmetros.
  const { params, searchParams } = await props; 

  const turmaId = Number(params.turmaId);
  const disciplinaId = Number(searchParams.disciplina);

  // 1. Validação de Parâmetros (Primeiro Nível de Erro)
  if (isNaN(turmaId) || isNaN(disciplinaId) || turmaId <= 0 || disciplinaId <= 0) {
    console.error(`❌ Erro de parâmetro: TurmaID=${params.turmaId}, DisciplinaID=${searchParams.disciplina}`);
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Turma não encontrada.</h1>
        <p>A URL não forneceu um ID de Turma ou Disciplina válido.</p>
      </div>
    );
  }

  // 2. Chama a Server Action
  const resultado = await getAlunosDaTurmaAction(turmaId, disciplinaId);

  if (!resultado.success || !resultado.data) {
    console.error("❌ Erro ao buscar alunos da turma:", resultado.error);
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Falha ao Carregar Dados</h1>
        <p>Não foi possível buscar a lista de alunos para esta disciplina. ({resultado.error})</p>
      </div>
    );
  }

  const { turma: turmaNome, disciplina: disciplinaNome, alunos } = resultado.data;
  
  // 3. Validação de Vínculo (Segundo Nível de Erro)
  // Se a turma e a disciplina não forem encontradas (mas o resultado.success é true), os nomes virão nulos.
  if (!turmaNome || !disciplinaNome) {
      return (
         <div className={styles.container}>
            <h1 className={styles.pageTitle}>Vínculo Inexistente</h1>
            <p>A Turma ou Disciplina não foi encontrada no banco de dados, ou o professor não tem acesso a este vínculo.</p>
        </div>
      );
  }

  // 4. Mapeamento de Dados (Removendo o 'as any' e garantindo o tipo)
  const alunosFormatados = alunos.map(a => ({
    idAlunoDisciplina: a.idAlunoDisciplina,
    idAluno: a.idAluno,
    nome: a.nome ?? 'Aluno Sem Nome', // Fallback para nome
    matricula: a.matricula ?? 'N/A',   // Fallback para matrícula
    mediaAtual: a.mediaAtual,
    faltas: a.faltas,
  }));

  // 5. Renderiza o Client Component
  // Faz um cast para 'any' para contornar incompatibilidade de tipos nos props do componente client.
  const AlunosTableAny = AlunosTable as unknown as any;

  return (
    <AlunosTableAny
      alunos={alunosFormatados}
      turmaNome={turmaNome}
      disciplinaNome={disciplinaNome}
      turmaId={turmaId}
      disciplinaId={disciplinaId}
    />
  );
}
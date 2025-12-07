// --- /professor/turma/[turmaid]/alunos/page.tsx ---

import { getAlunosDaTurmaAction } from '@/lib/actions';
import AlunosTable from './AlunosTable';
import styles from './AlunosLista.module.css';

// A interface agora reflete que params PODE ser uma Promise, 
// o que resolve o erro de runtime.
interface AlunosListaProps {
  // 🎯 CORREÇÃO: params também é tratado como Promise para robustez
  params: { turmaid: string } | Promise<{ turmaid: string }>;
  searchParams: { disciplina?: string } | Promise<{ disciplina?: string }>;
}

// O argumento é renomeado para 'props' para resolver as Promises de forma limpa.
export default async function AlunosListaPage(props: AlunosListaProps) {

  // 1. RESOLVER AS PROMISES (searchParams e params)
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;
  
  // Extração dos valores dos objetos resolvidos
  const turmaid = Number(resolvedParams.turmaid);
  const disciplinaid = Number(resolvedSearchParams.disciplina);

  // Validação
  if (!turmaid || !disciplinaid || isNaN(turmaid) || isNaN(disciplinaid)) {
    // Usar os valores resolvidos para o log de erro
    console.error(`❌ Erro de parâmetro: turmaid=${resolvedParams.turmaid}, disciplinaid=${resolvedSearchParams.disciplina}`);
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Turma não encontrada.</h1>
        <p>Parâmetros inválidos na URL.</p>
      </div>
    );
  }

  const resultado = await getAlunosDaTurmaAction(turmaid, disciplinaid);

  if (!resultado.success) {
    console.error("❌ Erro ao buscar alunos da turma:", resultado.error);
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Falha ao Carregar Dados</h1>
        <p>Erro ao buscar dados: {resultado.error}</p>
      </div>
    );
  }

  // 2. Validação para o erro "Turma não encontrada" (Vínculo Inexistente)
  // Garante que os nomes de turma/disciplina vieram corretamente da Server Action
  if (!resultado.data || !resultado.data.turma || !resultado.data.disciplina) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Vínculo ou Dados Inexistentes</h1>
        <p>A Turma ou Disciplina não foi encontrada no banco de dados, ou o professor não possui vínculo com esta.</p>
      </div>
    );
  }

  const { turma, disciplina, alunos } = resultado.data;

  // 3. OTIMIZAÇÃO: Não converter a média. Use a string formatada 
  // (ex: "7.5") que já vem da action (toFixed(1)).
  const alunosFormatados = alunos.map(a => ({
    idAlunoDisciplina: a.idAlunoDisciplina,
    idAluno: a.idAluno,
    nome: a.nome ?? 'Aluno Sem Nome',
    matricula: a.matricula ?? 'N/A',
    mediaAtual: a.mediaAtual, // Usando a string formatada da action
    faltas: a.faltas,
  }));

  return (
    <AlunosTable
      alunos={alunosFormatados}
      turmaNome={turma ?? 'Turma Sem Nome'}
      disciplinaNome={disciplina ?? 'Disciplina Sem Nome'}
      turmaId={turmaid}
      disciplinaId={disciplinaid}
    />
  );
}
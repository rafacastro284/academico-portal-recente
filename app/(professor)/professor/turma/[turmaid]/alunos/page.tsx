// --- /professor/turma/[turmaid]/alunos/page.tsx ---
import { getAlunosDaTurmaAction } from '@/lib/actions/professor';
import AlunosTable from './AlunosTable';
import styles from './AlunosLista.module.css';
interface AlunosListaProps {
  params: Promise<{ turmaid: string }>;
  searchParams: Promise<{ disciplina?: string }>;
}

export default async function AlunosListaPage(props: AlunosListaProps) {

  // 1. RESOLVER AS PROMISES (searchParams e params)
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;
  
  // Extração dos valores dos objetos resolvidos
  const turmaid = Number(resolvedParams.turmaid);
  const disciplinaid = Number(resolvedSearchParams.disciplina);

  // Validação
  if (!turmaid || !disciplinaid || isNaN(turmaid) || isNaN(disciplinaid)) {
    console.error(`❌ Erro de parâmetro: turmaid=${resolvedParams.turmaid}, disciplinaid=${resolvedSearchParams.disciplina}`);
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Turma não encontrada.</h1>
        <p>Parâmetros inválidos na URL.</p>
      </div>
    );
  }

  // Agora chama a função do arquivo correto (actions/professor)
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
  if (!resultado.data || !resultado.data.turma || !resultado.data.disciplina) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Vínculo ou Dados Inexistentes</h1>
        <p>A Turma ou Disciplina não foi encontrada no banco de dados, ou o professor não possui vínculo com esta.</p>
      </div>
    );
  }

  const { turma, disciplina, alunos } = resultado.data;

  // 3. Formatação dos dados para a tabela
  const alunosFormatados = alunos.map(a => ({
    idAlunoDisciplina: a.idAlunoDisciplina,
    idAluno: a.idAluno,
    nome: a.nome ?? 'Aluno Sem Nome',
    matricula: a.matricula ?? 'N/A',
    mediaAtual: a.mediaAtual, 
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
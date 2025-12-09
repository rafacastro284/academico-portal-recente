import { getDadosLancamentoFrequenciaListaAction } from '@/lib/actions/professor';
import LancarFrequenciaForm from './LancarFrequenciaForm';
import styles from './LancarFrequencia.module.css';

interface LancarFrequenciaPageProps {
  params: Promise<{ turmaid: string }>;
  searchParams: Promise<{ disciplina?: string; data?: string }>;
}

function getTodayDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localTime = now.getTime() - offset;
  const localDate = new Date(localTime);
  return localDate.toISOString().substring(0, 10);
}

export default async function LancarFrequenciaPage(props: LancarFrequenciaPageProps) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;
  
  const turmaId = Number(resolvedParams.turmaid);
  const disciplinaId = Number(resolvedSearchParams.disciplina);
  const dataLancamento = resolvedSearchParams.data || getTodayDateString();

  if (isNaN(turmaId) || isNaN(disciplinaId)) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Parâmetros Inválidos</h1>
        <p>A URL está faltando IDs necessários (turma ou disciplina).</p>
      </div>
    );
  }

  const resultado = await getDadosLancamentoFrequenciaListaAction(
    turmaId,
    disciplinaId,
    dataLancamento
  );

  if (!resultado.success || !resultado.data) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Erro ao Carregar Dados</h1>
        <p>{resultado.error}</p>
      </div>
    );
  }

  const { turma, disciplina, alunos } = resultado.data;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Lançar Frequência - Lista Completa</h1>
      
      <div className={styles.headerInfo}>
        <p><strong>Turma:</strong> {turma}</p>
        <p><strong>Disciplina:</strong> {disciplina}</p>
      </div>

      <LancarFrequenciaForm
        turmaId={turmaId}
        disciplinaId={disciplinaId}
        alunosIniciais={alunos}
        dataInicial={dataLancamento}
      />
    </div>
  );
}
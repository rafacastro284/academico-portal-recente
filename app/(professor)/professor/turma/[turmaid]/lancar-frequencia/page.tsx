import { getDadosLancamentoFrequenciaAction } from '@/lib/actions';
import styles from './LancarFrequencia.module.css';
import LancarFrequenciaForm from './LancarFrequenciaForm'; // Client Component a ser criado

interface LancarFrequenciaPageProps {
  params: { turmaid: string };
  // aluno = idAlunoDisciplina. data = data de lançamento (ex: '2025-11-20')
  searchParams: { disciplina?: string; aluno?: string; data?: string }; 
}

// Função utilitária para obter a data de hoje formatada (YYYY-MM-DD)
function getTodayDateString() {
    const now = new Date();
    // Ajusta o fuso horário para garantir que seja a data local correta
    const offset = now.getTimezoneOffset() * 60000;
    const localTime = now.getTime() - offset;
    const localDate = new Date(localTime);
    
    return localDate.toISOString().substring(0, 10);
}

export default async function LancarFrequenciaPage(props: LancarFrequenciaPageProps) {
  
  // 1. Extrair e validar IDs e Data
  const turmaId = Number(props.params.turmaid);
  const disciplinaId = Number(props.searchParams.disciplina);
  const alunoIdDisciplina = Number(props.searchParams.aluno); 
  // Usa a data da URL ou a data de hoje por padrão
  const dataLancamento = props.searchParams.data || getTodayDateString(); 

  if (isNaN(turmaId) || isNaN(disciplinaId) || isNaN(alunoIdDisciplina)) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Parâmetros Inválidos</h1>
        <p>A URL está faltando IDs necessários (turma, disciplina ou aluno).</p>
      </div>
    );
  }

  // 2. Chamar a Server Action para buscar os dados
  const resultado = await getDadosLancamentoFrequenciaAction(
      alunoIdDisciplina, 
      dataLancamento
  );

  if (!resultado.success || !resultado.data) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Erro ao Carregar Dados</h1>
        <p>Não foi possível encontrar o vínculo do aluno com a disciplina. {resultado.error}</p>
      </div>
    );
  }
  
  const { aluno, disciplina, statusAtual, totalFaltas } = resultado.data;

  // 3. Renderizar o formulário (Client Component)
  return (
    <div className={styles.container}>
      
      <h1 className={styles.pageTitle}>Lançar Frequência</h1>
      
      <div className={styles.headerInfo}>
        <p><strong>Disciplina:</strong> {disciplina}</p>
        <p><strong>Aluno:</strong> {aluno.nome} ({aluno.matricula ?? 'N/A'})</p>
        <p><strong>Total de Faltas:</strong> {totalFaltas}</p>
      </div>
      
      {/* O Client Component fará a manipulação do formulário */}
      <LancarFrequenciaForm 
        alunoIdDisciplina={alunoIdDisciplina}
        disciplinaId={disciplinaId} // Necessário para a action de salvar em lote (futuramente)
        statusInicial={statusAtual}
        dataInicial={dataLancamento}
      />
      
      {/* Link de volta */}
      <div className={styles.backLink}>
        <a href={`/professor/turma/${turmaId}/alunos?disciplina=${disciplinaId}`}>
          ← Voltar para a lista de alunos
        </a>
      </div>

    </div>
  );
}
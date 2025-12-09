import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDashboardProfessorAction } from '@/lib/actions/professor';
import styles from './ProfessorDashboard.module.css';

export default async function ProfessorDashboard() {
  
  // 1. Autenticação
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('portal_usuario_id');

  if (!userIdCookie) {
    console.log("❌ DEBUG: Sem cookie de login. Redirecionando...");
    redirect('/login');
  }

  const idProfessor = Number(userIdCookie.value);

  // --- LOGS INICIAIS ---
  console.log("\n========================================");
  console.log("🕵️‍♂️ DEBUG DASHBOARD PROFESSOR");
  console.log("👤 ID Professor Logado:", idProfessor);
  console.log("🔄 Buscando dados no banco...");

  // 2. Busca dados reais
  const resultado = await getDashboardProfessorAction(idProfessor);

  // --- LOGS DO RESULTADO ---
  console.log("✅ Busca finalizada. Sucesso?", resultado.success);
  
  if (resultado.data) {
    console.log("📊 Total de Turmas encontradas:", resultado.data.turmas.length);
    // Imprime os dados brutos para você ver o que veio
    console.log("📦 DADOS VINDOS DO BANCO:", JSON.stringify(resultado.data.turmas, null, 2));
  } else {
    console.log("⚠️ NENHUM DADO RETORNADO (resultado.data é nulo)");
    console.log("Erro reportado:", resultado.error);
  }
  console.log("========================================\n");


  if (!resultado.success || !resultado.data) {
    return <div className={styles.container}><p>Erro ao carregar turmas. Faça login novamente.</p></div>;
  }

  const { turmas } = resultado.data;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Minhas Turmas</h2>
        <p className={styles.subtitle}>Selecione uma turma para lançar notas e frequência</p>

        <div className={styles.turmaGrid}>
          {turmas.length === 0 && (
            <p style={{ color: '#666', gridColumn: '1/-1', textAlign: 'center' }}>
              Você não possui turmas vinculadas.
            </p>
          )}

          {turmas.map((turma: any) => (
            <Link 
              key={`${turma.idTurma}-${turma.idDisciplina}`} 
              href={`/professor/turma/${turma.idTurma}/alunos?disciplina=${turma.idDisciplina}`} 
              className={styles.turmaCard}
            >
              {/* O '|| ""' garante que não quebre com nulos */}
              <h3>{turma.nomeTurma || "Turma sem nome"}</h3>
              
              <p className={styles.disciplina}>{turma.nomeDisciplina || "Disciplina sem nome"}</p>
              
              <div className={styles.turmaDetails}>
                <div>
                  <strong>{turma.totalAlunos}</strong>
                  <span>Alunos</span>
                </div>
                <div>
                  <strong>{turma.turno || 'Manhã'}</strong>
                  <span>Turno</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDashboardAlunoAction } from '@/lib/actions';
import styles from './Home.module.css';

const IconBook = () => <>📚</>;
const IconChart = () => <>📊</>;
const IconCheck = () => <>✅</>;

export default async function DashboardAluno() {

  // 1. Pega o cookie com await (obrigatório no Next 15)
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('portal_usuario_id');

  if (!userIdCookie) {
    redirect('/login');
  }

  // 2. Busca dados
  const idAluno = Number(userIdCookie.value);
  const resultado = await getDashboardAlunoAction(idAluno);

  if (!resultado.success || !resultado.data) {
    return <div className={styles.pageWrapper}><p>Erro ao carregar dados. Faça login novamente.</p></div>;
  }

  // 3. A CORREÇÃO ESTÁ AQUI:
  // Adicionamos 'frequenciaGeral' na lista de variáveis extraídas (destructuring)
  const { 
    nome, 
    cpf, 
    turma, 
    mediaGeral, 
    frequenciaGeral, // <--- Isso faltava no seu arquivo, por isso o erro!
    totalDisciplinas, 
    disciplinas 
  } = resultado.data;

  return (
    <div className={styles.pageWrapper}>
      
      {/* Header */}
      <div className={styles.mainCard}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Portal do Aluno</h1>
            <p className={styles.subtitle}>
              Olá, <strong>{nome}</strong>{' '}
              {turma && <span className={styles.badge}>{turma}</span>}
            </p>
            <p className={styles.matricula}>CPF: {cpf}</p>
          </div>
          <Link href="/login"><button className={styles.logoutButton}>Sair</button></Link>
        </header>

        {/* --- Grid de Resumo --- */}
        <div className={styles.summaryGrid}>
          
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#E0F2FE' }}>
              <IconBook />
            </div>
            <div>
              <strong>{totalDisciplinas}</strong>
              <p>Disciplinas</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#E0F7EB' }}>
              <IconChart />
            </div>
            <div>
              <strong>{mediaGeral}</strong>
              <p>Média Geral</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#E6E0F7' }}>
              <IconCheck />
            </div>
            <div>
              {/* Agora vai funcionar porque declaramos lá em cima */}
              <strong>{frequenciaGeral}</strong>
              <p>Frequência</p>
            </div>
          </div>

        </div>
      </div>

      {/* Lista de Disciplinas */}
      <div className={styles.disciplinasCard}>
        <h2 className={styles.disciplinasTitle}>Minhas Disciplinas</h2>
        
        <div className={styles.disciplinasGrid}>
          {disciplinas.length === 0 && (
            <p style={{ padding: '20px', color: '#666' }}>
              Você não está matriculado em nenhuma disciplina.
            </p>
          )}

          {disciplinas.map((d: any) => (
            <Link key={d.id} href={`/aluno/disciplinas/${d.id}`} className={styles.subjectCardLink}>
              <div className={styles.subjectCard}>
                <div className={styles.subjectCardHeader}>
                  <h3>{d.nome}</h3>
                  <p>Prof. {d.professor}</p>
                </div>
                <div className={styles.subjectCardStats}>
                  <div><span>{d.media}</span><p>Média</p></div>
                  <div><span>{d.frequencia}</span><p>Freq.</p></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
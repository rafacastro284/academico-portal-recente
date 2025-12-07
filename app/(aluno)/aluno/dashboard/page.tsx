import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDashboardAlunoAction } from '@/lib/actions';
import styles from './Home.module.css';

// Ícones simples para não precisar de biblioteca externa
const IconBook = () => <span>📚</span>;
const IconChart = () => <span>📊</span>;
const IconCheck = () => <span>✅</span>;

export default async function DashboardAluno() {

  // 1. Autenticação
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('portal_usuario_id');

  if (!userIdCookie) {
    redirect('/login');
  }

  // 2. Busca dados
  const idAluno = Number(userIdCookie.value);
  const resultado = await getDashboardAlunoAction(idAluno);

  if (!resultado.success || !resultado.data) {
    return (
      <div className={styles.pageWrapper}>
        <p className={styles.errorMsg}>Erro ao carregar dados. Tente fazer login novamente.</p>
        <Link href="/login">Voltar ao Login</Link>
      </div>
    );
  }

  // 3. Extração dos dados (Agora todos existem na Action)
  const { 
    nome, 
    cpf, 
    turma, 
    mediaGeral, 
    frequenciaGeral, 
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
              Olá, <strong>{nome}</strong>
              {turma && <span className={styles.badge}>{turma}</span>}
            </p>
            <p className={styles.matricula}>CPF: {cpf}</p>
          </div>
          
          {/* Botão de Logout forçando redirecionamento */}
          <form action={async () => {
            'use server';
            const c = await cookies();
            c.delete('portal_usuario_id');
            redirect('/login');
          }}>
             <button className={styles.logoutButton}>Sair</button>
          </form>
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
            <p style={{ padding: '20px', color: '#666', gridColumn: '1/-1', textAlign: 'center' }}>
              Você não está matriculado em nenhuma disciplina.
            </p>
          )}

          {disciplinas.map((d: any) => (
            <Link key={d.id} href={`/aluno/disciplina/${d.id}`} className={styles.subjectCardLink}>
              <div className={styles.subjectCard}>
                <div className={styles.subjectCardHeader}>
                  <h3>{d.nome}</h3>
                  <p>Prof. {d.professor}</p>
                </div>
                <div className={styles.subjectCardStats}>
                  <div className={styles.statItem}>
                    <span>{d.media}</span>
                    <p>Média</p>
                  </div>
                  <div className={styles.statItem}>
                    <span>{d.frequencia}</span>
                    <p>Freq.</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
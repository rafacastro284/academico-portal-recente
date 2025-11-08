import Link from 'next/link';
import { studentData } from '../../lib/mockData'; 
import styles from './Home.module.css'; 

const IconBook = () => <>📚</>;
const IconChart = () => <>📊</>;
const IconCheck = () => <>✅</>;

export default function Dashboard() {
  const { name, matricula, turma, generalStats, disciplinas } = studentData;
  return (
    <div className={styles.pageWrapper}>

      {/* --- Card Principal (Header e Resumo) --- */}
      <div className={styles.mainCard}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Portal do Aluno</h1>
            <p className={styles.subtitle}>
              Olá, <strong>{name}</strong> { }
              { }
              {turma !== "Turma não definida" && (
                <span className={styles.badge}>{turma}</span>
              )}
            </p>
            <p className={styles.matricula}>
              <span className={styles.matriculaIcon}>🪪</span>
              Matrícula: {matricula} {/* Vai mostrar "N/A" */}
            </p>
          </div>
          <Link href="/login">
            <button className={styles.logoutButton}>Sair</button>
          </Link>
        </header>

        {/* --- Grid de Resumo Rápido --- */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#E0F2FE' }}>
              <IconBook />
            </div>
            <div>
              <strong>{generalStats.disciplinas}</strong>
              <p>Disciplinas</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#E0F7EB' }}>
              <IconChart />
            </div>
            <div>
              <strong>{generalStats.mediaGeral}</strong>
              <p>Média Geral</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#E6E0F7' }}>
              <IconCheck />
            </div>
            <div>
              <strong>{generalStats.frequencia}%</strong>
              <p>Frequência</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Card de Disciplinas --- */}
      <div className={styles.disciplinasCard}>
        <h2 className={styles.disciplinasTitle}>Minhas Disciplinas</h2>
        <p className={styles.disciplinasSubtitle}>
          Clique em uma disciplina para ver suas notas e frequência
        </p>

        <div className={styles.disciplinasGrid}>
          {disciplinas.map((disciplina) => (
            // Cada card é um link para a página de detalhes
            <Link href={`/disciplinas/${disciplina.id}`} key={disciplina.id} className={styles.subjectCardLink}>
              <div className={styles.subjectCard}>
                <div className={styles.subjectCardHeader}>
                  <h3>{disciplina.name}</h3>
                  <p>{disciplina.professor}</p>
                </div>
                <div className={styles.subjectCardStats}>
                  <div>
                    <span>{disciplina.notaAtual}</span>
                    <p>Nota Atual</p>
                  </div>
                  <div>
                    <span>{disciplina.frequencia}%</span>
                    <p>Frequência</p>
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
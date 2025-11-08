import Link from 'next/link';
import styles from './ProfessorLayout.module.css';
import { professorData } from '../lib/mockData';

const IconTurmas = () => <>🏫</>;
const IconAlunos = () => <>👨‍🎓</>;
const IconDisciplinas = () => <>📚</>;

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { header, summary } = professorData;

  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.header}>
        { }
      </header>

      <main className={styles.mainContent}>
        {/* -- Card de Info do Professor -- */}
        <div className={`${styles.card} ${styles.headerCard}`}>
          <div>
            <h1>Portal do Professor</h1>
            <p>Olá, Professor Teste</p> { }
          </div>
          <Link href="/login">
            <button className={styles.logoutButton}>Sair</button>
          </Link>
        </div>
        
        {/* -- Cards de Resumo Rápido -- */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconTurmas /></div>
            <div>
              <strong>{summary.turmas}</strong>
              <p>Turmas</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconAlunos /></div>
            <div>
              <strong>{summary.alunos}</strong>
              <p>Alunos</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconDisciplinas /></div>
            <div>
              <strong>{summary.disciplinas}</strong>
              <p>Disciplinas</p>
            </div>
          </div>
        </div>

        { }
        {children}
      </main>

      <footer className={styles.footer}>
        Copyright © 2025 - Portal Acadêmico
      </footer>
    </div>
  );
}
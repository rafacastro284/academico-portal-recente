import Link from 'next/link';
import styles from './DiretorLayout.module.css';
import { diretorData } from '../lib/mockData'; 

const IconAluno = () => <>👨‍🎓</>;
const IconProfessor = () => <>👩‍🏫</>;
const IconTurma = () => <>🏫</>;
const IconMedia = () => <>📊</>;

export default function DiretorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { header, summary } = diretorData;

  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.header}>
        { }
      </header>

      <main className={styles.mainContent}>
        {/* -- Card de Info do Diretor -- */}
        <div className={`${styles.card} ${styles.headerCard}`}>
          <div>
            <h1>Olá, {header.nome}</h1>
          </div>
          <Link href="/login">
            <button className={styles.logoutButton}>Sair</button>
          </Link>
        </div>
        
        {/* -- Cards de Resumo Rápido -- */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconAluno /></div>
            <div>
              <strong>{summary.alunos}</strong>
              <p>Alunos</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconProfessor /></div>
            <div>
              <strong>{summary.professores}</strong>
              <p>Professores</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconTurma /></div>
            <div>
              <strong>{summary.turmas}</strong>
              <p>Turmas</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconMedia /></div>
            <div>
              <strong>{summary.mediaGeral}</strong>
              <p>Média Geral</p>
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
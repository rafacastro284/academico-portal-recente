import Link from 'next/link';
import styles from './SecretarioLayout.module.css';
import { adminUserData } from '../lib/mockData'; 

const IconAluno = () => <>👨‍🎓</>;
const IconProfessor = () => <>👩‍🏫</>;
const IconTurma = () => <>🏫</>;
const IconAdmin = () => <>🛡️</>;

export default function SecretarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { summary } = adminUserData;
  const secretarioNome = "Secretario teste"; 

  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.header}>
      </header>

      <main className={styles.mainContent}>
        {/* -- Card de Info do Secretário -- */}
        <div className={`${styles.card} ${styles.headerCard}`}>
          <div>
            <h1>Olá, {secretarioNome}</h1>
            <p>Painel do Secretário</p>
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
              <p>Total de Alunos</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconProfessor /></div>
            <div>
              <strong>{summary.professores}</strong>
              <p>Total de Professores</p>
            </div>
          </div>
        </div>

        {children}
      </main>

      <footer className={styles.footer}>
        Copyright © 2025 - Portal Acadêmico
      </footer>
    </div>
  );
}
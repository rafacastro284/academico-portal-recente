'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { professorData } from '../../../../lib/mockData';
import styles from './TurmaDetalheLayout.module.css';

export default function TurmaDetalheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const turmaId = params.turmaId as string;
  const pathname = usePathname();

  const turma = professorData.turmas.find(t => t.id === turmaId);

  if (!turma) {
    return (
      <div className={styles.container}>
        <Link href="/professor/dashboard" className={styles.backButton}>
          &larr; Voltar para Turmas
        </Link>
        <div className={`${styles.card} ${styles.notFound}`}>
          <h2>Turma não encontrada.</h2>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => pathname.includes(path);

  return (
    <div className={styles.container}>
      <Link href="/professor/dashboard" className={styles.backButton}>
        &larr; Voltar para Turmas
      </Link>

      <div className={styles.card}>
        <h2 className={styles.title}>{turma.nome}</h2>
        <p className={styles.turmaInfo}>
          Disciplina: {turma.disciplina} | Horário: {turma.horario}
        </p>

        {/* Abas de Navegação */}
        <div className={styles.tabs}>
          <Link 
            href={`/professor/turma/${turmaId}/alunos`} 
            className={`${styles.tabItem} ${isActive('/alunos') ? styles.activeTab : ''}`}
          >
            Lista de Alunos
          </Link>
          <Link 
            href={`/professor/turma/${turmaId}/lancar-notas`} 
            className={`${styles.tabItem} ${isActive('/lancar-notas') ? styles.activeTab : ''}`}
          >
            Lançar Notas
          </Link>
          <Link 
            href={`/professor/turma/${turmaId}/lancar-frequencia`} 
            className={`${styles.tabItem} ${isActive('/lancar-frequencia') ? styles.activeTab : ''}`}
          >
            Lançar Frequência
          </Link>
        </div>

        {/* Conteúdo da Aba selecionada */}
        <div className={styles.tabContent}>
          {children}
        </div>
      </div>
    </div>
  );
}
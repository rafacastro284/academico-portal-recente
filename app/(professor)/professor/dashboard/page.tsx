import Link from 'next/link';
import styles from './ProfessorDashboard.module.css';
import { professorData } from '../../../lib/mockData';

export default function ProfessorDashboard() {
  const { turmas } = professorData;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Minhas Turmas</h2>
        <p className={styles.subtitle}>Selecione uma turma para lançar notas e frequência</p>

        <div className={styles.turmaGrid}>
          {turmas.map((turma) => (
            <Link key={turma.id} href={`/professor/turma/${turma.id}/alunos`} className={styles.turmaCard}>
              <h3>{turma.nome}</h3>
              <p className={styles.disciplina}>{turma.disciplina}</p>
              <div className={styles.turmaDetails}>
                <div>
                  <strong>{turma.totalAlunos}</strong>
                  <span>Alunos</span>
                </div>
                <div>
                  <strong>{turma.horario}</strong>
                  <span>Horário</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
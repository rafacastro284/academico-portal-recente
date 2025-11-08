'use client';

import { useParams } from 'next/navigation';
import { professorData } from '../../../../../lib/mockData';
import styles from './AlunosLista.module.css'; 

export default function AlunosListaPage() {
  const params = useParams();
  const turmaId = params.turmaId as string;
  const turma = professorData.turmas.find(t => t.id === turmaId);

  if (!turma) return null; 

  const getStatusClass = (status: string) => {
    if (status === 'CURSANDO') return styles.statusCursando;
    if (status === 'RECUPERAÇÃO') return styles.statusRecuperacao;
    return '';
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Alunos da Turma</h3>
        <button className={styles.exportButton}>Exportar Lista</button>
      </div>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Nome do Aluno</th>
            <th>Status</th>
            <th>Média Atual</th>
            <th>Frequência</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {turma.alunos.map((aluno) => (
            <tr key={aluno.matricula}>
              <td>{aluno.matricula}</td>
              <td>{aluno.nome}</td>
              <td>
                <span className={`${styles.statusTag} ${getStatusClass(aluno.status)}`}>
                  {aluno.status}
                </span>
              </td>
              <td>{aluno.mediaAtual?.toFixed(1) || 'N/A'}</td>
              <td>{aluno.frequencia || 'N/A'}</td>
              <td>
                <button className={styles.actionButton}>Ver</button>
                <button className={styles.actionButton}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
// --- NOVO AlunosTable.tsx (Client Component) ---
'use client'; 

import styles from './AlunosLista.module.css';
import Link from 'next/link';

interface AlunoFormatado {
    idAlunoDisciplina: number;
    idAluno: number;
    nome: string;
    matricula: string | null;
    mediaAtual: string; // String para o .toFixed(1)
    faltas: number;
}

interface AlunosTableProps {
    alunos: AlunoFormatado[];
    turmaId: number;
    disciplinaId: number;
}

export default function AlunosTable({ alunos, turmaId, disciplinaId }: AlunosTableProps) {
  
  // Lógica de status (simplificada, pois não tínhamos no action)
  const getStatusClass = (media: string | number) => {
    // Adicionar lógica de status baseada na média ou em outro campo da action
    // Por enquanto, vamos manter uma lógica básica
    if (media === '-') return '';
    if (Number(media) < 5) return styles.statusRecuperacao;
    if (Number(media) >= 7) return styles.statusAprovado;
    return styles.statusCursando;
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Lista de Alunos</h3>
        {/* Você pode passar os IDs para o botão de exportar */}
        <button className={styles.exportButton}>Exportar Lista</button>
      </div>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Nome do Aluno</th>
            <th>Média Atual</th>
            <th>Faltas</th>
            <th>Status (Baseado na Média)</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunos.length === 0 ? (
             <tr><td colSpan={6} style={{ textAlign: 'center' }}>Nenhum aluno inscrito nesta disciplina.</td></tr>
          ) : (
            alunos.map((aluno) => (
              <tr key={aluno.idAluno}>
                <td>{aluno.matricula || 'N/A'}</td>
                <td>{aluno.nome}</td>
                <td>{aluno.mediaAtual}</td>
                <td>{aluno.faltas}</td>
                <td>
                  <span className={`${styles.statusTag} ${getStatusClass(aluno.mediaAtual)}`}>
                    {aluno.mediaAtual !== '-' ? 'Cursando' : 'Sem Notas'}
                  </span>
                </td>
                <td>
                  {/* Navegar para lançar notas ou frequência com os IDs de disciplina/vinculo */}
                  <Link href={`/professor/turma/${turmaId}/lancar-frequencia?disciplina=${disciplinaId}`}>
                    <button className={styles.actionButton}>Frequência</button>
                  </Link>
                   {/* ... outro botão para Notas */}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
// --- FIM do NOVO AlunosTable.tsx ---
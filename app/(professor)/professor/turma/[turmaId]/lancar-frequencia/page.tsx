'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { professorData } from '../../../../../lib/mockData';
import styles from './LancarFrequencia.module.css'; 

export default function LancarFrequenciaPage() {
  const params = useParams();
  const turmaId = params.turmaId as string;
  const turma = professorData.turmas.find(t => t.id === turmaId);

  const today = new Date().toISOString().split('T')[0]; 
  const [dataFrequencia, setDataFrequencia] = useState(today);

  const [frequenciaAlunos, setFrequenciaAlunos] = useState(
    turma?.alunos.map(aluno => ({
      matricula: aluno.matricula,
      nome: aluno.nome,
      statusPresenca: 'P', 
    })) || []
  );

  if (!turma) return null;

  const handlePresencaChange = (matricula: string, status: 'P' | 'F') => {
    setFrequenciaAlunos(prev =>
      prev.map(aluno =>
        aluno.matricula === matricula ? { ...aluno, statusPresenca: status } : aluno
      )
    );
  };

  const handleSaveFrequencia = () => {
    console.log(`Salvando frequência para Turma ${turma.nome} na data ${dataFrequencia}:`, frequenciaAlunos);
    alert('Frequência salva! (Ver console)');
  };

  return (
    <div>
      <div className={styles.filterBar}>
        <div>
          <label>Data:</label>
          <input 
            type="date" 
            value={dataFrequencia} 
            onChange={(e) => setDataFrequencia(e.target.value)} 
            className={styles.dateInput}
          />
        </div>
        <button className={styles.saveButton} onClick={handleSaveFrequencia}>
          Salvar Frequência
        </button>
      </div>

      <h3 className={styles.sectionTitle}>Lançar Frequência</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Nome do Aluno</th>
            <th>Presença / Falta</th>
          </tr>
        </thead>
        <tbody>
          {frequenciaAlunos.map((aluno) => (
            <tr key={aluno.matricula}>
              <td>{aluno.matricula}</td>
              <td>{aluno.nome}</td>
              <td>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name={`frequencia-${aluno.matricula}`}
                      value="P"
                      checked={aluno.statusPresenca === 'P'}
                      onChange={() => handlePresencaChange(aluno.matricula, 'P')}
                    />
                    Presente
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name={`frequencia-${aluno.matricula}`}
                      value="F"
                      checked={aluno.statusPresenca === 'F'}
                      onChange={() => handlePresencaChange(aluno.matricula, 'F')}
                    />
                    Falta
                  </label>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
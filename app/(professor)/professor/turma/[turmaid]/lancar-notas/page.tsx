'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { professorData } from '../../../../../lib/mockData';
import styles from './LancarNotas.module.css'; 

export default function LancarNotasPage() {
  const params = useParams();
  const turmaId = params.turmaId as string;
  const turma = professorData.turmas.find(t => t.id === turmaId);

  const [bimestre, setBimestre] = useState('1'); 
  const [avaliacao, setAvaliacao] = useState('av1'); 

  const [alunosComNotas, setAlunosComNotas] = useState(
    turma?.alunos.map(aluno => ({
      ...aluno,
      nota: (turma.notasLancadas?.find(n => n.matricula === aluno.matricula)?.nota || 0).toFixed(1),
      statusNota: (turma.notasLancadas?.find(n => n.matricula === aluno.matricula)?.status || 'Pendente'),
      ultimaAtualizacao: (turma.notasLancadas?.find(n => n.matricula === aluno.matricula)?.ultimaAtualizacao || '-'),
    })) || []
  );

  if (!turma) return null;

  const handleNotaChange = (matricula: string, novaNota: string) => {
    setAlunosComNotas(prev =>
      prev.map(aluno =>
        aluno.matricula === matricula
          ? { ...aluno, nota: novaNota, statusNota: 'Pendente', ultimaAtualizacao: '-' } 
          : aluno
      )
    );
  };

  const handleSaveAllNotes = () => {
    console.log(`Salvando notas para Turma ${turma.nome}, Bimestre ${bimestre}, Avaliação ${avaliacao}:`, alunosComNotas);
    alert('Notas salvas! (Ver console)');
    setAlunosComNotas(prev => 
      prev.map(aluno => ({ 
        ...aluno, 
        statusNota: 'Lançada', 
        ultimaAtualizacao: new Date().toLocaleDateString('pt-BR') 
      }))
    );
  };

  return (
    <div>
      <div className={styles.filterBar}>
        <div>
          <label>Bimestre:</label>
          <select value={bimestre} onChange={(e) => setBimestre(e.target.value)}>
            <option value="1">1º Bimestre</option>
            <option value="2">2º Bimestre</option>
            <option value="3">3º Bimestre</option>
            <option value="4">4º Bimestre</option>
          </select>
        </div>
        <div>
          <label>Avaliação:</label>
          <select value={avaliacao} onChange={(e) => setAvaliacao(e.target.value)}>
            <option value="av1">AV1</option>
            <option value="av2">AV2</option>
            <option value="av3">AV3</option>
            <option value="avd">AVD</option>
          </select>
        </div>
        <button className={styles.saveButton} onClick={handleSaveAllNotes}>
          Salvar Todas as Notas
        </button>
      </div>

      <h3 className={styles.sectionTitle}>Lançar Notas</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Nome do Aluno</th>
            <th>Nota</th>
            <th>Status</th>
            <th>Última Atualização</th>
          </tr>
        </thead>
        <tbody>
          {alunosComNotas.map((aluno) => (
            <tr key={aluno.matricula}>
              <td>{aluno.matricula}</td>
              <td>{aluno.nome}</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={aluno.nota}
                  onChange={(e) => handleNotaChange(aluno.matricula, e.target.value)}
                  className={styles.notaInput}
                />
              </td>
              <td>
                <span className={`${styles.statusTag} ${aluno.statusNota === 'Lançada' ? styles.statusLancada : styles.statusPendente}`}>
                  {aluno.statusNota}
                </span>
              </td>
              <td>{aluno.ultimaAtualizacao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import { diretorData, filterOptions } from '../../../lib/mockData'; 
import styles from './Frequencia.module.css'; 

const IconFreq = () => <>📈</>;
const IconPresenca = () => <>✅</>;
const IconFalta = () => <>❌</>;
const IconCritico = () => <>⚠️</>;

export default function FrequenciaEscolar() {
  const { frequencia } = diretorData;
  const { turmas, bimestres, disciplinas } = filterOptions;
  const [turmaSel, setTurmaSel] = useState('todas');
  const [bimestreSel, setBimestreSel] = useState('todos');
  const [disciplinaSel, setDisciplinaSel] = useState('todas');

  const getStatusClass = (status: string) => {
    if (status === 'Ótima') return styles.otima;
    if (status === 'Atenção') return styles.atencao;
    return '';
  };

  const filteredTurmas = frequencia.turmas.filter((turma) => {
    const porTurma = turmaSel === 'todas' || turma.nome === turmaSel;
    return porTurma;
  });

  return (
    <div className={styles.container}>
      <Link href="/diretor/dashboard" className={styles.backButton}>
        &larr; Voltar para Visão Geral
      </Link>

      <div className={styles.card}>
        <h2 className={styles.title}>Frequência Escolar</h2>
        
        {/* Filtros */}
        <div className={styles.filterBar}>
          <div>
            <label>Turma:</label>
            <select value={turmaSel} onChange={(e) => setTurmaSel(e.target.value)}>
              <option value="todas">Todas as Turmas</option>
              {turmas.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label>Bimestre:</label>
            <select value={bimestreSel} onChange={(e) => setBimestreSel(e.target.value)}>
              <option value="todos">Todos os Bimestres</option>
              {bimestres.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </select>
          </div>
          <div>
            <label>Disciplina:</label>
            <select value={disciplinaSel} onChange={(e) => setDisciplinaSel(e.target.value)}>
              <option value="todos">Todas as Disciplinas</option>
              {disciplinas.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {}
      <div className={styles.card}>
        <h3 className={styles.subtitle}>Resumo de Frequência</h3>
        <div className={styles.summaryGrid}>
          {}
          <div className={styles.summaryCard}><IconFreq /><strong>{frequencia.summary.frequenciaGeral}</strong><p>Frequência Geral</p></div>
          <div className={styles.summaryCard}><IconPresenca /><strong>{frequencia.summary.presencas}</strong><p>Total Presenças</p></div>
          <div className={styles.summaryCard}><IconFalta /><strong>{frequencia.summary.faltas}</strong><p>Total Faltas</p></div>
          <div className={styles.summaryCard}><IconCritico /><strong>{frequencia.summary.alunosCriticos}</strong><p>Alunos Críticos</p></div>
        </div>
      </div>

      {/* Tabela */}
      <div className={styles.card}>
        <h3 className={styles.subtitle}>Frequência por Turma</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Turma</th>
              <th>Total Alunos</th>
              <th>Frequência Média</th>
              <th>Alunos com Baixa Frequência</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            { }
            {filteredTurmas.map((turma) => (
              <tr key={turma.id}>
                <td>{turma.nome}</td>
                <td>{turma.totalAlunos}</td>
                <td>{turma.frequenciaMedia}</td>
                <td>{turma.alunosBaixaFreq}</td>
                <td>
                  <span className={`${styles.tag} ${getStatusClass(turma.status)}`}>
                    {turma.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
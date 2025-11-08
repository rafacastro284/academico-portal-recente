'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import { diretorData, filterOptions } from '../../../lib/mockData'; 
import styles from './CorpoDocente.module.css';

export default function CorpoDocente() {
  const { corpoDocente } = diretorData;
  const { turmas, bimestres, disciplinas } = filterOptions;
  const [turmaSel, setTurmaSel] = useState('todas');
  const [bimestreSel, setBimestreSel] = useState('todos');
  const [disciplinaSel, setDisciplinaSel] = useState('todas');
  const filteredDocentes = corpoDocente.filter((prof) => {
    const porTurma = turmaSel === 'todas' || prof.turmas.includes(turmaSel);
    const porDisciplina = disciplinaSel === 'todas' || prof.disciplina === disciplinaSel;
    
    return porTurma && porDisciplina;
  });


  return (
    <div className={styles.container}>
      <Link href="/diretor/dashboard" className={styles.backButton}>
        &larr; Voltar para Visão Geral
      </Link>

      <div className={styles.card}>
        <h2 className={styles.title}>Corpo Docente</h2>
        
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
            { }
            <select disabled><option>Todos os Bimestres</option></select>
          </div>
          <div>
            <label>Disciplina:</label>
            <select value={disciplinaSel} onChange={(e) => setDisciplinaSel(e.target.value)}>
              <option value="todas">Todas as Disciplinas</option>
              {disciplinas.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className={styles.card}>
        <h3 className={styles.subtitle}>Corpo Docente</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Professor</th>
              <th>CPF</th>
              <th>Disciplina</th>
              <th>Turmas</th>
              <th>Total Alunos</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            { }
            {filteredDocentes.map((prof) => (
              <tr key={prof.id}>
                <td>{prof.nome}</td>
                <td>{prof.CPF}</td>
                <td>{prof.disciplina}</td>
                <td>{prof.turmas}</td>
                <td>{prof.totalAlunos}</td>
                <td>
                  <span className={styles.ativo}>{prof.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
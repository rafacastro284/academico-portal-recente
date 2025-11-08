'use client';

import { useState } from 'react';
import Link from 'next/link';
import { diretorData, filterOptions } from '../../../lib/mockData'; 
import styles from './Desempenho.module.css';

const IconMedia = () => <>📊</>;
const IconAprovado = () => <>✅</>;
const IconRecuperacao = () => <>⚠️</>;
const IconReprovado = () => <>❌</>;

export default function DesempenhoAcademico() {
  const { desempenho } = diretorData;
  const { turmas, bimestres, disciplinas } = filterOptions;
  const [turmaSel, setTurmaSel] = useState('todas');
  const [bimestreSel, setBimestreSel] = useState('todos');
  const [disciplinaSel, setDisciplinaSel] = useState('todas');
  const filteredAlunos = desempenho.alunos.filter((aluno) => {
    const porTurma = turmaSel === 'todas' || aluno.turma === turmaSel;
    return porTurma;
  });

  return (
    <div className={styles.container}>
      <Link href="/diretor/dashboard" className={styles.backButton}>
        &larr; Voltar para Visão Geral
      </Link>

      <div className={styles.card}>
        <h2 className={styles.title}>Desempenho Acadêmico</h2>
        
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

      { }
      <div className={styles.card}>
        <h3 className={styles.subtitle}>Resumo do Desempenho</h3>
        <div className={styles.summaryGrid}>
          { }
          <div className={styles.summaryCard}><IconMedia /><strong>{desempenho.summary.mediaGeral}</strong><p>Média Geral</p></div>
          <div className={styles.summaryCard}><IconAprovado /><strong>{desempenho.summary.aprovados}</strong><p>Aprovados</p></div>
          <div className={styles.summaryCard}><IconRecuperacao /><strong>{desempenho.summary.recuperacao}</strong><p>Recuperação</p></div>
          <div className={styles.summaryCard}><IconReprovado /><strong>{desempenho.summary.reprovados}</strong><p>Reprovados</p></div>
        </div>
      </div>

      {/* Tabela */}
      <div className={styles.card}>
        <h3 className={styles.subtitle}>Desempenho por Aluno</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Turma</th>
              <th>Média</th>
              <th>Frequência</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            { }
            {filteredAlunos.map((aluno) => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                <td>{aluno.turma}</td>
                <td>{aluno.media}</td>
                <td>{aluno.frequencia}</td>
                <td>
                  <span className={styles.aprovado}>{aluno.situacao}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
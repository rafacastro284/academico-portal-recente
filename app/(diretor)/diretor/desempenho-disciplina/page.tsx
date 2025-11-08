'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import { filterOptions, desempenhoDisciplinaData } from '../../../lib/mockData'; 
import styles from './DesempenhoDisciplina.module.css'; 

const IconMedia = () => <>📊</>;
const IconMelhor = () => <>🏆</>;
const IconPior = () => <>📉</>;

export default function DesempenhoPorDisciplina() {
  const { turmas, disciplinas } = filterOptions;
  const { alunos } = desempenhoDisciplinaData;

  const [turmaSel, setTurmaSel] = useState('');
  const [disciplinaSel, setDisciplinaSel] = useState(''); 

  const showData = turmaSel && disciplinaSel;
  let filteredAlunos: typeof alunos = [];
  let mediaGeral = 0;
  let melhorNota = 0;
  let piorNota = 0;

  if (showData) {
    filteredAlunos = alunos.filter(
      (aluno) => aluno.turma === turmaSel && aluno.disciplina === disciplinaSel
    );

    if (filteredAlunos.length > 0) {
      const notas = filteredAlunos.map((aluno) => aluno.nota);
      const soma = notas.reduce((acc, nota) => acc + nota, 0);
      
      mediaGeral = parseFloat((soma / notas.length).toFixed(1));
      melhorNota = Math.max(...notas);
      piorNota = Math.min(...notas);
    }
  }

  return (
    <div className={styles.container}>
      <Link href="/diretor/dashboard" className={styles.backButton}>
        &larr; Voltar para Visão Geral
      </Link>

      <div className={styles.card}>
        <h2 className={styles.title}>Desempenho por Disciplina</h2>
        
        {/* Filtros */}
        <div className={styles.filterBar}>
          <div>
            <label>Turma:</label>
            <select value={turmaSel} onChange={(e) => setTurmaSel(e.target.value)}>
              <option value="">Selecione a turma</option>
              {turmas.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label>Disciplina:</label>
            <select value={disciplinaSel} onChange={(e) => setDisciplinaSel(e.target.value)}>
              <option value="">Selecione a disciplina</option>
              {disciplinas.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      { }
      {showData ? (
        <>
          { }
          <div className={styles.card}>
            <h3 className={styles.subtitle}>Resumo da Disciplina ({turmaSel} - {disciplinaSel})</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <IconMedia />
                <strong>{mediaGeral}</strong>
                <p>Média Geral</p>
              </div>
              <div className={styles.summaryCard}>
                <IconMelhor />
                <strong>{melhorNota}</strong>
                <p>Melhor Nota</p>
              </div>
              <div className={styles.summaryCard}>
                <IconPior />
                <strong>{piorNota}</strong>
                <p>Pior Nota</p>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className={styles.card}>
            <h3 className={styles.subtitle}>Desempenho por Aluno</h3>
            {filteredAlunos.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Turma</th>
                    <th>Disciplina</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlunos.map((aluno) => (
                    <tr key={aluno.id}>
                      <td>{aluno.nome}</td>
                      <td>{aluno.turma}</td>
                      <td>{aluno.disciplina}</td>
                      <td><strong>{aluno.nota.toFixed(1)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nenhum aluno encontrado para esta combinação de turma e disciplina.</p>
            )}
          </div>
        </>
      ) : (
        <div className={styles.card}>
          <p className={styles.selectMessage}>
            Por favor, selecione uma Turma e uma Disciplina para ver os resultados.
          </p>
        </div>
      )}
    </div>
  );
}
'use client'; 
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { subjectDetails, studentData } from '../../../lib/mockData';
import styles from './Disciplina.module.css';

type SubjectDetailsType = typeof subjectDetails;
type SubjectKey = keyof SubjectDetailsType;

export default function DisciplinaDetalhe() {
  const [activeTab, setActiveTab] = useState('notas'); 
  const params = useParams();
  const id = params.id as SubjectKey;
  const disciplina = studentData.disciplinas.find(d => d.id === id);
  const details = subjectDetails[id];

  if (!disciplina || !details) {
    return <div>Disciplina não encontrada</div>;
  }

  const { grades, attendance } = details;

  return (
    <div className={styles.container}>
      <Link href="/aluno/dashboard" className={styles.backButton}>
        &larr; Voltar para Disciplinas
      </Link>
      
      <h1 className={styles.title}>{disciplina.name}</h1>

      {/* Componente de Abas */}
      <div className={styles.tabs}>
        <button
          className={activeTab === 'notas' ? styles.activeTab : ''}
          onClick={() => setActiveTab('notas')}
        >
          Notas
        </button>
        <button
          className={activeTab === 'frequencia' ? styles.activeTab : ''}
          onClick={() => setActiveTab('frequencia')}
        >
          Frequência
        </button>
      </div>

      {/* Conteúdo Condicional */}
      <div className={styles.content}>
        {activeTab === 'notas' && (
          <div>
            {/* TABELA DE NOTAS */}
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Bimestre</th>
                  <th>AV1</th>
                  <th>AV2</th>
                  <th>AV3</th>
                  <th>Média</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {grades.bimestres.map((b) => (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td>{b.av1 ?? '-'}</td>
                    <td>{b.av2 ?? '-'}</td>
                    <td>{b.av3 ?? '-'}</td>
                    <td><strong>{b.media}</strong></td>
                    <td>
                      <span className={b.situacao === 'APROVADO' ? styles.aprovado : styles.cursando}>
                        {b.situacao}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Resumo de Notas */}
            <div className={styles.summaryGrid}>
               <div className={styles.summaryCard}><strong>{grades.summary.mediaAtual}</strong><p>Média Atual</p></div>
               <div className={styles.summaryCard}><strong>{grades.summary.situacao}</strong><p>Situação</p></div>
               <div className={styles.summaryCard}><strong>{grades.summary.bimestres}</strong><p>Bimestres</p></div>
            </div>
          </div>
        )}

        {activeTab === 'frequencia' && (
          <div>
            {/* TABELA DE FREQUÊNCIA */}
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Dia da Semana</th>
                  <th>Status</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {attendance.logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.data}</td>
                    <td>{log.dia}</td>
                    <td>
                      <span className={styles[log.status.toLowerCase()]}>{log.status}</span>
                    </td>
                    <td>{log.observacoes}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Resumo de Frequência */}
            <div className={styles.summaryGrid}>
               <div className={styles.summaryCard}><strong>{attendance.summary.frequencia}</strong><p>Frequência</p></div>
               <div className={styles.summaryCard}><strong>{attendance.summary.presencas}</strong><p>Presenças</p></div>
               <div className={styles.summaryCard}><strong>{attendance.summary.faltas}</strong><p>Faltas</p></div>
               <div className={styles.summaryCard}><strong>{attendance.summary.justificadas}</strong><p>Justificadas</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
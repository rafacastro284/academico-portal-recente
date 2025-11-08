"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './GerenciarTurmas.module.css';

const DADOS_INICIAIS_TURMAS = [
  { id: 't1', nome: '9º Ano A', serie: '9º Ano - Ens. Fundamental', turno: 'Manhã', professorNome: 'Carlos Silva', totalAlunos: 32 },
  { id: 't2', nome: '9º Ano B', serie: '9º Ano - Ens. Fundamental', turno: 'Manhã', professorNome: 'Ricardo Lima', totalAlunos: 30 },
  { id: 't3', nome: '8º Ano A', serie: '8º Ano - Ens. Fundamental', turno: 'Tarde', professorNome: 'Ana Santos', totalAlunos: 28 },
  { id: 't4', nome: '3º Ano Médio', serie: '3º Ano - Ens. Médio', turno: 'Manhã', professorNome: 'Mariana Costa', totalAlunos: 25 },
];

export default function GerenciarTurmas() {
  const router = useRouter();
  const [turmas, setTurmas] = useState(DADOS_INICIAIS_TURMAS);
  const [serieSel, setSerieSel] = useState('todas');
  const [turnoSel, setTurnoSel] = useState('todos');
  const handleEditar = (turmaId: string) => {
    router.push(`/secretaria/turmas/editar/${turmaId}`);
  };

  const handleExcluir = (turmaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      setTurmas(turmasAtuais => turmasAtuais.filter(t => t.id !== turmaId));
    }
  };
  const filteredTurmas = turmas.filter(turma => {
    const porSerie = serieSel === 'todas' || turma.serie === serieSel;
    const porTurno = turnoSel === 'todos' || turma.turno === turnoSel;
    return porSerie && porTurno;
  });

  return (
    <div className={styles.container}>
      <Link href="/secretaria/dashboard" className={styles.backButton}>
        &larr; Voltar ao Dashboard
      </Link>

      <h1 className={styles.title}>Gerenciar Turmas</h1>

      <div className={styles.filterBar}>
        <div>
          <label htmlFor="filtroSerie">Filtrar por Série/Ano:</label>
          <select id="filtroSerie" value={serieSel} onChange={(e) => setSerieSel(e.target.value)}>
            <option value="todas">Todas as Séries</option>
            {[...new Set(DADOS_INICIAIS_TURMAS.map(t => t.serie))].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filtroTurno">Filtrar por Turno:</label>
          <select id="filtroTurno" value={turnoSel} onChange={(e) => setTurnoSel(e.target.value)}>
            <option value="todos">Todos os Turnos</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
          </select>
        </div>
      </div>

      {/* Tabela de Turmas */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome da Turma</th>
              <th>Série/Ano</th>
              <th>Turno</th>
              <th>Professor Regente</th>
              <th>Nº de Alunos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTurmas.map((turma) => (
              <tr key={turma.id}>
                <td>{turma.nome}</td>
                <td>{turma.serie}</td>
                <td>{turma.turno}</td>
                <td>{turma.professorNome}</td>
                <td>{turma.totalAlunos}</td>
                <td className={styles.actions}>
                  <button onClick={() => handleEditar(turma.id)} className={`${styles.actionButton} ${styles.editButton}`}>
                    Editar
                  </button>
                  <button onClick={() => handleExcluir(turma.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
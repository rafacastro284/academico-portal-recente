"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './GerenciarProfessores.module.css';
import { diretorData, filterOptions } from '../../../lib/mockData';

const mockProfessores = diretorData.corpoDocente;
const disciplinasOptions = filterOptions.disciplinas;

export default function GerenciarProfessores() {
  const [disciplinaSel, setDisciplinaSel] = useState('todas');
  const [busca, setBusca] = useState('');
  const filteredProfessores = mockProfessores
    .filter(prof => {
      const porDisciplina = disciplinaSel === 'todas' || prof.disciplina === disciplinaSel;
      const porBusca = busca === '' ||
                       prof.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       prof.CPF.toLowerCase().includes(busca.toLowerCase());
      
      return porDisciplina && porBusca;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className={styles.container}>
      <Link href="/secretaria/dashboard" className={styles.backButton}>
        &larr; Voltar ao Dashboard
      </Link>

      <h1 className={styles.title}>Gerenciar Professores</h1>
      <div className={styles.filterBar}>
        <div>
          <label htmlFor="filtroDisciplina">Filtrar por Matéria:</label>
          <select id="filtroDisciplina" value={disciplinaSel} onChange={(e) => setDisciplinaSel(e.target.value)}>
            <option value="todas">Todas as Matérias</option>
            {disciplinasOptions.map(disciplina => (
              <option key={disciplina} value={disciplina}>{disciplina}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="busca">Buscar por Nome ou Matrícula:</label>
          <input 
            type="text" 
            id="busca"
            placeholder="Digite o nome ou matrícula..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Professores */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Disciplina Principal</th>
              <th>Turmas</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfessores.map((prof) => (
              <tr key={prof.id}>
                <td>{prof.nome}</td>
                <td>{prof.CPF}</td>
                <td>{prof.disciplina}</td>
                <td>{prof.turmas}</td>
                <td>
                  <span className={`${styles.tag} ${prof.status === 'Ativo' ? styles.tagAtivo : styles.tagInativo}`}>
                    {prof.status}
                  </span>
                </td>
                <td>
                  <span style={{ color: '#aaa' }}>-</span>
                </td>
              </tr>
            ))}
            {filteredProfessores.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  Nenhum professor encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
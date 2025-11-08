"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './GerenciarAlunos.module.css';
import { adminUserData, filterOptions } from '../../../lib/mockData';

const mockAlunos = adminUserData.users
  .filter(user => user.perfil === 'ALUNO')
  .map(user => {
    if (user.id === 'u2') { 
      return { ...user, serie: '8º Ano', turma: '8º Ano A', status: 'Cursando' };
    }
    if (user.id === 'u3') { 
      return { ...user, serie: '9º Ano', turma: '9º Ano B', status: 'Cursando' };
    }
    
    return { ...user, nome: "Aluno Exemplo", serie: '9º Ano', turma: '9º Ano A', status: 'Transferido' }; 
  })
  .concat([ 
    { id: 'a1', nome: 'Ana Beatriz Costa', cpf: '123.456.789-10', perfil: 'ALUNO', matricula: '2024101', email: 'ana@escola.com', dataCadastro: '01/03/2025', serie: '9º Ano', turma: '9º Ano A', status: 'Cursando' },
    { id: 'a2', nome: 'Bruno Gomes', cpf: '123.456.789-11', perfil: 'ALUNO', matricula: '2024102', email: 'bruno@escola.com', dataCadastro: '01/03/2025', serie: '9º Ano', turma: '9º Ano A', status: 'Cursando' },
    { id: 'a3', nome: 'Carla Dias', cpf: '123.456.789-12', perfil: 'ALUNO', matricula: '2024103', email: 'carla@escola.com', dataCadastro: '01/03/2025', serie: '8º Ano', turma: '8º Ano B', status: 'Cursando' }
  ]);
  
const seriesOptions = ['8º Ano', '9º Ano', '1º Ano'];
const turmasOptions = ['8º Ano A', '8º Ano B', '9º Ano A', '9º Ano B']; 

export default function GerenciarAlunos() {
  const [serieSel, setSerieSel] = useState('todas');
  const [turmaSel, setTurmaSel] = useState('todas');
  const [busca, setBusca] = useState('');

  const filteredAlunos = mockAlunos
    .filter(aluno => {
      const porSerie = serieSel === 'todas' || aluno.serie === serieSel;
      const porTurma = turmaSel === 'todas' || aluno.turma === turmaSel;
      const porBusca = busca === '' ||
                       aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       aluno.matricula.includes(busca);
      
      return porSerie && porTurma && porBusca;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className={styles.container}>
      <Link href="/secretaria/dashboard" className={styles.backButton}>
        &larr; Voltar ao Dashboard
      </Link>

      <h1 className={styles.title}>Gerenciar Alunos</h1>

      {/* Filtros */}
      <div className={styles.filterBar}>
        <div>
          <label htmlFor="filtroSerie">Filtrar por Série/Ano:</label>
          <select id="filtroSerie" value={serieSel} onChange={(e) => setSerieSel(e.target.value)}>
            <option value="todas">Todas as Séries</option>
            {seriesOptions.map(serie => (
              <option key={serie} value={serie}>{serie}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtroTurma">Filtrar por Turma:</label>
          <select id="filtroTurma" value={turmaSel} onChange={(e) => setTurmaSel(e.target.value)}>
            <option value="todas">Todas as Turmas</option>
            {turmasOptions.map(turma => (
              <option key={turma} value={turma}>{turma}</option>
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

      {/* Tabela de Alunos */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Matrícula</th>
              <th>Série/Ano</th>
              <th>Turma</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlunos.map((aluno) => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                <td>{aluno.matricula}</td>
                <td>{aluno.serie}</td>
                <td>{aluno.turma}</td>
                <td>
                  <span className={`${styles.tag} ${aluno.status === 'Cursando' ? styles.tagAtivo : styles.tagInativo}`}>
                    {aluno.status}
                  </span>
                </td>
                <td>
                  { }
                  <span style={{ color: '#aaa' }}>-</span>
                </td>
              </tr>
            ))}
            {filteredAlunos.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  Nenhum aluno encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
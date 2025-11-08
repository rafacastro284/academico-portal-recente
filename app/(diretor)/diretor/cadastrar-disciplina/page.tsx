"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './CadastrarDisciplina.module.css'; 
const mockProfessores = [
  { id: 1, nome: 'Dr. João Silva (Matemática)' },
  { id: 2, nome: 'Dra. Maria Souza (Português)' },
  { id: 3, nome: 'Dr. Carlos Lima (História)' },
];
const mockSeries = [
  { id: '6ano', nome: '6º Ano - Ens. Fundamental' },
  { id: '1em', nome: '1º Ano - Ens. Médio' },
];


export default function CadastrarDisciplina() {
  const [nome, setNome] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState(0);
  const [serieId, setSerieId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMessage('Disciplina cadastrada com sucesso!');
      setNome('');
      setProfessorId('');
      setCargaHoraria(0);
      setSerieId('');
      setTimeout(() => setMessage(''), 3000);
    }, 1500);
  };

  return (
    <div className={styles.container}>
      
      { }
      <Link href="/diretor/dashboard" className={styles.backButton}>
        &larr; Voltar para Visão Geral
      </Link>

      { }
      <form className={styles.card} onSubmit={handleSubmit}>
        
        { }
        <h1 className={styles.formTitle}>Cadastrar Nova Disciplina</h1>

        { }
        {/* Nome da Disciplina */}
        <div className={styles.inputGroup}>
          <label htmlFor="nome">Nome da Disciplina</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Matemática Avançada"
            required
          />
        </div>

        {/* Professor Responsável */}
        <div className={styles.inputGroup}>
          <label htmlFor="professor">Professor Responsável</label>
          <select
            id="professor"
            value={professorId}
            onChange={(e) => setProfessorId(e.target.value)}
            required
          >
            <option value="" disabled>Selecione um professor</option>
            {mockProfessores.map(prof => (
              <option key={prof.id} value={prof.id}>{prof.nome}</option>
            ))}
          </select>
        </div>

        {/* Carga Horária */}
        <div className={styles.inputGroup}>
          <label htmlFor="cargaHoraria">Carga Horária (horas)</label>
          <input
            type="number"
            id="cargaHoraria"
            value={cargaHoraria}
            onChange={(e) => setCargaHoraria(Number(e.target.value))}
            min="0"
            required
          />
        </div>

        {/* Série/Ano */}
        <div className={styles.inputGroup}>
          <label htmlFor="serie">Série/Ano</label>
          <select
            id="serie"
            value={serieId}
            onChange={(e) => setSerieId(e.target.value)}
            required
          >
            <option value="" disabled>Selecione a série</option>
            {mockSeries.map(serie => (
              <option key={serie.id} value={serie.id}>{serie.nome}</option>
            ))}
          </select>
        </div>

        {/* Botão de Salvar */}
        <button 
          type="submit" 
          className={styles.submitButton} 
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : 'Salvar Disciplina'}
        </button>

        {/* Mensagem de Sucesso */}
        {message && <p className={styles.successMessage}>{message}</p>}
      </form>
    </div>
  );
}
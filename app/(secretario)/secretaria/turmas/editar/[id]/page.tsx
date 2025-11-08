"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import styles from './EditarTurma.module.css';
import { diretorData, adminUserData } from '../../../../../lib/mockData'; 

const DADOS_INICIAIS_TURMAS = [
  { id: 't1', nome: '9º Ano A', serie: '9º Ano - Ens. Fundamental', turno: 'Manhã', professorNome: 'Carlos Silva', totalAlunos: 32, professorId: 'p1', alunosIds: ['u2', 'a1', 'a2'] },
  { id: 't2', nome: '9º Ano B', serie: '9º Ano - Ens. Fundamental', turno: 'Manhã', professorNome: 'Ricardo Lima', totalAlunos: 30, professorId: 'p3', alunosIds: ['u3', 'a4'] },
  { id: 't3', nome: '8º Ano A', serie: '8º Ano - Ens. Fundamental', turno: 'Tarde', professorNome: 'Ana Santos', totalAlunos: 28, professorId: 'p2', alunosIds: ['a3'] },
  { id: 't4', nome: '3º Ano Médio', serie: '3º Ano - Ens. Médio', turno: 'Manhã', professorNome: 'Mariana Costa', totalAlunos: 25, professorId: 'p4', alunosIds: [] },
];

const mockProfessores = diretorData.corpoDocente;
const mockSeries = [
  "6º Ano - Ens. Fundamental", "7º Ano - Ens. Fundamental", "8º Ano - Ens. Fundamental",
  "9º Ano - Ens. Fundamental", "1º Ano - Ens. Médio", "2º Ano - Ens. Médio", "3º Ano - Ens. Médio",
];

const allMockAlunos = adminUserData.users
  .filter(u => u.perfil === 'ALUNO')
  .map(user => ({ 
    ...user, 
    serie: user.id === 'u2' ? '8º Ano - Ens. Fundamental' : '9º Ano - Ens. Fundamental' 
  }))
  .concat([
    { 
      id: 'a1', 
      nome: 'Ana Beatriz Costa', 
      cpf: '111.000.111-01', 
      perfil: 'ALUNO', 
      matricula: '2024101', 
      email: 'ana@escola.com', 
      dataCadastro: '01/03/2025', 
      serie: '3º Ano - Ens. Médio' 
    },
    { 
      id: 'a2', 
      nome: 'Bruno Gomes', 
      cpf: '111.000.111-02', 
      perfil: 'ALUNO', 
      matricula: '2024102', 
      email: 'bruno@escola.com', 
      dataCadastro: '01/03/2025', 
      serie: '3º Ano - Ens. Médio' 
    },
  ]);

export default function EditarTurma() {
  const router = useRouter();
  const params = useParams();
  const turmaId = params.id as string; 
  const [nomeTurma, setNomeTurma] = useState('');
  const [serie, setSerie] = useState('');
  const [turno, setTurno] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear().toString());
  const [message, setMessage] = useState('');
  const [alunoSearch, setAlunoSearch] = useState('');
  const [selectedAlunos, setSelectedAlunos] = useState<string[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);

  useEffect(() => {
    if (turmaId) {
      const turma = DADOS_INICIAIS_TURMAS.find(t => t.id === turmaId);
      if (turma) {
        setNomeTurma(turma.nome);
        setSerie(turma.serie);
        setTurno(turma.turno);
        setProfessorId(turma.professorId);
        const alunosDaSerie = allMockAlunos.filter(a => a.serie === turma.serie);
        setAvailableStudents(alunosDaSerie);
        setSelectedAlunos(turma.alunosIds); 
      } else {
        setMessage('Erro: Turma não encontrada.');
      }
    }
  }, [turmaId]);
  
  const handleSerieChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novaSerie = e.target.value;
    setSerie(novaSerie);
    setAvailableStudents(allMockAlunos.filter(aluno => aluno.serie === novaSerie));
    setSelectedAlunos([]);
    setAlunoSearch('');
  };

  const handleAlunoSelect = (alunoId: string) => {
    setSelectedAlunos(prev => (prev.includes(alunoId) ? prev.filter(id => id !== alunoId) : [...prev, alunoId]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("--- ATUALIZANDO TURMA ---", turmaId);
    console.log("Alunos Selecionados (IDs):", selectedAlunos);
    
    setMessage('Turma atualizada com sucesso!');
    setTimeout(() => {
      router.push('/secretaria/turmas');
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <Link href="/secretaria/turmas" className={styles.backButton}>
        &larr; Voltar para Gerenciar Turmas
      </Link>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Editar Turma: {nomeTurma}</h1>

        {/* Nome da Turma */}
        <div className={styles.inputGroup}>
          <label htmlFor="nomeTurma">Nome da Turma</label>
          <input type="text" id="nomeTurma" value={nomeTurma} onChange={(e) => setNomeTurma(e.target.value)} required />
        </div>
        
        {/* Série/Ano */}
        <div className={styles.inputGroup}>
          <label htmlFor="serie">Série/Ano</label>
          <select id="serie" value={serie} onChange={handleSerieChange} required>
            <option value="" disabled>Selecione a série</option>
            {mockSeries.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Turno */}
        <div className={styles.inputGroup}>
          <label htmlFor="turno">Turno</label>
          <select id="turno" value={turno} onChange={(e) => setTurno(e.target.value)} required>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
          </select>
        </div>

        {/* Professor Responsável */}
        <div className={styles.inputGroup}>
          <label htmlFor="professor">Professor Responsável (Regente)</label>
          <select id="professor" value={professorId} onChange={(e) => setProfessorId(e.target.value)} required>
            <option value="" disabled>Selecione um professor</option>
            {mockProfessores.map(prof => <option key={prof.id} value={prof.id}>{prof.nome} ({prof.disciplina})</option>)}
          </select>
        </div>
        
        {/* Ano Letivo */}
        <div className={styles.inputGroup}>
          <label htmlFor="anoLetivo">Ano Letivo</label>
          <input type="number" id="anoLetivo" value={anoLetivo} onChange={(e) => setAnoLetivo(e.target.value)} required />
        </div>

        {/* --- Seção de Alunos --- */}
        {serie && (
          <>
            <h2 className={styles.studentSectionTitle}>Selecionar Alunos (da série: {serie})</h2>
            <input type="text" placeholder="Pesquisar aluno..." className={styles.searchBar} value={alunoSearch} onChange={(e) => setAlunoSearch(e.target.value)} />
            
            <div className={styles.studentListContainer}>
              {availableStudents.filter(a => a.nome.toLowerCase().includes(alunoSearch.toLowerCase())).map(aluno => (
                <div key={aluno.id} className={styles.studentItem} onClick={() => handleAlunoSelect(aluno.id)}>
                  <input
                    type="checkbox"
                    id={aluno.id}
                    checked={selectedAlunos.includes(aluno.id)}
                    onChange={() => handleAlunoSelect(aluno.id)}
                  />
                  <label htmlFor={aluno.id}>{aluno.nome} - Matrícula: {aluno.matricula}</label>
                </div>
              ))}
            </div>
          </>
        )}
        <button type="submit" className={styles.submitButton}>
          Salvar Alterações
        </button>
        {message && <p className={styles.successMessage}>{message}</p>}
      </form>
    </div>
  );
}
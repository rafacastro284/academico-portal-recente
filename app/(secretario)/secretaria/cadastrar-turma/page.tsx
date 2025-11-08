"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './CadastrarTurma.module.css';
import { diretorData, adminUserData } from '../../../lib/mockData';

const mockProfessores = diretorData.corpoDocente;
const mockSeries = [
  "6º Ano - Ens. Fundamental",
  "7º Ano - Ens. Fundamental",
  "8º Ano - Ens. Fundamental",
  "9º Ano - Ens. Fundamental",
  "1º Ano - Ens. Médio",
  "2º Ano - Ens. Médio",
  "3º Ano - Ens. Médio",
];

const allMockAlunos = adminUserData.users
  .filter(u => u.perfil === 'ALUNO')
  .map(user => {
    
    if (user.id === 'u2') { 
      return { ...user, serie: '8º Ano - Ens. Fundamental' };
    }
    if (user.id === 'u3') { 
      return { ...user, serie: '9º Ano - Ens. Fundamental' };
    }
    
    return { ...user, serie: '3º Ano - Ens. Médio' }; 
  })
  .concat([ 
    { id: 'a1', nome: 'Ana Beatriz Costa', cpf: '...', perfil: 'ALUNO', matricula: '2024101', email: '...', dataCadastro: '...', serie: '3º Ano - Ens. Médio' },
    { id: 'a2', nome: 'Bruno Gomes', cpf: '...', perfil: 'ALUNO', matricula: '2024102', email: '...', dataCadastro: '...', serie: '3º Ano - Ens. Médio' },
    { id: 'a3', nome: 'Carla Dias', cpf: '...', perfil: 'ALUNO', matricula: '2024103', email: '...', dataCadastro: '...', serie: '3º Ano - Ens. Médio' },
    { id: 'a4', nome: 'Daniel Moreira', cpf: '...', perfil: 'ALUNO', matricula: '2024104', email: '...', dataCadastro: '...', serie: '9º Ano - Ens. Fundamental' },
  ]);


export default function CadastrarTurma() {
  const router = useRouter();
  const [nomeTurma, setNomeTurma] = useState('');
  const [serie, setSerie] = useState(''); 
  const [turno, setTurno] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear().toString());
  const [message, setMessage] = useState('');
  const [alunoSearch, setAlunoSearch] = useState('');
  const [selectedAlunos, setSelectedAlunos] = useState<string[]>([]);
  const [availableStudents, setAvailableStudents] = useState<typeof allMockAlunos>([]);
  const handleSerieChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novaSerie = e.target.value;
    setSerie(novaSerie);
    const alunosDaSerie = allMockAlunos.filter(aluno => aluno.serie === novaSerie);
    setAvailableStudents(alunosDaSerie);
    setSelectedAlunos([]);
    setAlunoSearch('');
  };

  const filteredAlunos = availableStudents.filter(aluno => 
    aluno.nome.toLowerCase().includes(alunoSearch.toLowerCase()) ||
    aluno.matricula.includes(alunoSearch)
  );

  const handleAlunoSelect = (alunoId: string) => {
    setSelectedAlunos(prevSelected => {
      if (prevSelected.includes(alunoId)) {
        return prevSelected.filter(id => id !== alunoId);
      } else {
        return [...prevSelected, alunoId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("--- SALVANDO NOVA TURMA ---");
    console.log("Alunos Selecionados (IDs):", selectedAlunos);
    setMessage('Turma cadastrada com sucesso!');
    setTimeout(() => {
      router.push('/secretaria/dashboard');
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <Link href="/secretaria/dashboard" className={styles.backButton}>
        &larr; Voltar ao Dashboard
      </Link>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Cadastrar Nova Turma</h1>
        
        {/* Série/Ano */}
        <div className={styles.inputGroup}>
          <label htmlFor="serie">Série/Ano</label>
          <select 
            id="serie" 
            value={serie} 
            onChange={handleSerieChange} // <-- MUDANÇA: Usa a nova função
            required
          >
            <option value="" disabled>Selecione a série</option>
            {mockSeries.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Turno */}
        <div className={styles.inputGroup}>
          <label htmlFor="turno">Turno</label>
          <select id="turno" value={turno} onChange={(e) => setTurno(e.target.value)} required>
            <option value="" disabled>Selecione o turno</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            {/* ... etc ... */}
          </select>
        </div>

        {/* Professor Responsável */}
        <div className={styles.inputGroup}>
          <label htmlFor="professor">Professor Responsável (Regente)</label>
          <select id="professor" value={professorId} onChange={(e) => setProfessorId(e.target.value)} required>
            <option value="" disabled>Selecione um professor</option>
            {mockProfessores.map(prof => (
              <option key={prof.id} value={prof.id}>{prof.nome} ({prof.disciplina})</option>
            ))}
          </select>
        </div>
        
        {/* Ano Letivo */}
        <div className={styles.inputGroup}>
          <label htmlFor="anoLetivo">Ano Letivo</label>
          <input
            type="number"
            id="anoLetivo"
            value={anoLetivo}
            onChange={(e) => setAnoLetivo(e.target.value)}
            required
          />
        </div>
        {serie && (
          <>
            <h2 className={styles.studentSectionTitle}>
              Selecionar Alunos (da série: {serie})
            </h2>
            <input
              type="text"
              placeholder="Pesquisar aluno por nome ou matrícula..."
              className={styles.searchBar}
              value={alunoSearch}
              onChange={(e) => setAlunoSearch(e.target.value)}
            />
            
            <div className={styles.studentListContainer}>
              {availableStudents.length === 0 && (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                  Nenhum aluno encontrado para esta série.
                </div>
              )}

             
              {availableStudents.length > 0 && filteredAlunos.length === 0 && (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                  Nenhum aluno encontrado com o termo "{alunoSearch}".
                </div>
              )}

              {filteredAlunos.map(aluno => (
                <div key={aluno.id} className={styles.studentItem} onClick={() => handleAlunoSelect(aluno.id)}>
                  <input
                    type="checkbox"
                    id={aluno.id}
                    checked={selectedAlunos.includes(aluno.id)}
                    onChange={() => handleAlunoSelect(aluno.id)}
                  />
                  <label htmlFor={aluno.id}>
                    {aluno.nome} - Matrícula: {aluno.matricula}
                  </label>
                </div>
              ))}
            </div>
          </>
        )}
       
        
        <button type="submit" className={styles.submitButton}>
          Salvar Turma
        </button>

       
        {message && <p className={styles.successMessage}>{message}</p>}
      </form>
    </div>
  );
}
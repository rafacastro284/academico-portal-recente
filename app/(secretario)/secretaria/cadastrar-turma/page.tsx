"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './CadastrarTurma.module.css';
import { cadastrarTurmaAction, getDadosCadastroTurmaAction } from '@/lib/actions/secretaria';

const mockSeries = [
  "6º Ano - Ens. Fundamental",
  "7º Ano - Ens. Fundamental",
  "8º Ano - Ens. Fundamental",
  "9º Ano - Ens. Fundamental",
  "1º Ano - Ens. Médio",
  "2º Ano - Ens. Médio",
  "3º Ano - Ens. Médio",
];

export default function CadastrarTurma() {
  const router = useRouter();
  
  // Estados do formulário
  const [nomeTurma, setNomeTurma] = useState(''); 
  const [serie, setSerie] = useState(''); 
  const [turno, setTurno] = useState('');
  const [disciplinaId, setDisciplinaId] = useState(''); 
  const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear().toString());
  const [limiteVagas, setLimiteVagas] = useState('30'); 
  
  // Estados de dados e UI
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true); 
  
  // Estados para busca de alunos
  const [alunoSearch, setAlunoSearch] = useState('');
  const [selectedAlunos, setSelectedAlunos] = useState<number[]>([]); 
  const [dbAlunos, setDbAlunos] = useState<any[]>([]); 
  const [dbDisciplinas, setDbDisciplinas] = useState<any[]>([]); 

  // Carregar dados reais ao montar o componente
  useEffect(() => {
    async function loadData() {
      const res = await getDadosCadastroTurmaAction();
      
      if (res.success && res.data) {
        // Acessar alunos e disciplinas através de res.data
        setDbAlunos(res.data.alunos || []);
        setDbDisciplinas(res.data.disciplinas || []);
      } else {
        setMessage(res.error || "Erro ao carregar listas do sistema.");
      }
      
      setLoading(false);
    }
    loadData();
  }, []);

  // Lógica de filtro de alunos
  const filteredAlunos = dbAlunos.filter(aluno => 
    aluno.nome.toLowerCase().includes(alunoSearch.toLowerCase()) ||
    (aluno.matricula && aluno.matricula.includes(alunoSearch))
  );

  const handleAlunoSelect = (alunoId: number) => {
    setSelectedAlunos(prevSelected => {
      if (prevSelected.includes(alunoId)) {
        return prevSelected.filter(id => id !== alunoId);
      } else {
        return [...prevSelected, alunoId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (!nomeTurma) { 
        alert("Preencha o nome da turma"); 
        return;
    }

    const response = await cadastrarTurmaAction({
      nome_turma: nomeTurma,
      serie: serie,
      turno: turno,
      ano_letivo: parseInt(anoLetivo),
      limite_vagas: parseInt(limiteVagas),
      disciplinaId: parseInt(disciplinaId), 
      alunosIds: selectedAlunos 
    });

    if (response.success) {
      setMessage('✅ Turma cadastrada com sucesso!');
      setTimeout(() => {
        router.push('/secretaria/dashboard');
      }, 2000);
    } else {
      setMessage(`❌ Erro: ${response.error}`);
    }
  };

  if (loading) return <div className={styles.container}><p>Carregando dados...</p></div>;

  return (
    <div className={styles.container}>
      <Link href="/secretaria/dashboard" className={styles.backButton}>
        &larr; Voltar ao Dashboard
      </Link>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Cadastrar Nova Turma</h1>
        
        {/* Nome da Turma */}
        <div className={styles.inputGroup}>
          <label htmlFor="nomeTurma">Nome da Turma</label>
          <input 
            type="text" 
            id="nomeTurma"
            value={nomeTurma}
            onChange={(e) => setNomeTurma(e.target.value)}
            placeholder="Ex: 9º Ano A"
            required
          />
        </div>

        {/* Série/Ano */}
        <div className={styles.inputGroup}>
          <label htmlFor="serie">Série/Ano</label>
          <select 
            id="serie" 
            value={serie} 
            onChange={(e) => setSerie(e.target.value)} 
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
          </select>
        </div>

        {/* Professor/Disciplina Responsável */}
        <div className={styles.inputGroup}>
          <label htmlFor="disciplina">Disciplina / Professor Regente</label>
          <select id="disciplina" value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)} required>
            <option value="" disabled>Selecione a disciplina principal</option>
            {dbDisciplinas.map(disc => (
              <option key={disc.iddisciplina} value={disc.iddisciplina}>
                {disc.nome_disciplina} ({disc.professor?.nome || 'Sem Prof.'})
              </option>
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

        {/* Campo de Limite de Vagas */}
        <div className={styles.inputGroup}>
          <label htmlFor="limiteVagas">Limite de Vagas</label>
          <input
            type="number"
            id="limiteVagas"
            value={limiteVagas}
            onChange={(e) => setLimiteVagas(e.target.value)}
            min="1"
            required
          />
        </div>

        {/* Seleção de Alunos */}
        {serie && (
          <>
            <h2 className={styles.studentSectionTitle}>
              Selecionar Alunos
            </h2>
            <input
              type="text"
              placeholder="Pesquisar aluno por nome..."
              className={styles.searchBar}
              value={alunoSearch}
              onChange={(e) => setAlunoSearch(e.target.value)}
            />
            
            <div className={styles.studentListContainer}>
              {filteredAlunos.length === 0 && (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                  Nenhum aluno encontrado.
                </div>
              )}

              {filteredAlunos.map(aluno => (
                <div key={aluno.idusuario} className={styles.studentItem} onClick={() => handleAlunoSelect(aluno.idusuario)}>
                  <input
                    type="checkbox"
                    id={`aluno-${aluno.idusuario}`}
                    checked={selectedAlunos.includes(aluno.idusuario)}
                    onChange={() => handleAlunoSelect(aluno.idusuario)}
                  />
                  <label htmlFor={`aluno-${aluno.idusuario}`}>
                    {aluno.nome} {aluno.matricula ? `- Mat: ${aluno.matricula}` : ''}
                  </label>
                </div>
              ))}
            </div>
          </>
        )}
       
        <button type="submit" className={styles.submitButton}>
          Salvar Turma
        </button>

        {message && (
            <p className={message.includes('Erro') ? styles.errorMessage : styles.successMessage}>
                {message}
            </p>
        )}
      </form>
    </div>
  );
}
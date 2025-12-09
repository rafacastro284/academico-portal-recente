"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import styles from './EditarTurma.module.css';
import { atualizarTurmaAction, getDadosCadastroTurmaAction, buscarTurmaPorIdAction } from '@/lib/actions/secretaria';

const SERIES_DISPONIVEIS = [
  "6º Ano - Ens. Fundamental",
  "7º Ano - Ens. Fundamental", 
  "8º Ano - Ens. Fundamental",
  "9º Ano - Ens. Fundamental",
  "1º Ano - Ens. Médio",
  "2º Ano - Ens. Médio",
  "3º Ano - Ens. Médio",
];

interface DadosCadastroTurma {
  alunos?: Array<{
    idusuario: number;
    nome?: string;
    matricula?: string;
  }>;
  professores?: Array<{
    idusuario: number;
    nome?: string;
  }>;
}

export default function EditarTurma() {
  const router = useRouter();
  const params = useParams();
  const turmaId = parseInt(params.id as string);
  
  // Estados do formulário
  const [nomeTurma, setNomeTurma] = useState('');
  const [serie, setSerie] = useState('');
  const [turno, setTurno] = useState('Manhã');
  const [professorId, setProfessorId] = useState('');
  const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear().toString());
  const [limiteVagas, setLimiteVagas] = useState('');
  
  // Estados de dados
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para alunos
  const [alunoSearch, setAlunoSearch] = useState('');
  const [selectedAlunos, setSelectedAlunos] = useState<number[]>([]);
  const [dbAlunos, setDbAlunos] = useState<Array<{idusuario: number; nome?: string; matricula?: string}>>([]);
  const [dbProfessores, setDbProfessores] = useState<Array<{idusuario: number; nome?: string}>>([]);

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setMessage('Carregando dados...');
        
        // Buscar dados da turma e dados do sistema em paralelo
        const [turmaDados, dadosSistema] = await Promise.all([
          buscarTurmaPorIdAction(turmaId),
          getDadosCadastroTurmaAction()
        ]);

        // Configurar dados do sistema
        if (dadosSistema.success && dadosSistema.data) {
          const data = dadosSistema.data as DadosCadastroTurma;
          
          if (data.alunos && Array.isArray(data.alunos)) {
            setDbAlunos(data.alunos);
          }
          
          if (data.professores && Array.isArray(data.professores)) {
            setDbProfessores(data.professores);
          }
        }

        // Configurar dados da turma
        if (turmaDados.success && turmaDados.data) {
          const turma = turmaDados.data;
          setNomeTurma(turma.nome || '');
          setSerie(turma.serie || '');
          setTurno(turma.turno || 'Manhã');
          setAnoLetivo(turma.anoLetivo?.toString() || new Date().getFullYear().toString());
          setLimiteVagas(turma.limiteVagas?.toString() || '');
          setProfessorId(turma.professorId?.toString() || '');
          setSelectedAlunos(turma.alunosIds || []);
          setMessage('');
        } else {
          setMessage(`❌ ${turmaDados.error || 'Erro ao carregar turma'}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setMessage("❌ Erro ao carregar dados");
        setLoading(false);
      }
    }
    
    if (turmaId && !isNaN(turmaId)) {
      loadData();
    } else {
      setMessage("❌ ID da turma inválido");
      setLoading(false);
    }
  }, [turmaId]);

  // Filtro de alunos
  const filteredAlunos = dbAlunos.filter(aluno => {
    const nome = aluno.nome?.toLowerCase() || '';
    const matricula = aluno.matricula?.toLowerCase() || '';
    const busca = alunoSearch.toLowerCase();
    
    return nome.includes(busca) || matricula.includes(busca);
  });

  const handleAlunoSelect = (alunoId: number) => {
    if (isSaving) return;
    setSelectedAlunos(prev => 
      prev.includes(alunoId) ? prev.filter(id => id !== alunoId) : [...prev, alunoId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nomeTurma.trim()) {
      setMessage("❌ Preencha o nome da turma");
      return;
    }

    if (!serie) {
      setMessage("❌ Selecione uma série");
      return;
    }

    setIsSaving(true);
    setMessage('💾 Salvando alterações...');

    try {
      const response = await atualizarTurmaAction({
        turmaId: turmaId,
        nome_turma: nomeTurma,
        serie: serie,
        turno: turno,
        ano_letivo: parseInt(anoLetivo),
        limite_vagas: limiteVagas ? parseInt(limiteVagas) : null,
        professorId: professorId ? parseInt(professorId) : null,
        alunosIds: selectedAlunos
      });

      if (response.success) {
        setMessage('✅ Turma atualizada com sucesso!');
        setTimeout(() => {
          router.push('/secretaria/turmas');
          router.refresh();
        }, 1500);
      } else {
        setMessage(`❌ Erro: ${response.error || 'Erro ao atualizar turma'}`);
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      setMessage('❌ Erro ao atualizar turma');
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Carregando dados da turma...
          </p>
        </div>
      </div>
    );
  }

  if (message.includes('inválido') && !nomeTurma) {
    return (
      <div className={styles.container}>
        <Link href="/secretaria/turmas" className={styles.backButton}>
          ← Voltar para Gerenciar Turmas
        </Link>
        <div className={styles.card}>
          <p className={styles.errorMessage}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/secretaria/turmas" className={styles.backButton}>
        ← Voltar para Gerenciar Turmas
      </Link>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Editar Turma: {nomeTurma}</h1>

        <div className={styles.inputGroup}>
          <label htmlFor="nomeTurma">Nome da Turma *</label>
          <input 
            type="text" 
            id="nomeTurma"
            value={nomeTurma}
            onChange={(e) => setNomeTurma(e.target.value)}
            required
            disabled={isSaving}
            placeholder="Ex: Turma A, 7º Ano A"
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="serie">Série/Ano *</label>
          <select 
            id="serie" 
            value={serie} 
            onChange={(e) => setSerie(e.target.value)} 
            required
            disabled={isSaving}
          >
            <option value="" disabled>Selecione a série</option>
            {SERIES_DISPONIVEIS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="turno">Turno *</label>
          <select 
            id="turno" 
            value={turno} 
            onChange={(e) => setTurno(e.target.value)} 
            required
            disabled={isSaving}
          >
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="professor">Professor Responsável</label>
          <select 
            id="professor" 
            value={professorId} 
            onChange={(e) => setProfessorId(e.target.value)}
            disabled={isSaving}
          >
            <option value="">Sem professor</option>
            {dbProfessores.map(prof => (
              <option key={prof.idusuario} value={prof.idusuario}>
                {prof.nome || `Professor ${prof.idusuario}`}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="anoLetivo">Ano Letivo *</label>
          <input 
            type="number" 
            id="anoLetivo" 
            value={anoLetivo} 
            onChange={(e) => setAnoLetivo(e.target.value)} 
            required
            disabled={isSaving}
            min="2020"
            max="2030"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="limiteVagas">Limite de Vagas (opcional)</label>
          <input 
            type="number" 
            id="limiteVagas"
            value={limiteVagas}
            onChange={(e) => setLimiteVagas(e.target.value)}
            placeholder="Deixe em branco para sem limite"
            min="1"
            disabled={isSaving}
          />
        </div>

        <h2 className={styles.studentSectionTitle}>
          Selecionar Alunos ({selectedAlunos.length} selecionados)
        </h2>
        
        <input
          type="text"
          placeholder="Pesquisar aluno por nome ou matrícula..."
          className={styles.searchBar}
          value={alunoSearch}
          onChange={(e) => setAlunoSearch(e.target.value)}
          disabled={isSaving}
        />
        
        <div className={styles.studentListContainer}>
          {filteredAlunos.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
              {dbAlunos.length === 0 ? 'Nenhum aluno cadastrado no sistema' : 'Nenhum aluno encontrado com essa busca'}
            </div>
          ) : (
            filteredAlunos.map(aluno => (
              <div 
                key={aluno.idusuario} 
                className={styles.studentItem} 
                onClick={() => handleAlunoSelect(aluno.idusuario)}
                style={isSaving ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
              >
                <input
                  type="checkbox"
                  id={`aluno-${aluno.idusuario}`}
                  checked={selectedAlunos.includes(aluno.idusuario)}
                  onChange={() => handleAlunoSelect(aluno.idusuario)}
                  disabled={isSaving}
                />
                <label htmlFor={`aluno-${aluno.idusuario}`}>
                  {aluno.nome || `Aluno ${aluno.idusuario}`} 
                  {aluno.matricula ? ` - Mat: ${aluno.matricula}` : ''}
                </label>
              </div>
            ))
          )}
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>

        {message && (
          <p className={message.includes('✅') ? styles.successMessage : styles.errorMessage}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
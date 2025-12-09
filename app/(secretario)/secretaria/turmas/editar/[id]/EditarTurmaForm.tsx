'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './EditarTurma.module.css';
import { atualizarTurmaAction } from '@/lib/actions/secretaria';

interface Professor {
  idusuario: number;
  nome: string | null;
}

interface Aluno {
  idusuario: number;
  nome: string | null;
  matricula: string | null;
}

interface TurmaData {
  id: number;
  nome: string | null;
  serie: string | null;
  turno: string | null;
  anoLetivo: number | null;
  limiteVagas: number | null;
  professorId: number | null;
  alunosIds: number[];
}

interface EditarTurmaFormProps {
  turma: TurmaData;
  professores: Professor[];
  alunos: Aluno[];
}

const SERIES_DISPONIVEIS = [
  "6º Ano - Ens. Fundamental",
  "7º Ano - Ens. Fundamental",
  "8º Ano - Ens. Fundamental",
  "9º Ano - Ens. Fundamental",
  "1º Ano - Ens. Médio",
  "2º Ano - Ens. Médio",
  "3º Ano - Ens. Médio",
];

export default function EditarTurmaForm({ turma, professores, alunos }: EditarTurmaFormProps) {
  const router = useRouter();
  const [nomeTurma, setNomeTurma] = useState(turma.nome || '');
  const [serie, setSerie] = useState(turma.serie || '');
  const [turno, setTurno] = useState(turma.turno || 'Manhã');
  const [professorId, setProfessorId] = useState(turma.professorId?.toString() || '');
  const [anoLetivo, setAnoLetivo] = useState(turma.anoLetivo?.toString() || new Date().getFullYear().toString());
  const [limiteVagas, setLimiteVagas] = useState(turma.limiteVagas?.toString() || '');
  const [selectedAlunos, setSelectedAlunos] = useState<number[]>(turma.alunosIds);
  const [alunoSearch, setAlunoSearch] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAlunoSelect = (alunoId: number) => {
    setSelectedAlunos(prev =>
      prev.includes(alunoId) ? prev.filter(id => id !== alunoId) : [...prev, alunoId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('Salvando alterações...');

    const resultado = await atualizarTurmaAction({
      turmaId: turma.id,
      nome_turma: nomeTurma,
      serie: serie,
      turno: turno,
      ano_letivo: Number(anoLetivo),
      limite_vagas: limiteVagas ? Number(limiteVagas) : null,
      professorId: professorId ? Number(professorId) : null,
      alunosIds: selectedAlunos
    });

    if (resultado.success) {
      setMessage('✅ Turma atualizada com sucesso!');
      setTimeout(() => {
        router.push('/secretaria/turmas');
      }, 1500);
    } else {
      setMessage(`❌ Erro: ${resultado.error}`);
      setIsSaving(false);
    }
  };

  const filteredAlunos = alunos.filter(a =>
    a.nome?.toLowerCase().includes(alunoSearch.toLowerCase()) ||
    a.matricula?.toLowerCase().includes(alunoSearch.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Link href="/secretaria/turmas" className={styles.backButton}>
        ← Voltar para Gerenciar Turmas
      </Link>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Editar Turma: {nomeTurma}</h1>

        <div className={styles.inputGroup}>
          <label htmlFor="nomeTurma">Nome da Turma</label>
          <input
            type="text"
            id="nomeTurma"
            value={nomeTurma}
            onChange={(e) => setNomeTurma(e.target.value)}
            required
            disabled={isSaving}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="serie">Série/Ano</label>
          <select
            id="serie"
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            required
            disabled={isSaving}
          >
            <option value="" disabled>Selecione a série</option>
            {SERIES_DISPONIVEIS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="turno">Turno</label>
          <select
            id="turno"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            required
            disabled={isSaving}
          >
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="professor">Professor Responsável (Regente)</label>
          <select
            id="professor"
            value={professorId}
            onChange={(e) => setProfessorId(e.target.value)}
            disabled={isSaving}
          >
            <option value="">Sem professor</option>
            {professores.map(prof => (
              <option key={prof.idusuario} value={prof.idusuario}>
                {prof.nome || 'Sem nome'}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="anoLetivo">Ano Letivo</label>
          <input
            type="number"
            id="anoLetivo"
            value={anoLetivo}
            onChange={(e) => setAnoLetivo(e.target.value)}
            required
            disabled={isSaving}
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
            disabled={isSaving}
          />
        </div>

        <h2 className={styles.studentSectionTitle}>
          Selecionar Alunos ({selectedAlunos.length} selecionados)
        </h2>
        <input
          type="text"
          placeholder="Pesquisar aluno..."
          className={styles.searchBar}
          value={alunoSearch}
          onChange={(e) => setAlunoSearch(e.target.value)}
          disabled={isSaving}
        />

        <div className={styles.studentListContainer}>
          {filteredAlunos.map(aluno => (
            <div
              key={aluno.idusuario}
              className={styles.studentItem}
              onClick={() => !isSaving && handleAlunoSelect(aluno.idusuario)}
            >
              <input
                type="checkbox"
                id={`aluno-${aluno.idusuario}`}
                checked={selectedAlunos.includes(aluno.idusuario)}
                onChange={() => handleAlunoSelect(aluno.idusuario)}
                disabled={isSaving}
              />
              <label htmlFor={`aluno-${aluno.idusuario}`}>
                {aluno.nome || 'Sem nome'} - Matrícula: {aluno.matricula || 'N/A'}
              </label>
            </div>
          ))}
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSaving}>
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
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LancarFrequencia.module.css';
import { lancarFrequenciaAction, getDadosLancamentoFrequenciaListaAction } from '@/lib/actions/professor';

interface AlunoFrequencia {
  idAlunoDisciplina: number;
  idAluno: number;
  nome: string | null;
  matricula: string | null;
  statusAtual: 'P' | 'F' | 'N/A';
}

interface LancarFrequenciaFormProps {
  turmaId: number;
  disciplinaId: number;
  alunosIniciais: AlunoFrequencia[];
  dataInicial: string;
}

export default function LancarFrequenciaForm({
  turmaId,
  disciplinaId,
  alunosIniciais,
  dataInicial,
}: LancarFrequenciaFormProps) {
  const router = useRouter();
  const [dataSelecionada, setDataSelecionada] = useState(dataInicial);
  const [alunos, setAlunos] = useState(alunosIniciais);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const carregarDadosDaData = async (data: string) => {
    if (!data) return;
    
    setIsLoadingData(true);
    setStatusMessage('');
    
    try {
      const resultado = await getDadosLancamentoFrequenciaListaAction(
        turmaId,
        disciplinaId,
        data
      );
      
      if (resultado.success && resultado.data) {
        setAlunos(resultado.data.alunos);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da data:', error);
      setStatusMessage('❌ Erro ao carregar dados da data selecionada.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novaData = e.target.value;
    setDataSelecionada(novaData);
    carregarDadosDaData(novaData);
  };

  const handleStatusChange = (idAlunoDisciplina: number, novoStatus: 'P' | 'F') => {
    setAlunos(prev =>
      prev.map(aluno =>
        aluno.idAlunoDisciplina === idAlunoDisciplina
          ? { ...aluno, statusAtual: novoStatus }
          : aluno
      )
    );
  };

  const handleMarcarTodosPresentes = () => {
    setAlunos(prev => prev.map(aluno => ({ ...aluno, statusAtual: 'P' as const })));
  };

  const handleMarcarTodosFaltosos = () => {
    setAlunos(prev => prev.map(aluno => ({ ...aluno, statusAtual: 'F' as const })));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    setStatusMessage('Salvando frequências...');

    const registros = alunos.map(aluno => ({
      idAlunoDisciplina: aluno.idAlunoDisciplina,
      status: aluno.statusAtual === 'F' ? 'F' as const : 'P' as const
    }));

    try {
      const resultado = await lancarFrequenciaAction({
        disciplinaId: disciplinaId,
        data: dataSelecionada,
        registros: registros
      });

      if (resultado.success) {
        setStatusMessage(`✅ Frequências salvas com sucesso para ${dataSelecionada}!`);
        setTimeout(() => {
          router.push(`/professor/turma/${turmaId}/alunos?disciplina=${disciplinaId}`);
        }, 1500);
      } else {
        setStatusMessage(`❌ Erro ao salvar: ${resultado.error || 'Erro interno.'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar frequências:', error);
      setStatusMessage('❌ Erro ao salvar frequências.');
    } finally {
      setIsSaving(false);
    }
  };

  const contarPresencas = () => alunos.filter(a => a.statusAtual === 'P').length;
  const contarFaltas = () => alunos.filter(a => a.statusAtual === 'F').length;

  return (
    <div className={styles.formContainer}>
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="dataLancamento">Data do Registro:</label>
          <input
            type="date"
            id="dataLancamento"
            value={dataSelecionada}
            onChange={handleDataChange}
            required
            disabled={isSaving || isLoadingData}
          />
        </div>

        <div className={styles.quickActions}>
          <button 
            type="button" 
            onClick={handleMarcarTodosPresentes}
            className={styles.btnPresentes}
            disabled={isSaving || isLoadingData}
          >
            Marcar Todos Presentes
          </button>
          <button 
            type="button" 
            onClick={handleMarcarTodosFaltosos}
            className={styles.btnFaltas}
            disabled={isSaving || isLoadingData}
          >
            Marcar Todos Faltosos
          </button>
        </div>
      </div>

      <div className={styles.resumo}>
        <p><strong>Presenças:</strong> {contarPresencas()}</p>
        <p><strong>Faltas:</strong> {contarFaltas()}</p>
        <p><strong>Total de Alunos:</strong> {alunos.length}</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Nome do Aluno</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno.idAlunoDisciplina}>
                <td>{aluno.matricula || 'N/A'}</td>
                <td>{aluno.nome || 'Aluno Sem Nome'}</td>
                <td>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name={`status-${aluno.idAlunoDisciplina}`}
                        value="P"
                        checked={aluno.statusAtual === 'P'}
                        onChange={() => handleStatusChange(aluno.idAlunoDisciplina, 'P')}
                        disabled={isSaving || isLoadingData}
                      />
                      <span>Presente</span>
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name={`status-${aluno.idAlunoDisciplina}`}
                        value="F"
                        checked={aluno.statusAtual === 'F'}
                        onChange={() => handleStatusChange(aluno.idAlunoDisciplina, 'F')}
                        disabled={isSaving || isLoadingData}
                      />
                      <span>Falta</span>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.actionButtons}>
        <button 
          type="button"
          onClick={() => router.back()}
          className={styles.cancelButton}
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className={styles.saveButton}
          disabled={isSaving || isLoadingData}
          onClick={handleSalvar}
        >
          {isSaving ? 'Salvando...' : 'Salvar Frequências'}
        </button>
      </div>

      {statusMessage && (
        <p className={`${styles.status} ${statusMessage.includes('✅') ? styles.success : styles.error}`}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}
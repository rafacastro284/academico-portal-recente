'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LancarNotas.module.css';
import { lancarNotaAction, excluirNotaAction } from '@/lib/actions/professor';

interface NotaExistente {
  idNota: number;
  descricao: string | null;
  valor: number;
  data: Date | null;
}

interface LancarNotasFormProps {
  turmaId: number;
  disciplinaId: number;
  alunoIdDisciplina: number;
  notasExistentes: NotaExistente[];
}

export default function LancarNotasForm({
  turmaId,
  disciplinaId,
  alunoIdDisciplina,
  notasExistentes,
}: LancarNotasFormProps) {
  const router = useRouter();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descricao.trim()) {
      setStatusMessage('❌ Digite uma descrição para a avaliação.');
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 10) {
      setStatusMessage('❌ Digite uma nota válida entre 0 e 10.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Salvando nota...');

    try {
      const resultado = await lancarNotaAction({
        idAlunoDisciplina: alunoIdDisciplina,
        descricaoAvaliacao: descricao.trim(),
        valor: valorNumerico
      });

      if (resultado.success) {
        setStatusMessage(`✅ Nota salva com sucesso!`);
        setDescricao('');
        setValor('');
        
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setStatusMessage(`❌ Erro ao salvar: ${resultado.error || 'Erro interno.'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      setStatusMessage('❌ Erro ao salvar nota.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExcluir = async (idNota: number) => {
    if (!confirm('Deseja realmente excluir esta nota?')) return;

    try {
      const resultado = await excluirNotaAction(idNota);
      if (resultado.success) {
        setStatusMessage('✅ Nota excluída com sucesso!');
        router.refresh();
      } else {
        setStatusMessage(`❌ Erro ao excluir: ${resultado.error}`);
      }
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      setStatusMessage('❌ Erro ao excluir nota.');
    }
  };

  const formatarData = (data: Date | null) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.sectionTitle}>Nova Avaliação</h3>
      
      <form onSubmit={handleSalvar} className={styles.notaForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="descricao">Descrição da Avaliação:</label>
          <input
            type="text"
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Prova 1, Trabalho, AV1, etc."
            required
            disabled={isSaving}
            className={styles.inputField}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="valor">Nota (0 a 10):</label>
          <input
            type="number"
            id="valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0.0"
            step="0.1"
            min="0"
            max="10"
            required
            disabled={isSaving}
            className={styles.inputField}
          />
        </div>

        <div className={styles.actionButtons}>
          <button 
            type="button"
            onClick={() => router.back()}
            className={styles.cancelButton}
            disabled={isSaving}
          >
            Voltar
          </button>
          <button 
            type="submit" 
            className={styles.saveButton}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar Nota'}
          </button>
        </div>
      </form>

      {statusMessage && (
        <p className={`${styles.status} ${statusMessage.includes('✅') ? styles.success : styles.error}`}>
          {statusMessage}
        </p>
      )}

      <h3 className={styles.sectionTitle}>Histórico de Notas</h3>
      
      {notasExistentes.length === 0 ? (
        <p className={styles.emptyMessage}>Nenhuma nota lançada ainda.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Avaliação</th>
              <th>Nota</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {notasExistentes.map((nota) => (
              <tr key={nota.idNota}>
                <td>{nota.descricao || 'Sem descrição'}</td>
                <td><strong>{nota.valor.toFixed(1)}</strong></td>
                <td>{formatarData(nota.data)}</td>
                <td>
                  <button
                    onClick={() => handleExcluir(nota.idNota)}
                    className={styles.deleteButton}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
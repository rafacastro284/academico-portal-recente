'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDetalhesDisciplinaAction } from '@/lib/actions/aluno';
import styles from './Disciplina.module.css';

interface Nota {
  idnota: number;
  descricao: string | null;
  valor: number;
  data: Date | null;
}

interface Frequencia {
  idfrequencia: number;
  data: Date | null;
  faltas: number;
}

interface DadosDisciplina {
  nomeDisciplina: string;
  professor: string;
  resumo: {
    media: string;
    faltas: number;
    porcentagemFreq: string;
  };
  notas: Nota[];
  frequencias: Frequencia[];
}

export default function DetalhesDisciplinaPage() {
  const params = useParams();
  const router = useRouter();
  const idDisciplina = Number(params?.id);
  
  const [activeTab, setActiveTab] = useState<'notas' | 'frequencia'>('notas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dados, setDados] = useState<DadosDisciplina | null>(null);

  useEffect(() => {
    async function carregarDados() {
      if (!idDisciplina || isNaN(idDisciplina)) {
        setError('ID da disciplina inválido');
        setLoading(false);
        return;
      }

      try {
        const resultado = await getDetalhesDisciplinaAction(idDisciplina);
        
        if (resultado.success && resultado.data) {
          const dadosFormatados: DadosDisciplina = {
            nomeDisciplina: resultado.data.nomeDisciplina || 'Disciplina sem nome',
            professor: resultado.data.professor || 'Professor não informado',
            resumo: {
              media: resultado.data.resumo.media || '-',
              faltas: resultado.data.resumo.faltas || 0,
              porcentagemFreq: resultado.data.resumo.porcentagemFreq || '100%'
            },
            notas: (resultado.data.notas || []).map((n: any) => ({
              idnota: n.idnota,
              descricao: n.descricao || 'Avaliação',
              valor: Number(n.valor || 0),
              data: n.data ? new Date(n.data) : null
            })),
            frequencias: (resultado.data.frequencias || []).map((f: any) => ({
              idfrequencia: f.idfrequencia,
              data: f.data ? new Date(f.data) : null,
              faltas: Number(f.faltas || 0)
            }))
          };
          
          setDados(dadosFormatados);
        } else {
          setError(resultado.error || 'Erro ao carregar os dados da disciplina');
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro interno do sistema. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [idDisciplina]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Carregando dados da disciplina...</p>
        </div>
      </div>
    );
  }

  if (error || !dados) {
    return (
      <div className={styles.container}>
        <Link href="/aluno/dashboard" className={styles.backButton}>
          &larr; Voltar para Dashboard
        </Link>
        <div className={styles.errorContainer}>
          <h3>Erro</h3>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/aluno/dashboard')}
            className={styles.errorButton}
          >
            Voltar para Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/aluno/dashboard" className={styles.backButton}>
        &larr; Voltar para Dashboard
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>{dados.nomeDisciplina}</h1>
        <p className={styles.professor}>Professor(a): {dados.professor}</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={activeTab === 'notas' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('notas')}
        >
          Notas e Avaliações
        </button>
        <button
          className={activeTab === 'frequencia' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('frequencia')}
        >
          Frequência
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <strong>{dados.resumo.media}</strong>
            <p>Média Atual</p>
          </div>
          <div className={styles.summaryCard}>
            <strong>{dados.resumo.faltas}</strong>
            <p>Total de Faltas</p>
          </div>
          <div className={styles.summaryCard}>
            <strong>{dados.resumo.porcentagemFreq}</strong>
            <p>Frequência</p>
          </div>
        </div>

        {activeTab === 'notas' ? (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Notas e Avaliações</h3>
            
            {dados.notas.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Nenhuma nota lançada até o momento.</p>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Data</th>
                      <th>Nota</th>
                      <th>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.notas.map((nota) => (
                      <tr key={nota.idnota}>
                        <td>{nota.descricao}</td>
                        <td>{nota.data ? nota.data.toLocaleDateString('pt-BR') : '-'}</td>
                        <td>
                          <strong className={styles.notaValor}>
                            {nota.valor.toFixed(1)}
                          </strong>
                        </td>
                        <td>
                          <span className={
                            nota.valor >= 6 ? styles.statusAprovado : styles.statusReprovado
                          }>
                            {nota.valor >= 6 ? 'Aprovado' : 'Reprovado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className={styles.notasSummary}>
                  <p>
                    <strong>Total de Avaliações:</strong> {dados.notas.length}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Registro de Frequência</h3>
            
            {dados.frequencias.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Nenhum registro de frequência encontrado.</p>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Faltas Registradas</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.frequencias.map((freq) => (
                      <tr key={freq.idfrequencia}>
                        <td>{freq.data ? freq.data.toLocaleDateString('pt-BR') : '-'}</td>
                        <td>
                          <strong className={styles.faltaValor}>
                            {freq.faltas} falta{freq.faltas !== 1 ? 's' : ''}
                          </strong>
                        </td>
                        <td>
                          <span className={styles.statusFalta}>
                            {freq.faltas > 0 ? 'Falta' : 'Presente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className={styles.frequenciaSummary}>
                  <p>
                    <strong>Total de dias com registro:</strong> {dados.frequencias.length}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
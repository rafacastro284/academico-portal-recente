'use client'; 

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; 
import Link from 'next/link';
import { getDetalhesDisciplinaAction } from '@/lib/actions'; 
import styles from './Disciplina.module.css';

// Tipagem do que vamos exibir na tela
interface Nota {
  idnota: number;
  descricao: string;
  valor: number;
  data: string; // Convertido para string na formatação
}

interface Frequencia {
  idfrequencia: number;
  data: string; // Convertido para string na formatação
  faltas: number;
}

interface DadosDisciplina {
  nomeDisciplina: string;
  professor: string;
  notas: Nota[];
  frequencias: Frequencia[];
  resumo: { media: string; faltas: number; porcentagemFreq: string };
}

export default function DisciplinaDetalhe() {
  const params = useParams();
  const idDisciplina = Number(params?.id); 

  const [activeTab, setActiveTab] = useState('notas'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [dados, setDados] = useState<DadosDisciplina | null>(null);

  useEffect(() => {
    async function carregarDados() {
      if (!idDisciplina) return;

      const resultado = await getDetalhesDisciplinaAction(idDisciplina);

      if (resultado.success && resultado.data) {
        // ✅ CORREÇÃO AQUI: Tratamento de nulos com ||
        const dataFormatada: DadosDisciplina = {
            nomeDisciplina: resultado.data.nomeDisciplina || "Disciplina sem Nome",
            professor: resultado.data.professor || "Professor não informado",
            
            resumo: {
                media: resultado.data.resumo.media,
                faltas: resultado.data.resumo.faltas,
                porcentagemFreq: resultado.data.resumo.porcentagemFreq
            },

            notas: resultado.data.notas.map((n: any) => ({
                idnota: n.idnota,
                descricao: n.descricao,
                valor: Number(n.valor), 
                data: n.data ? new Date(n.data).toLocaleDateString('pt-BR') : '-'
            })),

            frequencias: resultado.data.frequencias.map((f: any) => ({
                idfrequencia: f.idfrequencia,
                faltas: f.faltas,
                data: f.data ? new Date(f.data).toLocaleDateString('pt-BR') : '-'
            }))
        };
        setDados(dataFormatada);
      } else {
        setError(resultado.error || "Erro ao carregar disciplina.");
      }
      setLoading(false);
    }

    carregarDados();
  }, [idDisciplina]);

  if (loading) return <div className={styles.container}><p>Carregando dados...</p></div>;
  if (error || !dados) return <div className={styles.container}><p style={{color: 'red'}}>{error}</p></div>;

  return (
    <div className={styles.container}>
      <Link href="/aluno/dashboard" className={styles.backButton}>
        &larr; Voltar para Dashboard
      </Link>
      
      <div style={{ marginBottom: '20px' }}>
         <h1 className={styles.title}>{dados.nomeDisciplina}</h1>
         <p style={{ color: '#666' }}>Professor(a): {dados.professor}</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={activeTab === 'notas' ? styles.activeTab : ''}
          onClick={() => setActiveTab('notas')}
        >
          Notas e Avaliações
        </button>
        <button
          className={activeTab === 'frequencia' ? styles.activeTab : ''}
          onClick={() => setActiveTab('frequencia')}
        >
          Frequência
        </button>
      </div>

      <div className={styles.content}>
        
        {/* --- ABA DE NOTAS --- */}
        {activeTab === 'notas' && (
          <div>
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
                {dados.notas.length === 0 ? (
                    <tr><td colSpan={4} style={{textAlign:'center'}}>Nenhuma nota lançada.</td></tr>
                ) : (
                    dados.notas.map((nota) => (
                    <tr key={nota.idnota}>
                        <td>{nota.descricao || 'Avaliação'}</td>
                        <td>{nota.data}</td>
                        <td><strong>{nota.valor.toFixed(1)}</strong></td>
                        <td>
                        <span style={{ 
                            color: nota.valor >= 6 ? 'green' : 'red', 
                            fontWeight: 'bold',
                            backgroundColor: nota.valor >= 6 ? '#d4edda' : '#f8d7da',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem'
                        }}>
                            {nota.valor >= 6 ? 'Azul' : 'Vermelho'}
                        </span>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
            
            <div className={styles.summaryGrid}>
               <div className={styles.summaryCard}>
                 <strong>{dados.resumo.media}</strong>
                 <p>Média Atual</p>
               </div>
               <div className={styles.summaryCard}>
                 <strong>{dados.notas.length}</strong>
                 <p>Avaliações</p>
               </div>
            </div>
          </div>
        )}

        {/* --- ABA DE FREQUÊNCIA --- */}
        {activeTab === 'frequencia' && (
          <div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Registro</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                 {dados.frequencias.length === 0 ? (
                    <tr><td colSpan={3} style={{textAlign:'center'}}>Sem faltas registradas.</td></tr>
                ) : (
                    dados.frequencias.map((freq) => (
                    <tr key={freq.idfrequencia}>
                        <td>{freq.data}</td>
                        <td>{freq.faltas} falta(s)</td>
                        <td>
                        <span style={{ color: 'red', fontWeight: 'bold' }}>Falta</span>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>

            <div className={styles.summaryGrid}>
               <div className={styles.summaryCard}>
                 <strong>{dados.resumo.porcentagemFreq}</strong>
                 <p>Frequência</p>
               </div>
               <div className={styles.summaryCard}>
                 <strong>{dados.resumo.faltas}</strong>
                 <p>Total Faltas</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
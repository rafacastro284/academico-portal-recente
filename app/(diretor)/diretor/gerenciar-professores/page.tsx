"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './GerenciarProfessores.module.css';
import { listarProfessoresComDisciplinasAction, excluirProfessorAction } from '@/lib/actions/diretoria';

interface Professor {
  idusuario: number;
  nome: string;
  cpf?: string;
  matricula?: string;
  email?: string;
  disciplinas: string[];
  turmas: string[];
  totalDisciplinas: number;
  totalTurmas: number;
}

export default function GerenciarProfessoresDiretor() {
  const router = useRouter();
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [excluindo, setExcluindo] = useState<number | null>(null);
  const [disciplinaSel, setDisciplinaSel] = useState('todas');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarProfessores();
  }, []);

  async function carregarProfessores() {
    try {
      setLoading(true);
      const response = await listarProfessoresComDisciplinasAction();
      
      if (response.success && response.data) {
        const professoresFormatados: Professor[] = response.data.map((prof: any) => ({
          idusuario: prof.idusuario,
          nome: prof.nome || 'Sem nome',
          cpf: prof.cpf || undefined,
          matricula: prof.matricula || undefined,
          email: prof.email || undefined,
          disciplinas: prof.disciplinas || [],
          turmas: prof.turmas || [],
          totalDisciplinas: prof.totalDisciplinas || 0,
          totalTurmas: prof.totalTurmas || 0
        }));
        
        setProfessores(professoresFormatados);
      } else {
        console.error('Erro ao carregar professores:', response.error);
        setProfessores([]);
      }
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
      setProfessores([]);
    } finally {
      setLoading(false);
    }
  }

  const handleEditar = (professorId: number) => {
    router.push(`/diretor/professores/editar/${professorId}`);
  };

  const handleExcluir = async (professorId: number, nomeProfessor: string) => {
    const confirmacao = window.confirm(
      `⚠️ ATENÇÃO: Exclusão Permanente\n\n` +
      `Tem certeza que deseja EXCLUIR o professor:\n"${nomeProfessor}"?\n\n` +
      `Esta ação é IRREVERSÍVEL e removerá:\n` +
      `• Todas as disciplinas associadas\n` +
      `• Todos os vínculos com turmas\n` +
      `• Todas as notas e frequências registradas\n\n` +
      `Clique em OK para confirmar ou Cancelar para desistir.`
    );
    
    if (!confirmacao) return;
    
    try {
      setExcluindo(professorId);
      const resultado = await excluirProfessorAction(professorId);
      
      if (resultado.success) {
        setProfessores(professores.filter(p => p.idusuario !== professorId));
        alert(`✅ Professor "${nomeProfessor}" excluído com sucesso!`);
      } else {
        alert(`❌ Erro ao excluir: ${resultado.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
      alert('❌ Erro ao excluir professor. Tente novamente.');
    } finally {
      setExcluindo(null);
    }
  };

  const filteredProfessores = professores
    .filter(prof => {
      const porDisciplina = disciplinaSel === 'todas' || 
                           prof.disciplinas.some(disc => disc === disciplinaSel);
      const porBusca = busca === '' ||
                       prof.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       (prof.matricula && prof.matricula.toLowerCase().includes(busca.toLowerCase())) ||
                       (prof.cpf && prof.cpf.includes(busca)) ||
                       prof.disciplinas.some(disc => 
                         disc.toLowerCase().includes(busca.toLowerCase())
                       );
      
      return porDisciplina && porBusca;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const disciplinasUnicas = [...new Set(
    professores.flatMap(p => p.disciplinas)
  )].filter(Boolean).sort();

  if (loading) {
    return (
      <div className={styles.container}>
        <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando professores...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/diretor/dashboard" className={styles.backButton}>
        ← Voltar ao Dashboard
      </Link>

      <h1 className={styles.title}>Gerenciar Professores</h1>
      
      <div className={styles.filterBar}>
        <div>
          <label htmlFor="filtroDisciplina">Filtrar por Matéria:</label>
          <select id="filtroDisciplina" value={disciplinaSel} onChange={(e) => setDisciplinaSel(e.target.value)}>
            <option value="todas">Todas as Matérias</option>
            {disciplinasUnicas.map(disciplina => (
              <option key={disciplina} value={disciplina}>{disciplina}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 2 }}>
          <label htmlFor="busca">Buscar por Nome, CPF, Matrícula ou Disciplina:</label>
          <input 
            type="text" 
            id="busca"
            placeholder="Digite para buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Professor</th>
              <th>CPF</th>
              <th>Disciplinas</th>
              <th>Turmas</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfessores.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  {professores.length === 0 ? 'Nenhum professor cadastrado no sistema.' : 'Nenhum professor encontrado com esses filtros.'}
                </td>
              </tr>
            ) : (
              filteredProfessores.map((prof) => (
                <tr key={prof.idusuario}>
                  <td>
                    <div className={styles.professorInfo}>
                      <strong>{prof.nome}</strong>
                    </div>
                  </td>
                  <td>{prof.cpf || 'Não informado'}</td>
                  <td>
                    {prof.disciplinas.length > 0 ? (
                      <>
                        <div className={styles.disciplinasList}>
                          {prof.disciplinas.slice(0, 2).map((disc, index) => (
                            <span key={index} className={styles.disciplinaTag}>
                              {disc}
                            </span>
                          ))}
                          {prof.disciplinas.length > 2 && (
                            <span className={styles.moreItems}>
                              +{prof.disciplinas.length - 2} mais
                            </span>
                          )}
                        </div>
                        <div className={styles.totalBadge}>
                          {prof.totalDisciplinas} disciplina{prof.totalDisciplinas !== 1 ? 's' : ''}
                        </div>
                      </>
                    ) : (
                      <span className={styles.semDisciplinas}>Sem disciplinas</span>
                    )}
                  </td>
                  <td>
                    {prof.turmas.length > 0 ? (
                      <>
                        <div className={styles.turmasList}>
                          {prof.turmas.slice(0, 2).map((turma, index) => (
                            <span key={index} className={styles.turmaTag}>
                              {turma}
                            </span>
                          ))}
                          {prof.turmas.length > 2 && (
                            <span className={styles.moreItems}>
                              +{prof.turmas.length - 2} mais
                            </span>
                          )}
                        </div>
                        <div className={styles.totalBadge}>
                          {prof.totalTurmas} turma{prof.totalTurmas !== 1 ? 's' : ''}
                        </div>
                      </>
                    ) : (
                      <span className={styles.semTurmas}>Sem turmas</span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.tag} ${styles.tagAtivo}`}>
                      Ativo
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <button 
                      onClick={() => handleExcluir(prof.idusuario, prof.nome)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      disabled={excluindo === prof.idusuario}
                      title="Excluir professor"
                    >
                      {excluindo === prof.idusuario ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666', textAlign: 'right' }}>
        {filteredProfessores.length === professores.length 
          ? `Total de professores: ${professores.length}`
          : `Mostrando ${filteredProfessores.length} de ${professores.length} professores`
        }
      </div>
    </div>
  );
}
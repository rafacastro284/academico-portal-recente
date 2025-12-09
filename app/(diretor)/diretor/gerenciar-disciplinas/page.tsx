'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './GerenciarDisciplinas.module.css';
import { listarDisciplinasAction, excluirDisciplinaAction } from '@/lib/actions/diretoria';

interface TurmaVinculada {
  turma: {
    idturma: number;
    nome_turma: string | null;
    serie: string | null;
    turno: string | null;
  };
}

interface Disciplina {
  iddisciplina: number;
  nome_disciplina: string;
  professor?: {
    nome: string | null;
  };
  turmas?: TurmaVinculada[];
  carga_horaria?: number | null;
}

export default function GerenciarDisciplinas() {
  const router = useRouter();
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [excluindo, setExcluindo] = useState<number | null>(null);
  
  const [busca, setBusca] = useState('');
  const [professorSel, setProfessorSel] = useState('todos');
  
  useEffect(() => {
    carregarDisciplinas();
  }, []);

  async function carregarDisciplinas() {
    try {
      setLoading(true);
      const res = await listarDisciplinasAction();
      
      if (res.success && res.data) {
        const disciplinasFormatadas: Disciplina[] = res.data.map((disciplina: any) => ({
          iddisciplina: disciplina.iddisciplina,
          nome_disciplina: disciplina.nome_disciplina || "Disciplina sem nome",
          professor: {
            nome: disciplina.professor?.nome || "Sem professor"
          },
          turmas: disciplina.turmas || [],
          carga_horaria: disciplina.carga_horaria
        }));
        
        setDisciplinas(disciplinasFormatadas);
      } else {
        console.error('Erro ao carregar disciplinas:', res.error);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleEditarDisciplina = (disciplinaId: number) => {
    router.push(`/diretor/disciplinas/editar/${disciplinaId}`);
  };

  const handleExcluir = async (disciplinaId: number, nomeDisciplina: string) => {
    const confirmacao = window.confirm(
      `⚠️ ATENÇÃO: Exclusão Permanente\n\n` +
      `Tem certeza que deseja EXCLUIR a disciplina:\n"${nomeDisciplina}"?\n\n` +
      `Esta ação é IRREVERSÍVEL e removerá:\n` +
      `• Todos os vínculos com turmas\n` +
      `• Todas as notas relacionadas\n` +
      `• Todas as frequências registradas\n\n` +
      `Clique em OK para confirmar ou Cancelar para desistir.`
    );
    
    if (!confirmacao) return;
    
    try {
      setExcluindo(disciplinaId);
      const resultado = await excluirDisciplinaAction(disciplinaId);
      
      if (resultado.success) {
        setDisciplinas(disciplinas.filter(d => d.iddisciplina !== disciplinaId));
        alert(`✅ Disciplina "${nomeDisciplina}" excluída com sucesso!`);
      } else {
        alert(`❌ Erro ao excluir disciplina: ${resultado.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
      alert('❌ Erro ao excluir disciplina. Tente novamente.');
    } finally {
      setExcluindo(null);
    }
  };

  const professoresUnicos = [...new Set(
    disciplinas
      .map(d => d.professor?.nome)
      .filter((nome): nome is string => !!nome)
  )];
  
  const filteredDisciplinas = disciplinas.filter(disciplina => {
    const porBusca = busca === '' ||
                     disciplina.nome_disciplina.toLowerCase().includes(busca.toLowerCase()) ||
                     disciplina.professor?.nome?.toLowerCase().includes(busca.toLowerCase() || '');
    
    const porProfessor = professorSel === 'todos' || 
                        disciplina.professor?.nome === professorSel;
    
    return porBusca && porProfessor;
  });

  if (loading) return <div className={styles.container}><p>Carregando disciplinas...</p></div>;

  return (
    <div className={styles.container}>
      <Link href="/diretor/dashboard" className={styles.backButton}>
        &larr; Voltar ao Dashboard
      </Link>

      <h1 className={styles.title}>Gerenciar Disciplinas</h1>

      <div className={styles.filterBar}>
        <div style={{ flex: 2 }}>
          <label htmlFor="busca">Buscar por Nome ou Professor:</label>
          <input 
            type="text" 
            id="busca"
            placeholder="Digite nome da disciplina ou professor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label htmlFor="filtroProfessor">Filtrar por Professor:</label>
          <select 
            id="filtroProfessor" 
            value={professorSel} 
            onChange={(e) => setProfessorSel(e.target.value)}
          >
            <option value="todos">Todos os Professores</option>
            {professoresUnicos.map(prof => (
              <option key={prof} value={prof}>{prof}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Disciplina</th>
              <th>Professor</th>
              <th>Turmas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredDisciplinas.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                  {disciplinas.length === 0 ? 'Nenhuma disciplina cadastrada' : 'Nenhuma disciplina encontrada com esses filtros'}
                </td>
              </tr>
            ) : (
              filteredDisciplinas.map((disciplina) => (
                <tr key={disciplina.iddisciplina}>
                  <td><strong>{disciplina.nome_disciplina}</strong></td>
                  <td>{disciplina.professor?.nome || 'Sem professor'}</td>
                  <td>
                    {disciplina.turmas && disciplina.turmas.length > 0 ? (
                      <div className={styles.turmasList}>
                        {disciplina.turmas.slice(0, 2).map((t, index) => (
                          <span key={index} className={styles.turmaTag}>
                            {t.turma.nome_turma || `Turma ${t.turma.idturma}`}
                          </span>
                        ))}
                        {disciplina.turmas.length > 2 && (
                          <span className={styles.moreTurmas}>
                            +{disciplina.turmas.length - 2} mais
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={styles.semTurmas}>Sem turmas</span>
                    )}
                  </td>
                  <td className={styles.actions}>
                    <button 
                      onClick={() => handleExcluir(disciplina.iddisciplina, disciplina.nome_disciplina)} 
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      disabled={excluindo === disciplina.iddisciplina}
                      title="Excluir disciplina"
                    >
                      {excluindo === disciplina.iddisciplina ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666', textAlign: 'right' }}>
        Total de disciplinas: {disciplinas.length} | Mostrando: {filteredDisciplinas.length}
      </div>
    </div>
  );
}
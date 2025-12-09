"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './GerenciarTurmas.module.css';
import { listarTurmasParaDiretorAction } from '@/lib/actions/diretoria';

interface Turma {
  id: number;
  nome: string;
  serie: string;
  turno: string;
  professorNome: string;
  totalAlunos: number;
  anoLetivo: number;
}

export default function GerenciarTurmasDiretor() {
  const router = useRouter();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [serieSel, setSerieSel] = useState('todas');
  const [turnoSel, setTurnoSel] = useState('todos');
  const [anoSel, setAnoSel] = useState('todos');

  // Carregar turmas do banco
  useEffect(() => {
    carregarTurmas();
  }, []);

  async function carregarTurmas() {
    try {
      setLoading(true);
      const res = await listarTurmasParaDiretorAction();
      
      if (res.success && res.data) {
        // Formatar os dados (remover campos desnecessários)
        const turmasFormatadas: Turma[] = res.data.map(turma => ({
          id: turma.id,
          nome: turma.nome || "Turma sem nome",
          serie: turma.serie || "Não informado",
          turno: turma.turno || "Não informado",
          professorNome: turma.professorNome || "Sem professor",
          totalAlunos: turma.totalAlunos || 0,
          anoLetivo: turma.anoLetivo || new Date().getFullYear()
        }));
        
        setTurmas(turmasFormatadas);
      } else {
        console.error('Erro ao carregar turmas:', res.error);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  // Função para editar turma (agora redireciona para o secretário, pois o diretor não edita diretamente)
  const handleEditarTurma = (turmaId: number) => {
    // Redireciona para a página de edição da secretaria
    router.push(`/secretaria/turmas/editar/${turmaId}`);
  };

  // Função para visualizar detalhes da turma
  const handleVerDetalhes = (turmaId: number) => {
    // Redireciona para uma página de detalhes no diretor
    router.push(`/diretor/turmas/${turmaId}`);
  };

  // Filtros
  const filteredTurmas = turmas.filter(turma => {
    const porSerie = serieSel === 'todas' || turma.serie === serieSel;
    const porTurno = turnoSel === 'todos' || turma.turno === turnoSel;
    const porAno = anoSel === 'todos' || turma.anoLetivo.toString() === anoSel;
    
    return porSerie && porTurno && porAno;
  });

  // Extrair valores únicos para filtros
  const seriesUnicas = [...new Set(turmas.map(t => t.serie))].filter(Boolean).sort();
  const turnosUnicos = [...new Set(turmas.map(t => t.turno))].filter(Boolean).sort();
  const anosUnicos = [...new Set(turmas.map(t => t.anoLetivo.toString()))].filter(Boolean).sort((a, b) => b.localeCompare(a));

  if (loading) return <div className={styles.container}><p>Carregando turmas...</p></div>;

  return (
    <div className={styles.container}>
      <Link href="/diretor/dashboard" className={styles.backButton}>
        &larr; Voltar ao Dashboard
      </Link>

      <h1 className={styles.title}>Gerenciar Turmas</h1>

      {/* Filtros */}
      <div className={styles.filterBar}>
        <div>
          <label htmlFor="filtroSerie">Filtrar por Série/Ano:</label>
          <select id="filtroSerie" value={serieSel} onChange={(e) => setSerieSel(e.target.value)}>
            <option value="todas">Todas as Séries</option>
            {seriesUnicas.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filtroTurno">Filtrar por Turno:</label>
          <select id="filtroTurno" value={turnoSel} onChange={(e) => setTurnoSel(e.target.value)}>
            <option value="todos">Todos os Turnos</option>
            {turnosUnicos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filtroAno">Filtrar por Ano Letivo:</label>
          <select id="filtroAno" value={anoSel} onChange={(e) => setAnoSel(e.target.value)}>
            <option value="todos">Todos os Anos</option>
            {anosUnicos.map(ano => <option key={ano} value={ano}>{ano}</option>)}
          </select>
        </div>
      </div>

      {/* Tabela de Turmas */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Turma</th>
              <th>Série/Ano</th>
              <th>Turno</th>
              <th>Ano Letivo</th>
              <th>Professor</th>
              <th>Alunos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTurmas.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                  {turmas.length === 0 ? 'Nenhuma turma cadastrada' : 'Nenhuma turma encontrada com esses filtros'}
                </td>
              </tr>
            ) : (
              filteredTurmas.map((turma) => (
                <tr key={turma.id}>
                  <td><strong>{turma.nome}</strong></td>
                  <td>{turma.serie}</td>
                  <td>{turma.turno}</td>
                  <td>{turma.anoLetivo}</td>
                  <td>{turma.professorNome}</td>
                  <td>
                    <div className={styles.alunosInfo}>
                      <span className={styles.alunoCount}>
                        {turma.totalAlunos}
                      </span>
                      <span className={styles.alunoLabel}>
                        aluno{turma.totalAlunos !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className={styles.actions}>
                    <button 
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() => handleEditarTurma(turma.id)}
                      title="Editar turma (Secretaria)"
                    >
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666', textAlign: 'right' }}>
        Total de turmas: {turmas.length} | Mostrando: {filteredTurmas.length}
      </div>
    </div>
  );
}

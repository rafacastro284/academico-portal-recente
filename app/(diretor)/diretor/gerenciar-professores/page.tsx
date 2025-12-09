"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './GerenciarProfessores.module.css';
import { listarProfessoresComDisciplinasAction } from '@/lib/actions/diretoria';

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
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [disciplinaSel, setDisciplinaSel] = useState('todas');
  const [busca, setBusca] = useState('');

  // Carregar professores do banco de dados
  useEffect(() => {
    async function carregarProfessores() {
      try {
        setLoading(true);
        
        const response = await listarProfessoresComDisciplinasAction();
        
        if (response.success && response.data) {
          // Formatar os dados corretamente
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
    
    carregarProfessores();
  }, []);

  // Filtros
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

  // Extrair disciplinas únicas
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
      
      {/* Filtros */}
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
        <div>
          <label htmlFor="busca">Buscar por Nome, CPF, Matrícula ou Disciplina:</label>
          <input 
            type="text" 
            id="busca"
            placeholder="Digite para buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Professores */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Professor</th>
              <th>CPF</th>
              <th>Disciplinas</th>
              <th>Turmas</th>
              <th>Status</th>
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
                    ) : (
                      <span className={styles.semDisciplinas}>Sem disciplinas</span>
                    )}
                    <div className={styles.totalBadge}>
                      {prof.totalDisciplinas} disciplina{prof.totalDisciplinas !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td>
                    {prof.turmas.length > 0 ? (
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
                    ) : (
                      <span className={styles.semTurmas}>Sem turmas</span>
                    )}
                    <div className={styles.totalBadge}>
                      {prof.totalTurmas} turma{prof.totalTurmas !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.tag} ${styles.tagAtivo}`}>
                      Ativo
                    </span>
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

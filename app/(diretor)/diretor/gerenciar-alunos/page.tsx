"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./GerenciarAlunos.module.css";
// Importamos as Actions reais
import { listarAlunosComTurmaEAcoesAction } from "@/lib/actions/diretoria";

interface AlunoComFrequencia {
  id: number;
  nome: string;
  matricula: string;
  serie: string;
  turma: string;
  status: string;
  frequenciaMedia: number;
  totalPresencas: number;
  totalFaltas: number;
}

export default function GerenciarAlunosDiretor() {
  const [alunos, setAlunos] = useState<AlunoComFrequencia[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para Filtros
  const [serieSel, setSerieSel] = useState("todas");
  const [turmaSel, setTurmaSel] = useState("todas");
  const [busca, setBusca] = useState("");
  const [frequenciaMin, setFrequenciaMin] = useState("0");

  // Estados para preencher os <select> dinamicamente
  const [opcoesTurmas, setOpcoesTurmas] = useState<string[]>([]);
  const [opcoesSeries, setOpcoesSeries] = useState<string[]>([]);

  // Carregar dados reais
  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        
        // Busca Alunos com frequência
        const resAlunos = await listarAlunosComTurmaEAcoesAction();
        
        if (resAlunos.success && resAlunos.data) {
          setAlunos(resAlunos.data.alunos || []);
          
          // Extrair turmas e séries únicas
          const turmasUnicas = Array.from(new Set(resAlunos.data.alunos.map(a => a.turma))).filter(Boolean);
          const seriesUnicas = Array.from(new Set(resAlunos.data.alunos.map(a => a.serie))).filter(Boolean);
          
          setOpcoesTurmas(turmasUnicas.sort());
          setOpcoesSeries(seriesUnicas.sort());
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  // Lógica de Filtragem
  const filteredAlunos = alunos
    .filter((aluno) => {
      const porSerie = serieSel === "todas" || aluno.serie === serieSel;
      const porTurma = turmaSel === "todas" || aluno.turma === turmaSel;
      const termo = busca.toLowerCase();
      const porBusca =
        busca === "" ||
        aluno.nome.toLowerCase().includes(termo) ||
        aluno.matricula.toLowerCase().includes(termo);
      
      const frequenciaMinNum = parseInt(frequenciaMin) || 0;
      const porFrequencia = aluno.frequenciaMedia >= frequenciaMinNum;

      return porSerie && porTurma && porBusca && porFrequencia;
    });

  const getFrequenciaColor = (frequencia: number) => {
    if (frequencia >= 90) return '#10b981'; // Verde
    if (frequencia >= 75) return '#f59e0b'; // Amarelo/Laranja
    return '#ef4444'; // Vermelho
  };

  if (loading) return <div className={styles.container}><p>Carregando lista de alunos...</p></div>;

  return (
    <div className={styles.container}>
      <Link href="/diretor/dashboard" className={styles.backButton}>
        &larr; Voltar ao Dashboard
      </Link>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 className={styles.title}>Gerenciar Alunos</h1>
      </div>

      {/* Filtros */}
      <div className={styles.filterBar}>
        
        {/* Filtro Série */}
        <div className={styles.filterGroup}>
          <label htmlFor="filtroSerie">Filtrar por Série:</label>
          <select
            id="filtroSerie"
            value={serieSel}
            onChange={(e) => setSerieSel(e.target.value)}
          >
            <option value="todas">Todas as Séries</option>
            {opcoesSeries.map((serie) => (
              <option key={serie} value={serie}>{serie}</option>
            ))}
            <option value="-">Sem Série</option>
          </select>
        </div>

        {/* Busca Texto */}
        <div className={styles.filterGroup} style={{ flex: 2 }}>
          <label htmlFor="busca">Buscar por Nome ou Matrícula:</label>
          <input
            type="text"
            id="busca"
            placeholder="Digite nome ou matrícula..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Matrícula</th>
              <th>Série</th>
              <th>Turma</th>
              <th>Frequência Média</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredAlunos.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                  Nenhum aluno encontrado com esses filtros.
                </td>
              </tr>
            ) : (
              filteredAlunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td><strong>{aluno.nome}</strong></td>
                  <td>{aluno.matricula}</td>
                  <td>{aluno.serie}</td>
                  <td>{aluno.turma}</td>
                  <td>
                    <div className={styles.frequenciaContainer}>
                      <div className={styles.frequenciaBar}>
                        <div 
                          className={styles.frequenciaFill}
                          style={{
                            width: `${aluno.frequenciaMedia}%`,
                            backgroundColor: getFrequenciaColor(aluno.frequenciaMedia)
                          }}
                        ></div>
                      </div>
                      <span className={styles.frequenciaText}>
                        {aluno.frequenciaMedia.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.tag} ${
                        aluno.status === "Cursando"
                          ? styles.tagAtivo
                          : styles.tagInativo
                      }`}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        backgroundColor: aluno.status === "Cursando" ? '#dcfce7' : '#fee2e2',
                        color: aluno.status === "Cursando" ? '#166534' : '#991b1b',
                        fontWeight: 'bold'
                      }}
                    >
                      {aluno.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./GerenciarAlunos.module.css";
import { listarAlunosComTurmaAction, listarTurmasAction } from "@/lib/actions/secretaria";

interface AlunoFormatado {
  id: number;
  nome: string;
  matricula: string;
  serie: string;
  turma: string;
  status: string;
}

export default function GerenciarAlunos() {
  const [alunos, setAlunos] = useState<AlunoFormatado[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para Filtros
  const [serieSel, setSerieSel] = useState("todas");
  const [turmaSel, setTurmaSel] = useState("todas");
  const [busca, setBusca] = useState("");

  // Estados para preencher os <select> dinamicamente
  const [opcoesTurmas, setOpcoesTurmas] = useState<string[]>([]);
  const [opcoesSeries, setOpcoesSeries] = useState<string[]>([]);

  // Carregar dados reais
  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        
        // 1. Busca Alunos
        const resAlunos = await listarAlunosComTurmaAction();
        
        // 2. Busca Turmas (para o filtro)
        const resTurmas = await listarTurmasAction();

        if (resAlunos.success && resAlunos.data) {
          setAlunos(resAlunos.data);
        }

        if (resTurmas.success && resTurmas.data) {
          // Extrai nomes de turmas únicos e séries únicas para os filtros
          const nomesTurmas = Array.from(
            new Set(resTurmas.data.map(t => t.nome || ""))
          ).filter(Boolean);
          
          const nomesSeries = Array.from(
            new Set(resTurmas.data.map(t => t.serie || ""))
          ).filter(Boolean);
          
          setOpcoesTurmas(nomesTurmas.sort());
          setOpcoesSeries(nomesSeries.sort());
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  // Lógica de Filtragem (Client-side)
  const filteredAlunos = alunos
    .filter((aluno) => {
      const porSerie = serieSel === "todas" || aluno.serie === serieSel;
      const porTurma = turmaSel === "todas" || aluno.turma === turmaSel;
      const termo = busca.toLowerCase();
      const porBusca =
        busca === "" ||
        aluno.nome.toLowerCase().includes(termo) ||
        aluno.matricula.toLowerCase().includes(termo);

      return porSerie && porTurma && porBusca;
    });

  if (loading) return <div className={styles.container}><p>Carregando lista de alunos...</p></div>;

  return (
    <div className={styles.container}>
      <Link href="/secretaria/dashboard" className={styles.backButton}>
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
            <option value="-">Sem Série (Não Matriculado)</option>
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
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredAlunos.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
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
      
      <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666', textAlign: 'right' }}>
        Total de alunos listados: {filteredAlunos.length}
      </div>
    </div>
  );
}
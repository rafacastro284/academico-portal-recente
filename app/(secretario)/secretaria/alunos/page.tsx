"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./GerenciarAlunos.module.css";

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  serie: string;
  turma: string;
  status: string;
}

const seriesOptions = ["8º Ano", "9º Ano", "1º Ano"];
const turmasOptions = ["8º Ano A", "8º Ano B", "9º Ano A", "9º Ano B"];

export default function GerenciarAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  const [serieSel, setSerieSel] = useState("todas");
  const [turmaSel, setTurmaSel] = useState("todas");
  const [busca, setBusca] = useState("");

  // 🔥 Buscar do banco via API real
  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/alunos");
        const data = await res.json();
        setAlunos(data);
      } catch (error) {
        console.error("Erro ao carregar alunos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  const filteredAlunos = alunos
    .filter((aluno) => {
      const porSerie = serieSel === "todas" || aluno.serie === serieSel;
      const porTurma = turmaSel === "todas" || aluno.turma === turmaSel;
      const porBusca =
        busca === "" ||
        aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
        aluno.matricula.includes(busca);

      return porSerie && porTurma && porBusca;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  if (loading) return <p style={{ padding: "20px" }}>Carregando alunos...</p>;

  return (
    <div className={styles.container}>
      <Link href="/secretaria/dashboard" className={styles.backButton}>
        &larr; Voltar ao Dashboard
      </Link>

      <h1 className={styles.title}>Gerenciar Alunos</h1>

      {/* Filtros */}
      <div className={styles.filterBar}>
        <div>
          <label htmlFor="filtroSerie">Filtrar por Série/Ano:</label>
          <select
            id="filtroSerie"
            value={serieSel}
            onChange={(e) => setSerieSel(e.target.value)}
          >
            <option value="todas">Todas as Séries</option>
            {seriesOptions.map((serie) => (
              <option key={serie} value={serie}>
                {serie}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtroTurma">Filtrar por Turma:</label>
          <select
            id="filtroTurma"
            value={turmaSel}
            onChange={(e) => setTurmaSel(e.target.value)}
          >
            <option value="todas">Todas as Turmas</option>
            {turmasOptions.map((turma) => (
              <option key={turma} value={turma}>
                {turma}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="busca">Buscar por Nome ou Matrícula:</label>
          <input
            type="text"
            id="busca"
            placeholder="Digite o nome ou matrícula..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
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
              <th>Série/Ano</th>
              <th>Turma</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredAlunos.map((aluno) => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
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
                  >
                    {aluno.status}
                  </span>
                </td>
                <td>
                  <span style={{ color: "#aaa" }}>-</span>
                </td>
              </tr>
            ))}

            {filteredAlunos.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  Nenhum aluno encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./CadastrarDisciplina.module.css";

export default function CadastrarDisciplina() {
  const [nome, setNome] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState(0);
  const [serieId, setSerieId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [professores, setProfessores] = useState([]);

  // Carregar professores do banco
  useEffect(() => {
    async function loadProfessores() {
      const res = await fetch("/api/professores");
      const data = await res.json();
      setProfessores(data);
    }
    loadProfessores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch("/api/disciplina", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome_disciplina: nome,
        idprofessor: professorId,
        carga_horaria: cargaHoraria,
      }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setMessage(data.error);
      return;
    }

    setMessage("Disciplina cadastrada com sucesso!");
    setNome("");
    setProfessorId("");
    setCargaHoraria(0);
    setSerieId("");

    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className={styles.container}>
      <Link href="/diretor/dashboard" className={styles.backButton}>
        &larr; Voltar para Visão Geral
      </Link>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Cadastrar Nova Disciplina</h1>

        {/* Nome da Disciplina */}
        <div className={styles.inputGroup}>
          <label htmlFor="nome">Nome da Disciplina</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Matemática"
            required
          />
        </div>

        {/* Professor Responsável */}
        <div className={styles.inputGroup}>
          <label htmlFor="professor">Professor Responsável</label>
          <select
            id="professor"
            value={professorId}
            onChange={(e) => setProfessorId(e.target.value)}
            required
          >
            <option value="" disabled>
              Selecione um professor
            </option>

            {professores.length === 0 && (
              <option disabled>Nenhum professor encontrado</option>
            )}

            {professores.map((prof: any) => (
              <option key={prof.idusuario} value={prof.idusuario}>
                {prof.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Carga Horária */}
        <div className={styles.inputGroup}>
          <label htmlFor="cargaHoraria">Carga Horária (horas)</label>
          <input
            type="number"
            id="cargaHoraria"
            value={cargaHoraria}
            onChange={(e) => setCargaHoraria(Number(e.target.value))}
            min="0"
            required
          />
        </div>

        {/* Série (ainda não está no banco) */}
        <div className={styles.inputGroup}>
          <label htmlFor="serie">Série/Ano</label>
          <select id="serie" value={serieId} onChange={(e) => setSerieId(e.target.value)}>
            <option value=""></option>
            <option value="6ano">6º Ano</option>
            <option value="1em">1º Ano Médio</option>
          </select>
        </div>

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Disciplina"}
        </button>

        {message && <p className={styles.successMessage}>{message}</p>}
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./CadastrarDisciplina.module.css";

export default function CadastrarDisciplina() {
  const [nome, setNome] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [serieId, setSerieId] = useState("");

  const [professores, setProfessores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "erro"|"sucesso"|""; texto:string }>({tipo:"", texto:""});

  // ──────────────────────────────── 🔹 Carregar Professores
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/professores");
        const data = await res.json();
        setProfessores(data);
      } catch {
        setMensagem({tipo:"erro", texto:"Erro ao carregar professores."});
      }
    }
    load();
  }, []);

  // ──────────────────────────────── 🔹 Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !professorId || !cargaHoraria) {
      setMensagem({tipo:"erro", texto:"Preencha todos os campos obrigatórios!"});
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/disciplina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_disciplina: nome,
          idprofessor: Number(professorId),
          carga_horaria: Number(cargaHoraria),
          serie: serieId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensagem({tipo:"erro", texto: data.error || "Erro ao salvar disciplina."});
      } else {
        setMensagem({tipo:"sucesso", texto:"Disciplina cadastrada com sucesso!"});

        // limpar
        setNome("");
        setProfessorId("");
        setCargaHoraria("");
        setSerieId("");

        setTimeout(()=> setMensagem({tipo:"", texto:""}), 3000);
      }
    } catch {
      setMensagem({tipo:"erro", texto: "Falha ao conectar com o servidor."});
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <Link href="/diretor/dashboard" className={styles.backButton}>← Voltar</Link>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Cadastrar Disciplina</h1>

        {mensagem.texto && (
          <p className={mensagem.tipo === "erro" ? styles.errorMessage : styles.successMessage}>
            {mensagem.texto}
          </p>
        )}

        {/* Nome da Disciplina */}
        <div className={styles.inputGroup}>
          <label>Nome da Disciplina *</label>
          <input
            type="text"
            placeholder="Ex: Matemática"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
        </div>

        {/* Professor */}
        <div className={styles.inputGroup}>
          <label>Professor Responsável *</label>
          <select value={professorId} onChange={e => setProfessorId(e.target.value)} required>
            <option value="">Selecione um professor</option>
            {professores.length === 0 && <option disabled>Carregando...</option>}
            {professores.map((p) => (
              <option key={p.idusuario} value={p.idusuario}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Carga Horária */}
        <div className={styles.inputGroup}>
          <label>Carga Horária (horas) *</label>
          <input
            type="number"
            min="1"
            placeholder="Ex: 40"
            value={cargaHoraria}
            onChange={e => setCargaHoraria(e.target.value)}
            required
          />
        </div>

        {/* Série opcional */}
        <div className={styles.inputGroup}>
          <label>Série / Ano (opcional)</label>
          <select value={serieId} onChange={e => setSerieId(e.target.value)}>
            <option value="">Nenhum</option>
            <option value="6ano">6º Ano</option>
            <option value="7ano">7º Ano</option>
            <option value="8ano">8º Ano</option>
            <option value="9ano">9º Ano</option>
            <option value="1em">1º EM</option>
            <option value="2em">2º EM</option>
            <option value="3em">3º EM</option>
          </select>
        </div>

        <button className={styles.submitButton} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}

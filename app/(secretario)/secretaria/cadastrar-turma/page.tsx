"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./CadastrarTurma.module.css";
import { diretorData } from "../../../lib/mockData";

const mockProfessores = diretorData.corpoDocente;
const mockSeries = [
  "6º Ano - Ens. Fundamental",
  "7º Ano - Ens. Fundamental",
  "8º Ano - Ens. Fundamental",
  "9º Ano - Ens. Fundamental",
  "1º Ano - Ens. Médio",
  "2º Ano - Ens. Médio",
  "3º Ano - Ens. Médio",
];

export default function CadastrarTurma() {
  const router = useRouter();

  const [nomeTurma, setNomeTurma] = useState("");
  const [serie, setSerie] = useState("");
  const [turno, setTurno] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear().toString());
  const [limiteVagas, setLimiteVagas] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeTurma.trim()) return setMessage("Informe o nome da turma.");
    if (!serie) return setMessage("Selecione a série.");
    if (!turno) return setMessage("Selecione o turno.");
    if (!anoLetivo || Number(anoLetivo) <= 0) return setMessage("Informe ano letivo válido.");
    if (limiteVagas === "" || Number(limiteVagas) < 0) return setMessage("Informe limite de vagas (>= 0).");

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        nome_turma: nomeTurma.trim(),
        serie,
        turno,
        professorId: professorId || null,
        ano_letivo: Number(anoLetivo),
        limite_vagas: Number(limiteVagas),
      };

      const res = await fetch("/api/turmas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Erro ao salvar turma.");
      } else {
        setMessage("Turma criada com sucesso!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erro de rede ao salvar turma.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/secretaria/dashboard" className={styles.backButton}>
        &larr; Voltar ao Dashboard
      </Link>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Cadastrar Nova Turma</h1>

        <div className={styles.inputGroup}>
          <label htmlFor="nomeTurma">Nome da Turma</label>
          <input id="nomeTurma" value={nomeTurma} onChange={(e) => setNomeTurma(e.target.value)} required />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="serie">Série/Ano</label>
          <select id="serie" value={serie} onChange={(e) => setSerie(e.target.value)} required>
            <option value="" disabled>Selecione a série</option>
            {mockSeries.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="turno">Turno</label>
          <select id="turno" value={turno} onChange={(e) => setTurno(e.target.value)} required>
            <option value="" disabled>Selecione o turno</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="professor">Professor Responsável (opcional)</label>
          <select id="professor" value={professorId} onChange={(e) => setProfessorId(e.target.value)}>
            <option value="">Selecione (opcional)</option>
            {mockProfessores.map((prof) => (
              <option key={prof.id} value={prof.id}>{prof.nome} ({prof.disciplina})</option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="anoLetivo">Ano Letivo</label>
          <input id="anoLetivo" type="number" value={anoLetivo} onChange={(e) => setAnoLetivo(e.target.value)} required />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="limiteVagas">Limite de Vagas</label>
          <input id="limiteVagas" type="number" min={0} value={limiteVagas === "" ? "" : String(limiteVagas)} onChange={(e) => setLimiteVagas(e.target.value === "" ? "" : Number(e.target.value))} required />
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Salvando..." : "Salvar Turma"}
        </button>

        {message && <p className={styles.successMessage}>{message}</p>}
      </form>
    </div>
  );
}

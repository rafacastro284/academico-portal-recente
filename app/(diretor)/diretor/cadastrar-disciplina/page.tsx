"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./CadastrarDisciplina.module.css";
import {
  listarProfessoresAction,
  listarTurmasAction, 
  cadastrarDisciplinaComVinculoAction,  
} from '@/lib/actions'; // Verifique o caminho se ele mudou para '@/lib/actions'

export default function CadastrarDisciplina() {
  const [nome, setNome] = useState("");
  const [professorId, setProfessorId] = useState<string>(""); 
  const [cargaHoraria, setCargaHoraria] = useState<number>(0);
  const [turmaId, setTurmaId] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [professores, setProfessores] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]); 

// --- Em CadastrarDisciplina.tsx > useEffect ---
// --- Em CadastrarDisciplina.tsx (Bloco useEffect completo) ---
useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        setMessage("Carregando dados necessários...");
        let successCount = 0;

        // 1. CARREGAR PROFESSORES
        const profRes = await listarProfessoresAction(); 
        if (profRes.success && profRes.data) {
            setProfessores(profRes.data);
            console.log("Professores carregados com sucesso. Total:", profRes.data.length); 
            successCount++;
        } else {
            // Se falhar, defina a mensagem para o usuário
            setMessage(`❌ Erro ao carregar professores: ${profRes.error}`); 
            console.error("ERRO FRONTEND: Falha na Action listarProfessores:", profRes.error); 
        }

        // 2. CARREGAR TURMAS
        const turmaRes = await listarTurmasAction();
        if (turmaRes.success && turmaRes.data) {
            setTurmas(turmaRes.data);
            console.log("Turmas carregadas com sucesso. Total:", turmaRes.data.length); 
            successCount++;
        } else {
            // Se falhar, defina a mensagem para o usuário
            setMessage(`❌ Erro ao carregar turmas: ${turmaRes.error}`); 
            console.error("ERRO FRONTEND: Falha na Action listarTurmas:", turmaRes.error); 
        }
        
        setIsLoading(false);
        if (successCount === 2) {
             setMessage(""); // Limpa mensagem se ambos carregaram
        }
    }
    loadData();
}, []); // O array de dependências vazio garante que roda apenas uma vez
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validação de inputs
    if (!turmaId || !professorId || !nome || cargaHoraria <= 0) {
        setIsLoading(false);
        setMessage("❌ Erro: Preencha todos os campos obrigatórios (Turma, Professor, Nome e Carga Horária).");
        return;
    }
    
    // MUDANÇA: Chamada da Action Transacional Única
    const res = await cadastrarDisciplinaComVinculoAction({
      nome_disciplina: nome,
      idprofessor: Number(professorId), 
      carga_horaria: cargaHoraria,
      turmaId: Number(turmaId)
    });

    if (!res.success) {
      setIsLoading(false);
      setMessage(`❌ Erro no cadastro e vínculo: ${res.error}`);
      return;
    }
    
    // Sucesso
    setMessage("✅ Disciplina cadastrada e vinculada à turma com sucesso!");

    // Limpar o formulário
    setNome("");
    setProfessorId("");
    setCargaHoraria(0);
    setTurmaId(""); 

    setIsLoading(false);
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
            disabled={isLoading}
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
            disabled={isLoading || professores.length === 0}
          >
            <option value="" disabled>Selecione um professor</option>
            {professores.map((prof) => (
              <option key={prof.idusuario} value={String(prof.idusuario)}> 
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
            min="1"
            required
            disabled={isLoading}
          />
        </div>

        {/* Turma (AGORA OBRIGATÓRIO) */}
        <div className={styles.inputGroup}>
          <label htmlFor="turma">Vincular à Turma</label>
          <select 
            id="turma" 
            value={turmaId} 
            onChange={(e) => setTurmaId(e.target.value)}
            required
            disabled={isLoading || turmas.length === 0}
          >
            <option value="" disabled>
              {turmas.length === 0 ? "Carregando turmas..." : "Selecione a turma"}
            </option>
            {turmas.map((turma) => (
                <option key={turma.idturma} value={String(turma.idturma)}>
                    {turma.nome_turma} ({turma.serie})
                </option>
            ))}
          </select>
        </div>

        <button type="submit" className={styles.submitButton} disabled={isLoading || turmas.length === 0 || !professorId || !nome || cargaHoraria <= 0}>
          {isLoading ? "Salvando..." : "Salvar e Vincular Disciplina"}
        </button>

        {message && <p className={message.includes('Erro') ? styles.errorMessage : styles.successMessage}>{message}</p>}
      </form>
    </div>
  );
}
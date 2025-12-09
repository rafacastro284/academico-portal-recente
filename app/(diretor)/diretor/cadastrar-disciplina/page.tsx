"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./CadastrarDisciplina.module.css";
import { 
  listarProfessoresAction, 
  cadastrarDisciplinaComVinculoAction 
} from '@/lib/actions/diretoria';

import { 
  listarTurmasAction 
} from '@/lib/actions/secretaria';

export default function CadastrarDisciplina() {
  const [nome, setNome] = useState("");
  const [professorId, setProfessorId] = useState<string>(""); 
  const [turmaId, setTurmaId] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [professores, setProfessores] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]); 

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setMessage("Carregando dados necessários...");
      setIsError(false);
      
      try {
        // Carregar professores
        const profRes = await listarProfessoresAction(); 
        if (profRes.success && profRes.data) {
          setProfessores(profRes.data);
        } else {
          setIsError(true);
          setMessage(`❌ Erro ao carregar professores: ${profRes.error}`); 
          return;
        }

        // Carregar turmas
        const turmaRes = await listarTurmasAction();
        if (turmaRes.success && turmaRes.data) {
          setTurmas(turmaRes.data);
        } else {
          setIsError(true);
          setMessage(`❌ Erro ao carregar turmas: ${turmaRes.error}`); 
          return;
        }
        
        setMessage(""); // Limpar mensagem se tudo carregou
      } catch (error) {
        setIsError(true);
        setMessage("❌ Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    // Validação
    if (!nome.trim()) {
      setIsLoading(false);
      setIsError(true);
      setMessage("❌ Erro: Digite o nome da disciplina.");
      return;
    }
    
    if (!professorId) {
      setIsLoading(false);
      setIsError(true);
      setMessage("❌ Erro: Selecione um professor.");
      return;
    }
    
    if (!turmaId) {
      setIsLoading(false);
      setIsError(true);
      setMessage("❌ Erro: Selecione uma turma.");
      return;
    }
    
    // Converter IDs
    const professorIdNum = parseInt(professorId);
    const turmaIdNum = parseInt(turmaId);
    
    if (isNaN(professorIdNum) || isNaN(turmaIdNum)) {
      setIsLoading(false);
      setIsError(true);
      setMessage("❌ Erro: IDs inválidos.");
      return;
    }
    
    try {
      const res = await cadastrarDisciplinaComVinculoAction({
        nome_disciplina: nome.trim(),
        idprofessor: professorIdNum,
        turmaId: turmaIdNum
      });

      if (!res.success) {
        setIsLoading(false);
        setIsError(true);
        setMessage(`❌ Erro: ${res.error}`);
        return;
      }
      
      // Sucesso
      setIsError(false);
      setMessage("✅ Disciplina cadastrada e vinculada à turma com sucesso!");

      // Limpar formulário
      setNome("");
      setProfessorId("");
      setTurmaId("");

      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = "/diretor/dashboard";
      }, 2000);
      
    } catch (error: any) {
      setIsLoading(false);
      setIsError(true);
      setMessage(`❌ Erro ao enviar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
          <label htmlFor="nome">Nome da Disciplina *</label>
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
          <label htmlFor="professor">Professor Responsável *</label>
          <select
            id="professor"
            value={professorId}
            onChange={(e) => setProfessorId(e.target.value)}
            required
            disabled={isLoading || professores.length === 0}
          >
            <option value="">Selecione um professor</option>
            {professores.map((prof) => (
              <option key={prof.idusuario} value={prof.idusuario.toString()}> 
                {prof.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Turma */}
        <div className={styles.inputGroup}>
          <label htmlFor="turma">Vincular à Turma *</label>
          <select 
            id="turma" 
            value={turmaId} 
            onChange={(e) => setTurmaId(e.target.value)}
            required
            disabled={isLoading || turmas.length === 0}
          >
            <option value="">Selecione a turma</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id.toString()}>
                {turma.nome} ({turma.serie}) - {turma.turno}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          className={styles.submitButton} 
          disabled={isLoading || !nome.trim() || !professorId || !turmaId}
        >
          {isLoading ? "Salvando..." : "Salvar e Vincular Disciplina"}
        </button>

        {message && (
          <p className={isError ? styles.errorMessage : styles.successMessage}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

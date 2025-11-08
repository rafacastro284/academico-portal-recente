'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import styles from './Cadastro.module.css';

const disciplinasEscolar = [
  'Matemática', 'Português', 'História', 'Geografia', 
  'Física', 'Química', 'Biologia', 'Inglês', 'Educação Física', 'Artes'
];

export default function CadastrarUsuario() {
  const [userType, setUserType] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');

  // Campos de Aluno
  const [matricula, setMatricula] = useState('');
  const [turma, setTurma] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  
  // --- NOVOS ESTADOS PARA PROFESSOR ---
  const [disciplina, setDisciplina] = useState('');
  const [formacaoAcademica, setFormacaoAcademica] = useState('');
  // ------------------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lógica para coletar os dados
    let dadosUsuario: any = { userType, nome, cpf, email };

    if (userType === 'ALUNO') {
      dadosUsuario = {
        ...dadosUsuario,
        matricula,
        turma,
        dataNascimento,
      };
    } 
    // --- LÓGICA PARA PROFESSOR ---
    else if (userType === 'PROFESSOR') {
      dadosUsuario = {
        ...dadosUsuario,
        disciplina,
        formacaoAcademica,
      };
    }
    // ----------------------------

    //Adicionar aq a lógica para enviar os dados
    console.log(dadosUsuario);
    alert('Usuário cadastrado (ver console)!');
  };

  return (
    <div className={styles.container}>
      <Link href="/admin/dashboard" className={styles.backButton}>
        &larr; Voltar à página principal
      </Link>
      
      <h1 className={styles.title}>Cadastrar Novo Usuário</h1>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* --- Campos Comuns --- */}
          <div className={styles.formGroup}>
            <label htmlFor="userType">Tipo de Usuário *</label>
            <select 
              id="userType" 
              value={userType} 
              onChange={(e) => setUserType(e.target.value)}
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="ALUNO">Aluno</option>
              <option value="PROFESSOR">Professor</option>
              <option value="SECRETARIO">Secretário</option>
              <option value="DIRETOR">Diretor</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome Completo *</label>
            <input 
              type="text" 
              id="nome" 
              placeholder="Ex: Maria Silva Oliveira"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF *</label>
            <input 
              type="text" 
              id="cpf" 
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail *</label>
            <input 
              type="email" 
              id="email" 
              placeholder="usuario@escola.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* --- CAMPOS CONDICIONAIS PARA ALUNO --- */}
          {userType === 'ALUNO' && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="matricula">Matrícula *</label>
                <input 
                  type="text" 
                  id="matricula" 
                  placeholder="20240001"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="turma">Turma</label>
                <select 
                  id="turma" 
                  value={turma} 
                  onChange={(e) => setTurma(e.target.value)}
                >
                  <option value="">Selecione a turma</option>
                  <option value="T101">Turma 101</option>
                  <option value="T102">Turma 102</option>
                  <option value="T201">Turma 201</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="dataNascimento">Data de Nascimento</label>
                <input 
                  type="text" 
                  id="dataNascimento" 
                  placeholder="dd/mm/aaaa"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  onFocus={(e) => e.target.type = 'date'} 
                  onBlur={(e) => e.target.type = 'text'}
                />
              </div>
            </>
          )}
          {/* ------------------------------------- */}

          {/* --- NOVOS CAMPOS CONDICIONAIS PARA PROFESSOR --- */}
          {userType === 'PROFESSOR' && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="disciplina">Disciplina Principal</label>
                <select 
                  id="disciplina" 
                  value={disciplina} 
                  onChange={(e) => setDisciplina(e.target.value)}
                >
                  <option value="">Selecione a disciplina</option>
                  {disciplinasEscolar.map(disc => (
                    <option key={disc} value={disc}>{disc}</option>
                  ))}
                </select>
              </div>
              
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="formacao">Formação Acadêmica</label>
                <input 
                  type="text" 
                  id="formacao" 
                  placeholder="Ex: Licenciatura em Matemática"
                  value={formacaoAcademica}
                  onChange={(e) => setFormacaoAcademica(e.target.value)}
                />
              </div>
            </>
          )}
          {/* ------------------------------------------------ */}

          <div className={styles.actions}>
            <Link href="/admin/dashboard" className={styles.cancelButton}>
              Cancelar
            </Link>
            <button type="submit" className={styles.submitButton}>
              Cadastrar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
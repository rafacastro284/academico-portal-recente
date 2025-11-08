"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { adminUserData } from '../../../../../lib/mockData'; 
import styles from './EditUsuario.module.css'; 

export default function EditUsuario() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string; 

  // Estados para cada campo do formulário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [perfil, setPerfil] = useState('ALUNO');
  const [matricula, setMatricula] = useState('');
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [userFound, setUserFound] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userId) {
      // Encontra o usuário no mockData
      const user = adminUserData.users.find(u => u.id === userId);
      
      if (user) {
        // Preenche os states com os dados do usuário
        setNome(user.nome);
        setCpf(user.cpf);
        setPerfil(user.perfil);
        setMatricula(user.matricula);
        setEmail(user.email);
        setUserFound(true);
      } else {
        setUserFound(false);
      }
      setIsLoading(false);
    }
  }, [userId]); // Executa sempre que o 'userId' mudar

  // Função para salvar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    console.log('Salvando alterações para o usuário:', userId);
    console.log({ nome, cpf, perfil, matricula, email });
    
    // Aqui seria a chamada de API para o backend

    const userIndex = adminUserData.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      adminUserData.users[userIndex] = {
        ...adminUserData.users[userIndex],
        nome,
        cpf,
        perfil,
        matricula,
        email,
      };
    }

    setMessage('Usuário atualizado com sucesso!');
    
    // Redireciona de volta para a lista após 2 segundos
    setTimeout(() => {
      router.push('/admin/usuarios');
    }, 2000);
  };

  if (isLoading) {
    return <div className={styles.container}><p>Carregando...</p></div>;
  }

  if (!userFound) {
    return (
      <div className={styles.container}>
        <Link href="/admin/usuarios" className={styles.backButton}>
          &larr; Voltar
        </Link>
        <h1 className={styles.formTitle}>Erro</h1>
        <p>Usuário não encontrado.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/admin/usuarios" className={styles.backButton}>
        &larr; Voltar para Usuários
      </Link>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Editar Usuário: {nome}</h1>

        {/* Nome */}
        <div className={styles.inputGroup}>
          <label htmlFor="nome">Nome Completo</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        {/* CPF */}
        <div className={styles.inputGroup}>
          <label htmlFor="cpf">CPF</label>
          <input
            type="text"
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
        </div>

        {/* Perfil */}
        <div className={styles.inputGroup}>
          <label htmlFor="perfil">Perfil</label>
          <select 
            id="perfil" 
            value={perfil} 
            onChange={(e) => setPerfil(e.target.value)}
          >
            <option value="ALUNO">Aluno</option>
            <option value="PROFESSOR">Professor</option>
            <option value="SECRETARIO">Secretário</option>
            <option value="DIRETOR">Diretor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        
        {/* Matrícula/Registro */}
        <div className={styles.inputGroup}>
          <label htmlFor="matricula">Matrícula/Registro</label>
          <input
            type="text"
            id="matricula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
            placeholder="Use '-' se não aplicável"
          />
        </div>
        
        {/* E-mail */}
        <div className={styles.inputGroup}>
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Botão de Salvar */}
        <button 
          type="submit" 
          className={styles.submitButton}
        >
          Salvar Alterações
        </button>

        {/* Mensagem de Sucesso */}
        {message && <p className={styles.successMessage}>{message}</p>}
      </form>
    </div>
  );
}
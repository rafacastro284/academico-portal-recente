"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import styles from './Login.module.css';

const fakeUsers = [
  { 
    cpf: '111', 
    password: '123', 
    role: 'admin', 
    redirectPath: '/admin/dashboard' 
  },
  { 
    cpf: '222', 
    password: '123', 
    role: 'aluno', 
    redirectPath: '/dashboard' 
  },
  { 
    cpf: '333', 
    password: '123', 
    role: 'diretor', 
    redirectPath: '/diretor/dashboard' 
  },
  { 
    cpf: '444', 
    password: '123', 
    role: 'professor', 
    redirectPath: '/professor/dashboard' 
  },
];

export default function Login() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); 
    setError(''); 

    const user = fakeUsers.find(u => u.cpf === cpf);

    if (!user) {
      setError('CPF ou senha inválidos.');
      return;
    }

    if (user.password !== password) {
      setError('CPF ou senha inválidos.');
      return;
    }

    console.log(`Login como ${user.role} bem-sucedido! Redirecionando para ${user.redirectPath}`);
    router.push(user.redirectPath);
  };

  return (
    <div className={styles.loginBox}>
      <h1 className={styles.title}>Acesse sua conta</h1>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="cpf">CPF</label>
          <input
            type="text"
            id="cpf"
            placeholder="Digite seu CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        { }
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <a href="#" className={styles.forgotPassword}>
          Esqueceu a senha?
        </a>

        <button type="submit" className={styles.loginButton}>
          Entrar
        </button>
      </form>
    </div>
  );
}
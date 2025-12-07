"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth'; // Importa a action do backend
import styles from './Login.module.css';

export default function Login() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. A MÁSCARA DE CPF 
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(valor.slice(0, 14));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 2. CHAMA O BACKEND REAL 
      const resultado = await loginAction({ cpf, senha });

      if (resultado.success) {
        const tipo = (resultado.usuario?.tipo || '').toLowerCase();
        
        console.log(`Login como ${tipo} bem-sucedido!`);

        // 3. REDIRECIONAMENTO INTELIGENTE
        if (tipo === 'admin') router.push('/admin/dashboard');
        else if (tipo === 'aluno') router.push('/aluno/dashboard');
        else if (tipo === 'professor') router.push('/professor/dashboard');
        else if (tipo === 'diretor') router.push('/diretor/dashboard');
        else if (tipo === 'secretario') router.push('/secretaria/dashboard');
        else router.push('/'); // Fallback
      } else {
        setError(resultado.error || 'CPF ou senha inválidos.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
            onChange={handleCpfChange} // Usa a máscara aqui
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        
        {/* Exibe erro se houver */}
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <a href="#" className={styles.forgotPassword}>
          Esqueceu a senha?
        </a>

        <button type="submit" className={styles.loginButton} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
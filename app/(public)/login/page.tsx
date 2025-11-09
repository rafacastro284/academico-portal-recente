'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function Login() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🧮 Função para formatar o CPF conforme o usuário digita
  const formatarCPF = (valor: string) => {
    return valor
      .replace(/\D/g, '') // remove caracteres não numéricos
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarCPF(e.target.value);
    setCpf(valorFormatado);
  };

  // ✅ Função principal de login
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setError('');
  setLoading(true);

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, senha }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
      router.push(data.redirectPath); // 👈 redireciona conforme o backend
    } else {
      setError(data.error || 'Erro ao fazer login.');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    setError('Erro ao conectar ao servidor.');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className={styles.loginBox}>
      <h1 className={styles.title}>Acesse sua conta</h1>

      <form onSubmit={handleSubmit}>
        {/* Campo de CPF */}
        <div className={styles.inputGroup}>
          <label htmlFor="cpf">CPF</label>
          <input
            type="text"
            id="cpf"
            placeholder="Digite seu CPF"
            value={cpf}
            onChange={handleCpfChange}
            required
          />
        </div>

        {/* Campo de senha */}
        <div className={styles.inputGroup}>
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            id="senha"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        {/* Exibição de erro */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Botão de envio */}
        <button type="submit" className={styles.loginButton} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

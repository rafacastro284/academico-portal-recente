'use client';

import { useState, useEffect } from 'react';
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
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senhaErro, setSenhaErro] = useState('');
  const [senhaForca, setSenhaForca] = useState<{ nivel: string; cor: string }>({
    nivel: '',
    cor: '',
  });

  const [matricula, setMatricula] = useState('');
  const [turma, setTurma] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [formacaoAcademica, setFormacaoAcademica] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // 🧮 Máscara de CPF
  const formatarCPF = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarCPF(e.target.value);
    setCpf(valorFormatado);
  };

  // 🔐 Validação de senha forte
  const validarSenha = (senha: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(senha);
  };

  // 💪 Cálculo de força da senha (visual)
  const calcularForcaSenha = (senha: string) => {
    let pontos = 0;
    if (senha.length >= 8) pontos++;
    if (/[A-Z]/.test(senha)) pontos++;
    if (/[a-z]/.test(senha)) pontos++;
    if (/\d/.test(senha)) pontos++;
    if (/[\W_]/.test(senha)) pontos++;

    if (pontos <= 2) return { nivel: 'Fraca', cor: 'red' };
    if (pontos === 3 || pontos === 4) return { nivel: 'Média', cor: 'orange' };
    return { nivel: 'Forte', cor: 'green' };
  };

  useEffect(() => {
    if (senha.length > 0) {
      setSenhaForca(calcularForcaSenha(senha));
    } else {
      setSenhaForca({ nivel: '', cor: '' });
    }
  }, [senha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    setSenhaErro('');

    if (!userType.trim()) {
      setStatusMessage('❌ Erro: selecione o tipo de usuário antes de cadastrar.');
      return;
    }

    if (!nome.trim() || !cpf.trim() || !email.trim() || !senha.trim()) {
      setStatusMessage('❌ Erro: preencha todos os campos obrigatórios (Nome, CPF, E-mail, Senha).');
      return;
    }

    if (!validarSenha(senha)) {
      setSenhaErro(
        'A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.'
      );
      return;
    }

    setLoading(true);

    const payload = {
      tipo: userType.trim().toLowerCase(),
      nome: nome.trim(),
      cpf: cpf.trim(),
      email: email.trim(),
      senha: senha,
      matricula: matricula.trim() || null,
      turma: turma.trim() || null,
      dataNascimento: dataNascimento || null,
      disciplina: disciplina || null,
      formacaoAcademica: formacaoAcademica || null,
    };

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setStatusMessage(`✅ Usuário ${result.usuario?.nome || payload.nome} cadastrado com sucesso!`);
        setUserType('');
        setNome('');
        setCpf('');
        setEmail('');
        setSenha('');
        setMatricula('');
        setTurma('');
        setDataNascimento('');
        setDisciplina('');
        setFormacaoAcademica('');
      } else {
        setStatusMessage(`❌ Erro: ${result.error || 'Falha no cadastro.'}`);
      }
    } catch (err) {
      console.error('Erro fetch /api/usuarios:', err);
      setStatusMessage('❌ Erro de comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/admin/dashboard" className={styles.backButton}>
        &larr; Voltar à página principal
      </Link>

      <h1 className={styles.title}>Cadastrar Novo Usuário</h1>

      <div className={styles.card}>
        {statusMessage && (
          <div className={statusMessage.includes('✅') ? styles.success : styles.error}>
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="userType">Tipo de Usuário *</label>
            <select id="userType" value={userType} onChange={(e) => setUserType(e.target.value)} required>
              <option value="">Selecione o tipo</option>
              <option value="aluno">Aluno</option>
              <option value="professor">Professor</option>
              <option value="secretario">Secretário</option>
              <option value="diretor">Diretor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Nome *</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label>CPF *</label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
        <label>Senha *</label>
        <div style={{ position: 'relative' }}>
          <input
            type={mostrarSenha ? 'text' : 'password'}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Ex: Aa@12345"
            required
            style={{ paddingRight: '35px' }}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {mostrarSenha ? '🙈' : '👁️'}
          </button>
        </div>

  {senhaErro && <small className={styles.error}>{senhaErro}</small>}
  {senhaForca.nivel && (
    <div style={{ marginTop: '5px' }}>
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#ddd',
          borderRadius: '5px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width:
              senhaForca.nivel === 'Fraca'
                ? '33%'
                : senhaForca.nivel === 'Média'
                ? '66%'
                : '100%',
            height: '8px',
            backgroundColor: senhaForca.cor,
            transition: 'width 0.3s',
          }}
        ></div>
      </div>
      <small style={{ color: senhaForca.cor, fontWeight: 'bold' }}>
        Força da senha: {senhaForca.nivel}
      </small>
    </div>
  )}
</div>

          {/* Campos específicos */}
          {userType === 'aluno' && (
            <>
              <div className={styles.formGroup}>
                <label>Matrícula *</label>
                <input type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>Turma</label>
                <input type="text" value={turma} onChange={(e) => setTurma(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Data de Nascimento</label>
                <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
              </div>
            </>
          )}

          {userType === 'professor' && (
            <>
              <div className={styles.formGroup}>
                <label>Disciplina</label>
                <select value={disciplina} onChange={(e) => setDisciplina(e.target.value)}>
                  <option value="">Selecione</option>
                  {disciplinasEscolar.map((disc) => (
                    <option key={disc} value={disc}>{disc}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Formação Acadêmica</label>
                <input type="text" value={formacaoAcademica} onChange={(e) => setFormacaoAcademica(e.target.value)} />
              </div>
            </>
          )}

          <div className={styles.actions}>
            <Link href="/admin/dashboard" className={styles.cancelButton}>Cancelar</Link>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

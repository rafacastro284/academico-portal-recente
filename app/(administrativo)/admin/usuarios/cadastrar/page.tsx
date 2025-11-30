'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Cadastro.module.css';

// Lista fixa das disciplinas disponíveis
const disciplinasEscolar = [
  'Matemática', 'Português', 'História', 'Geografia',
  'Física', 'Química', 'Biologia', 'Inglês', 'Educação Física', 'Artes'
];

export default function CadastrarUsuario() {

  // ================== States gerais do usuário ==================
  const [userType, setUserType] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senhaErro, setSenhaErro] = useState('');
  const [senhaForca, setSenhaForca] = useState<{ nivel: string; cor: string }>({ nivel: '', cor: '' });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // ================== Campos específicos ==================
  const [listaTurmas, setListaTurmas] = useState<any[]>([]);
  const [matricula, setMatricula] = useState('');
  const [turma, setTurma] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [formacaoAcademica, setFormacaoAcademica] = useState('');

  // ================== Buscar turmas do backend ==================
  useEffect(() => {
    const carregarTurmas = async () => {
      try {
        const res = await fetch("/api/turmas");
        const data = await res.json();
        setListaTurmas(data); // agora carrega com idturma + nome_turma
      } catch (error) {
        console.error("Erro ao carregar turmas", error);
      }
    };
    carregarTurmas();
  }, []);

  // ================== Máscara CPF ==================
  const formatarCPF = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatarCPF(e.target.value));
  };

  // ================== Validação senha ==================
  const validarSenha = (senha: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(senha);
  };

  const calcularForcaSenha = (senha: string) => {
    let pontos = 0;
    if (senha.length >= 8) pontos++;
    if (/[A-Z]/.test(senha)) pontos++;
    if (/[a-z]/.test(senha)) pontos++;
    if (/\d/.test(senha)) pontos++;
    if (/[\W_]/.test(senha)) pontos++;

    if (pontos <= 2) return { nivel: 'Fraca', cor: 'red' };
    if (pontos <= 4) return { nivel: 'Média', cor: 'orange' };
    return { nivel: 'Forte', cor: 'green' };
  };

  useEffect(() => {
    senha.length > 0
      ? setSenhaForca(calcularForcaSenha(senha))
      : setSenhaForca({ nivel: '', cor: '' });
  }, [senha]);

  // ================== Enviar cadastro ==================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    setSenhaErro('');

    if (!userType) return setStatusMessage("❌ Selecione o tipo de usuário.");
    if (!nome || !cpf || !email || !senha) return setStatusMessage("❌ Campos obrigatórios faltando.");
    if (!validarSenha(senha)) return setSenhaErro("A senha deve ter 8 caracteres com letra maiúscula, minúscula, número e símbolo.");

    setLoading(true);

    const payload = {
      tipo: userType,
      nome,
      cpf,
      email,
      senha,
      matricula: matricula || null,
      idturma: turma || null, // <--- agora enviando ID correto
      dataNascimento: dataNascimento || null,
      disciplina: disciplina || null,
      formacaoAcademica: formacaoAcademica || null,
    };

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        setStatusMessage(`✅ Usuário ${result.usuario?.nome} cadastrado com sucesso!`);
        setNome(''); setCpf(''); setEmail(''); setSenha('');
        setMatricula(''); setTurma(''); setDataNascimento('');
        setDisciplina(''); setFormacaoAcademica(''); setUserType('');
      } else setStatusMessage("❌ " + result.error);

    } catch {
      setStatusMessage("❌ Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/admin/dashboard" className={styles.backButton}>← Voltar</Link>
      <h1 className={styles.title}>Cadastrar Usuário</h1>

      <div className={styles.card}>
        {statusMessage && (
          <p className={statusMessage.includes("✅") ? styles.success : styles.error}>
            {statusMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Tipo */}
          <div className={styles.formGroup}>
            <label>Tipo *</label>
            <select value={userType} onChange={(e) => setUserType(e.target.value)} required>
              <option value="">Selecione</option>
              <option value="aluno">Aluno</option>
              <option value="professor">Professor</option>
              <option value="secretario">Secretário</option>
              <option value="diretor">Diretor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Campos comuns */}
          <div className={styles.formGroup}><label>Nome *</label><input value={nome} onChange={e => setNome(e.target.value)} /></div>
          <div className={styles.formGroup}><label>CPF *</label><input value={cpf} onChange={handleCpfChange} /></div>
          <div className={styles.formGroup}><label>Email *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>

          {/* Senha */}
          <div className={styles.formGroup}>
            <label>Senha *</label>
            <div style={{ position: 'relative' }}>
              <input type={mostrarSenha ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)} />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none' }}>
                {mostrarSenha ? "🙈" : "👁️"}
              </button>
            </div>
            {senhaErro && <small style={{ color:"red" }}>{senhaErro}</small>}
            {senhaForca.nivel && <small style={{ color: senhaForca.cor }}>Força: {senhaForca.nivel}</small>}
          </div>

          {/* Campos aluno */}
          {userType === "aluno" && (
            <>
              <div className={styles.formGroup}><label>Matrícula *</label><input value={matricula} onChange={e => setMatricula(e.target.value)} /></div>

              <div className={styles.formGroup}>
                <label>Turma *</label>
                <select value={turma} onChange={e => setTurma(e.target.value)} required>
                  <option value="">Selecione</option>

                  {/* 🔥 corrigido para usar dados do banco */}
                  {listaTurmas.map(t => (
                    <option key={t.idturma} value={t.idturma}>
                      {t.nome_turma}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}><label>Nascimento</label><input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} /></div>
            </>
          )}

          {/* Campos professor */}
          {userType === "professor" && (
            <>
              <div className={styles.formGroup}><label>Disciplina</label>
                <select value={disciplina} onChange={e => setDisciplina(e.target.value)}>
                  <option value="">Selecione</option>
                  {disciplinasEscolar.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div className={styles.formGroup}><label>Formação</label><input value={formacaoAcademica} onChange={e => setFormacaoAcademica(e.target.value)} /></div>
            </>
          )}

          <div className={styles.actions}>
            <Link href="/admin/dashboard" className={styles.cancelButton}>Cancelar</Link>
            <button className={styles.submitButton} disabled={loading}>{loading ? "Enviando..." : "Cadastrar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

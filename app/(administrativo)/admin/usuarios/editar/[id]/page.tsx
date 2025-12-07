"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { tipo_usuario } from "@prisma/client"; 
import { buscarUsuarioPorIdAction, atualizarUsuarioAction, excluirUsuarioAction } from '@/lib/actions/admin';
import styles from './EditUsuario.module.css'; 

export default function EditUsuario() {
  const router = useRouter();
  const params = useParams();
  
  const userId = Number(params?.id);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [perfil, setPerfil] = useState('aluno');
  const [matricula, setMatricula] = useState('');
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      if (!userId) return;

      try {
        const resultado = await buscarUsuarioPorIdAction(userId);

        if (resultado.success && resultado.data) {
          const usuario = resultado.data;
          setNome(usuario.nome || '');
          setCpf(usuario.cpf || '');
          setPerfil(usuario.tipo || 'aluno');
          setMatricula(usuario.matricula || '');
          setEmail(usuario.email || '');
        } else {
          setMessage('Usuário não encontrado.');
        }
      } catch (error) {
        console.error(error);
        setMessage('Erro ao carregar dados.');
      } finally {
        setIsLoading(false);
      }
    }

    carregarDados();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    
    // 👇 2. CORREÇÃO AQUI: "as tipo_usuario" garante ao TypeScript que a string é válida
    const payload = {
      nome,
      cpf,
      email,
      tipo: perfil as tipo_usuario, 
      matricula: matricula || null,
    };

    const resultado = await atualizarUsuarioAction(userId, payload);

    if (resultado.success) {
      setMessage('✅ Usuário atualizado com sucesso!');
      setTimeout(() => {
        router.push('/admin/usuarios');
      }, 1500);
    } else {
      setMessage(resultado.error || 'Erro ao atualizar.');
      setIsLoading(false);
    }
  };

  // ... (o restante da função handleDelete e return continua igual)
  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja EXCLUIR este usuário? Essa ação não pode ser desfeita.")) {
      return;
    }

    setIsDeleting(true);
    const resultado = await excluirUsuarioAction(userId);

    if (resultado.success) {
      alert("Usuário excluído com sucesso.");
      router.push('/admin/usuarios');
    } else {
      alert(resultado.error);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className={styles.container}><p>Carregando dados...</p></div>;
  }

  return (
    <div className={styles.container}>
      <Link href="/admin/usuarios" className={styles.backButton}>
        &larr; Voltar para Lista
      </Link>

      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <h1 className={styles.formTitle}>Editar Usuário</h1>
           <button 
             type="button" 
             onClick={handleDelete}
             disabled={isDeleting}
             style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
           >
             {isDeleting ? 'Excluindo...' : '🗑️ Excluir Usuário'}
           </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          {/* ... Inputs iguais ao anterior ... */}
          
          <div className={styles.inputGroup}>
            <label htmlFor="nome">Nome Completo</label>
            <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="cpf">CPF</label>
            <input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="perfil">Perfil</label>
            <select id="perfil" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
              <option value="aluno">Aluno</option>
              <option value="professor">Professor</option>
              <option value="secretario">Secretário</option>
              <option value="diretor">Diretor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {perfil === 'aluno' && (
            <div className={styles.inputGroup}>
              <label htmlFor="matricula">Matrícula</label>
              <input type="text" id="matricula" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading || isDeleting}>
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>

          {message && (
             <p style={{ marginTop: '15px', color: message.includes('Erro') ? 'red' : 'green', fontWeight: 'bold', textAlign: 'center' }}>
               {message}
             </p>
          )}
        </form>
      </div>
    </div>
  );
}
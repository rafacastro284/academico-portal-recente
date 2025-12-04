'use client'; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listarUsuariosAction, excluirUsuarioAction } from '@/lib/actions'; 
import styles from './Usuarios.module.css';

// Interface que define o formato exato que vamos usar na tela
interface UsuarioTela {
  idusuario: number;
  nome: string;
  cpf: string;
  email: string;
  tipo: string;
  matricula: string;
}

const getPerfilInfo = (perfil: string) => {
  // Converte para minúsculo e protege contra nulos
  const p = (perfil || '').toLowerCase();
  
  switch (p) {
    case 'admin': return { nome: 'Admin', className: styles.tagAdmin };
    case 'aluno': return { nome: 'Aluno', className: styles.tagAluno };
    case 'professor': return { nome: 'Professor', className: styles.tagProfessor };
    case 'diretor': return { nome: 'Diretor', className: styles.tagDiretor };
    case 'secretario': return { nome: 'Secretário', className: styles.tagSecretario };
    default: return { nome: perfil || '?', className: '' };
  }
}

export default function VerUsuarios() {
  const router = useRouter(); 
  const [filtroPerfil, setFiltroPerfil] = useState('todos');
  const [busca, setBusca] = useState('');
  
  const [users, setUsers] = useState<UsuarioTela[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Busca os dados ao carregar
  useEffect(() => {
    async function carregar() {
      try {
        const resultado = await listarUsuariosAction();
        
        if (resultado.success) {
          // ADAPTADOR: Transforma o dado do Banco no dado da Tela
          const dadosFormatados = resultado.data.map((u: any) => ({
              idusuario: u.idusuario,
              nome: u.nome || 'Sem Nome',
              cpf: u.cpf || '-',
              email: u.email || '-',
              tipo: u.tipo || 'aluno', // Se vier null, assume aluno
              matricula: u.matricula || '-'
          }));
          setUsers(dadosFormatados);
        }
      } catch (error) {
        console.error("Erro fatal ao carregar usuários", error);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);
  
  const handleEditar = (userId: number) => {
    router.push(`/admin/usuarios/editar/${userId}`);
  };

  const handleExcluir = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário permanentemente?')) {
      const resultado = await excluirUsuarioAction(userId);
      if (resultado.success) {
        setUsers(currentUsers => currentUsers.filter(user => user.idusuario !== userId));
        alert('Usuário excluído.');
      } else {
        alert(resultado.error || 'Erro ao excluir.');
      }
    }
  };

  // Lógica de Filtro
  const filteredUsers = users.filter(user => {
    // Normaliza para minúsculo para comparar
    const tipoUsuario = (user.tipo || '').toLowerCase();
    const filtro = filtroPerfil.toLowerCase();

    const porPerfil = filtro === 'todos' || tipoUsuario === filtro;
    
    const termo = busca.toLowerCase();
    const porBusca = (user.nome.toLowerCase().includes(termo)) ||
                     (user.cpf.includes(termo)) ||
                     (user.email.toLowerCase().includes(termo));
                     
    return porPerfil && porBusca;
  });

  const summary = {
    total: users.length,
    alunos: users.filter(u => u.tipo === 'aluno').length,
    professores: users.filter(u => u.tipo === 'professor').length,
    diretores: users.filter(u => u.tipo === 'diretor').length,
    secretarios: users.filter(u => u.tipo === 'secretario').length,
    administradores: users.filter(u => u.tipo === 'admin').length,
  };

  if (loading) {
    return <div className={styles.container}><p>Carregando usuários do banco de dados...</p></div>;
  }

  return (
    <div className={styles.container}>
      <Link href="/admin/dashboard" className={styles.backButton}>
        &larr; Voltar à página anterior
      </Link>
      <h1 className={styles.title}>Usuários do Sistema</h1>

      {/* Cards de Resumo */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}><strong>{summary.total}</strong><p>Total</p></div>
        <div className={styles.summaryCard}><strong>{summary.alunos}</strong><p>Alunos</p></div>
        <div className={styles.summaryCard}><strong>{summary.professores}</strong><p>Professores</p></div>
        <div className={styles.summaryCard}><strong>{summary.diretores}</strong><p>Diretores</p></div>
        <div className={styles.summaryCard}><strong>{summary.secretarios}</strong><p>Secretários</p></div>
        <div className={styles.summaryCard}><strong>{summary.administradores}</strong><p>Admins</p></div>
      </div>

      {/* Barra de Filtros */}
      <div className={styles.filterBar}>
        <div>
          <label htmlFor="filtroPerfil">Filtrar por perfil:</label>
          <select id="filtroPerfil" value={filtroPerfil} onChange={(e) => setFiltroPerfil(e.target.value)}>
            <option value="todos">Todos os perfis</option>
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
            <option value="secretario">Secretário</option>
            <option value="diretor">Diretor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label htmlFor="busca">Buscar:</label>
          <input 
            type="text" 
            id="busca"
            placeholder="Nome, CPF, e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Perfil</th>
              <th>Matrícula</th>
              <th>E-mail</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
                <tr>
                    <td colSpan={6} style={{textAlign: 'center', padding: '20px'}}>
                        {users.length === 0 
                          ? "Nenhum usuário cadastrado no banco." 
                          : "Nenhum usuário encontrado com este filtro."}
                    </td>
                </tr>
            ) : (
                filteredUsers.map((user) => {
                const perfilInfo = getPerfilInfo(user.tipo);
                return (
                    <tr key={user.idusuario}>
                    <td>{user.nome}</td>
                    <td>{user.cpf}</td>
                    <td>
                        <span className={`${styles.tag} ${perfilInfo.className}`}>
                        {perfilInfo.nome}
                        </span>
                    </td>
                    <td>{user.matricula}</td>
                    <td>{user.email}</td>
                    <td className={styles.actions}>
                        <button 
                        onClick={() => handleEditar(user.idusuario)}
                        className={`${styles.actionButton} ${styles.editButton}`}
                        title="Editar"
                        >
                        Editar
                        </button>
                        <button 
                        onClick={() => handleExcluir(user.idusuario)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Excluir"
                        >
                        Excluir
                        </button>
                    </td>
                    </tr>
                )
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
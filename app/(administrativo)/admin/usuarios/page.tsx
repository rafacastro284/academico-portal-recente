'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminUserData } from '../../../lib/mockData';
import styles from './Usuarios.module.css';

const getPerfilInfo = (perfil: string) => {
  switch (perfil) {
    case 'ADMIN': return { nome: 'Admin', className: styles.tagAdmin };
    case 'ALUNO': return { nome: 'Aluno', className: styles.tagAluno };
    case 'PROFESSOR': return { nome: 'Professor', className: styles.tagProfessor };
    case 'DIRETOR': return { nome: 'Diretor', className: styles.tagDiretor };
    case 'SECRETARIO': return { nome: 'Secretário', className: styles.tagSecretario };
    default: return { nome: perfil, className: '' };
  }
}

export default function VerUsuarios() {
  const router = useRouter(); 
  const [filtroPerfil, setFiltroPerfil] = useState('todos');
  const [busca, setBusca] = useState('');
  const [users, setUsers] = useState(adminUserData.users);
  
  const handleEditar = (userId: string) => {
    console.log('Editando usuário:', userId);
    router.push(`/admin/usuarios/editar/${userId}`);
  };

  const handleExcluir = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      console.log('Excluindo usuário:', userId);
      setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
    }
  };
  const summary = {
    total: users.length,
    alunos: users.filter(u => u.perfil === 'ALUNO').length,
    professores: users.filter(u => u.perfil === 'PROFESSOR').length,
    diretores: users.filter(u => u.perfil === 'DIRETOR').length,
    secretarios: users.filter(u => u.perfil === 'SECRETARIO').length,
    administradores: users.filter(u => u.perfil === 'ADMIN').length,
  };

  const filteredUsers = users.filter(user => {
    const porPerfil = filtroPerfil === 'todos' || user.perfil === filtroPerfil;
    const porBusca = user.nome.toLowerCase().includes(busca.toLowerCase()) ||
                     user.cpf.includes(busca) ||
                     user.email.toLowerCase().includes(busca.toLowerCase());
    return porPerfil && porBusca;
  });

  return (
    <div className={styles.container}>
      <Link href="/admin/dashboard" className={styles.backButton}>
        &larr; Voltar à página anterior
      </Link>
      <h1 className={styles.title}>Usuários do Sistema</h1>

      {/* Cards de Resumo (agora usam o summary dinâmico) */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}><strong>{summary.total}</strong><p>Total de Usuários</p></div>
        <div className={styles.summaryCard}><strong>{summary.alunos}</strong><p>Alunos</p></div>
        <div className={styles.summaryCard}><strong>{summary.professores}</strong><p>Professores</p></div>
        <div className={styles.summaryCard}><strong>{summary.diretores}</strong><p>Diretores</p></div>
        <div className={styles.summaryCard}><strong>{summary.secretarios}</strong><p>Secretários</p></div>
        <div className={styles.summaryCard}><strong>{summary.administradores}</strong><p>Administradores</p></div>
      </div>

      {/* Filtros (seu código original) */}
      <div className={styles.filterBar}>
        <div>
          <label htmlFor="filtroPerfil">Filtrar por perfil:</label>
          <select id="filtroPerfil" value={filtroPerfil} onChange={(e) => setFiltroPerfil(e.target.value)}>
            <option value="todos">Todos os perfis</option>
            <option value="ALUNO">Aluno</option>
            <option value="PROFESSOR">Professor</option>
            <option value="SECRETARIO">Secretário</option>
            <option value="DIRETOR">Diretor</option>
            <option value="ADMIN">Admin</option>
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
            {/* ... seu thead ... */}
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Perfil</th>
              <th>Matrícula/Registro</th>
              <th>E-mail</th>
              <th>Data Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const perfilInfo = getPerfilInfo(user.perfil);
              return (
                <tr key={user.id}>
                  <td>{user.nome}</td>
                  <td>{user.cpf}</td>
                  <td>
                    <span className={`${styles.tag} ${perfilInfo.className}`}>
                      {perfilInfo.nome}
                    </span>
                  </td>
                  <td>{user.matricula}</td>
                  <td>{user.email}</td>
                  <td>{user.dataCadastro}</td>
                  <td className={styles.actions}>
                    {/* 6. CONECTAR OS BOTÕES AO ONCLICK */}
                    <button 
                      onClick={() => handleEditar(user.id)}
                      className={`${styles.actionButton} ${styles.editButton}`}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleExcluir(user.id)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
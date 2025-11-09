'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './AdminDashboard.module.css';

const IconUserPlus = () => <>👨‍💻</>;
const IconUsers = () => <>👥</>;
const IconChart = () => <>📊</>;

interface Usuario {
  nome: string;
  email: string;
  perfil: string;
}

export default function AdminDashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
      setUsuario(JSON.parse(usuarioLogado));
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* ✅ Mantém o título principal */}
      <h1 className={styles.title}>Painel do Administrador</h1>

      {/* Sessão principal */}
      <section className={styles.section}>
        <h2>Gerenciamento do Sistema</h2>
        <div className={styles.cardGrid}>
          
          <Link href="/admin/usuarios/cadastrar" className={styles.card}>
            <div className={styles.iconWrapper}><IconUserPlus /></div>
            <h3>Cadastrar Usuário</h3>
            <p>Adicionar alunos, professores, diretores e administradores</p>
          </Link>

          <Link href="/admin/usuarios" className={styles.card}>
            <div className={styles.iconWrapper}><IconUsers /></div>
            <h3>Visualizar Usuários</h3>
            <p>Ver e gerenciar todos os usuários cadastrados</p>
          </Link>

          <Link href="/admin/relatorios" className={styles.card}>
            <div className={styles.iconWrapper}><IconChart /></div>
            <h3>Relatórios</h3>
            <p>Gerar relatórios do sistema</p>
          </Link>

        </div>
      </section>
    </div>
  );
}

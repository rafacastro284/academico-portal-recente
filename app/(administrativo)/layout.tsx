"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<{ nome: string } | null>(null);

  useEffect(() => {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) setUsuario(JSON.parse(usuarioLogado));
  }, []);

  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <span>Olá, {usuario?.nome || 'Administrador'}!</span>
            <Link href="/login">
              <button className={styles.logoutButton}>Sair</button>
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>{children}</main>

      <footer className={styles.footer}>Copyright © 2025</footer>
    </div>
  );
}

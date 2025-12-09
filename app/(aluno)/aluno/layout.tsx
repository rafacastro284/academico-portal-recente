import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { buscarUsuarioPorIdAction } from '@/lib/actions/admin'; // Reutilizamos a action de busca
import styles from './AlunoLayout.module.css';

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Tenta identificar o aluno pelo cookie
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('portal_usuario_id');
  
  let nomeAluno = 'Aluno';

  // 2. Se tiver ID, busca o nome real no banco
  if (userIdCookie) {
    const id = Number(userIdCookie.value);
    const res = await buscarUsuarioPorIdAction(id);
    if (res.success && res.data) {
      nomeAluno = res.data.nome || 'Aluno';
    }
  }

  return (
    <div className={styles.layoutContainer}>
      
      <header className={styles.layoutHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Informações do Usuário */}

        </div>
      </header>

      <main className={styles.layoutMain}>
        {children}
      </main>

      <footer className={styles.layoutFooter}>
        <p>Copyright © 2025 - Portal Acadêmico</p>
      </footer>
    </div>
  );
}
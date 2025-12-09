import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'; // Necessário para o Logout
import { getDashboardProfessorAction } from '@/lib/actions/professor';
// 👇 CORREÇÃO 1: Importando a busca de usuário do local correto (admin)
import { buscarUsuarioPorIdAction } from '@/lib/actions/admin'; 
import styles from './ProfessorLayout.module.css';

const IconTurmas = () => <span>🏫</span>;
const IconAlunos = () => <span>👨‍🎓</span>;
const IconDisciplinas = () => <span>📚</span>;

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Identifica o Professor Logado
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('portal_usuario_id');
  
  // Se não tiver cookie, força o login imediatamente (Segurança)
  if (!userIdCookie) {
    redirect('/login');
  }

  // Valores padrão
  let nomeProfessor = "Professor";
  let stats = {
    turmas: 0,
    alunos: 0,
    disciplinas: 0
  };

  if (userIdCookie) {
    const id = Number(userIdCookie.value);

    // 2. Busca o nome do usuário (Usando a action de admin)
    const usuarioRes = await buscarUsuarioPorIdAction(id);
    if (usuarioRes.success && usuarioRes.data) {
      nomeProfessor = usuarioRes.data.nome || "Professor";
    }

    // 3. Busca os dados do dashboard
    const dashRes = await getDashboardProfessorAction(id);
    if (dashRes.success && dashRes.data) {
      const { totalTurmas, totalAlunos, turmas } = dashRes.data;
      
      // Calcula disciplinas únicas usando Set
      const disciplinasUnicas = new Set(turmas.map((t: any) => t.nomeDisciplina)).size;

      stats = {
        turmas: totalTurmas,
        alunos: totalAlunos,
        disciplinas: disciplinasUnicas
      };
    }
  }

  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.header}>
        {/* Espaço reservado para Menu Superior se houver */}
      </header>

      <main className={styles.mainContent}>
        {/* -- Card de Info do Professor -- */}
        <div className={`${styles.card} ${styles.headerCard}`}>
          <div>
            <h1>Portal do Professor</h1>
            <p>Olá, <strong>{nomeProfessor}</strong></p>
          </div>
          
          {/* 👇 CORREÇÃO 2: Logout real que apaga o cookie */}
          <form action={async () => {
            'use server';
            const c = await cookies();
            c.delete('portal_usuario_id');
            redirect('/login');
          }}>
             <button className={styles.logoutButton}>Sair</button>
          </form>
        </div>
        
        {/* -- Cards de Resumo Rápido -- */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{backgroundColor: '#dbeafe'}}><IconTurmas /></div>
            <div>
              <strong>{stats.turmas}</strong>
              <p>Turmas</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{backgroundColor: '#dcfce7'}}><IconAlunos /></div>
            <div>
              <strong>{stats.alunos}</strong>
              <p>Alunos</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{backgroundColor: '#f3e8ff'}}><IconDisciplinas /></div>
            <div>
              <strong>{stats.disciplinas}</strong>
              <p>Disciplinas</p>
            </div>
          </div>
        </div>

        {children}
      </main>

      <footer className={styles.footer}>
        Copyright © 2025 - Portal Acadêmico
      </footer>
    </div>
  );
}
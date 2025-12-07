import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./DiretorLayout.module.css";
// 👇 Importe a nova action
import { getDashboardDiretorAction } from "@/lib/actions/diretoria";

const IconAluno = () => <span>👨‍🎓</span>;
const IconProfessor = () => <span>👩‍🏫</span>;
const IconTurma = () => <span>🏫</span>;
const IconMedia = () => <span>📊</span>;

export default async function DiretorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Autenticação (Server Side)
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get("portal_usuario_id");

  if (!userIdCookie) {
    redirect("/login");
  }

  // 2. Busca de Dados via Server Action
  const idDiretor = Number(userIdCookie.value);
  const resultado = await getDashboardDiretorAction(idDiretor);

  // Valores padrão caso dê erro
  const nomeDiretor = resultado.success ? resultado.data?.nome : "Diretor";
  const stats = resultado.success && resultado.data ? resultado.data.stats : {
    alunos: 0,
    professores: 0,
    turmas: 0,
    mediaGeral: "0.0"
  };

  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.header}></header>

      <main className={styles.mainContent}>
        {/* -- Card de Info do Diretor -- */}
        <div className={`${styles.card} ${styles.headerCard}`}>
          <div>
            <h1>Olá, {nomeDiretor}</h1>
            <p>Painel Administrativo</p>
          </div>
          
          {/* Botão de Logout via Server Action inline */}
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
            <div className={styles.iconWrapper} style={{backgroundColor: '#e0f2fe'}}><IconAluno /></div>
            <div>
              <strong>{stats.alunos}</strong>
              <p>Alunos</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{backgroundColor: '#fce7f3'}}><IconProfessor /></div>
            <div>
              <strong>{stats.professores}</strong>
              <p>Professores</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{backgroundColor: '#dcfce7'}}><IconTurma /></div>
            <div>
              <strong>{stats.turmas}</strong>
              <p>Turmas</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{backgroundColor: '#f3e8ff'}}><IconMedia /></div>
            <div>
              <strong>{stats.mediaGeral}</strong>
              <p>Média Geral</p>
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
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./DiretorLayout.module.css";
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
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get("portal_usuario_id");

  if (!userIdCookie) {
    redirect("/login");
  }

  const idDiretor = Number(userIdCookie.value);
  const resultado = await getDashboardDiretorAction(idDiretor);

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
            <p>Painel do Diretor</p>
          </div>
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
            <div className={styles.iconWrapper}><IconAluno /></div>
            <div>
              <strong>{stats.alunos}</strong>
              <p>Total de Alunos</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconProfessor /></div>
            <div>
              <strong>{stats.professores}</strong>
              <p>Total de Professores</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconTurma /></div>
            <div>
              <strong>{stats.turmas}</strong>
              <p>Total de Turmas</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconMedia /></div>
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
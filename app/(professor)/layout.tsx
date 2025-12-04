import Link from 'next/link';
import { cookies } from 'next/headers';
import { buscarUsuarioPorIdAction, getDashboardProfessorAction } from '@/lib/actions';
import styles from './ProfessorLayout.module.css';

const IconTurmas = () => <>🏫</>;
const IconAlunos = () => <>👨‍🎓</>;
const IconDisciplinas = () => <>📚</>;

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Identifica o Professor Logado
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('portal_usuario_id');
  
  // Valores padrão (caso não esteja logado ou dê erro, para não quebrar o layout)
  let nomeProfessor = "Professor";
  let stats = {
    turmas: 0,
    alunos: 0,
    disciplinas: 0
  };

  if (userIdCookie) {
    const id = Number(userIdCookie.value);

    // 2. Busca o nome do usuário
    const usuarioRes = await buscarUsuarioPorIdAction(id);
    if (usuarioRes.success && usuarioRes.data) {
      nomeProfessor = usuarioRes.data.nome || "Professor";
    }

    // 3. Busca os dados do dashboard para preencher os cards de resumo
    const dashRes = await getDashboardProfessorAction(id);
    if (dashRes.success && dashRes.data) {
      const { totalTurmas, totalAlunos, turmas } = dashRes.data;
      
      // Calcula quantas disciplinas ÚNICAS ele ministra (ex: Matemática, Física = 2)
      // Usamos um Set para remover duplicatas dos nomes
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
          <Link href="/login">
            <button className={styles.logoutButton}>Sair</button>
          </Link>
        </div>
        
        {/* -- Cards de Resumo Rápido (Agora com dados REAIS) -- */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconTurmas /></div>
            <div>
              <strong>{stats.turmas}</strong>
              <p>Turmas</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconAlunos /></div>
            <div>
              <strong>{stats.alunos}</strong>
              <p>Alunos</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconDisciplinas /></div>
            <div>
              <strong>{stats.disciplinas}</strong>
              <p>Disciplinas</p>
            </div>
          </div>
        </div>

        {/* -- Conteúdo da Página Atual (Dashboard, Lista, Notas...) -- */}
        {children}
      </main>

      <footer className={styles.footer}>
        Copyright © 2025 - Portal Acadêmico
      </footer>
    </div>
  );
}
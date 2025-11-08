import Link from 'next/link';
import styles from './AdminDashboard.module.css';

const IconUserPlus = () => <>👨‍💻</>; //Substituir dps por outros icones
const IconUsers = () => <>👥</>;
const IconChart = () => <>📊</>;

export default function AdminDashboard() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Painel do Administrador</h1>

      <section className={styles.section}>
        <h2>Gerenciamento do Sistema</h2>
        <div className={styles.cardGrid}>
          
          <Link href="/admin/usuarios/cadastrar" className={styles.card}>
            <div className={styles.iconWrapper}><IconUserPlus /></div>
            <h3>Cadastrar Usuário</h3>
            <p>Adicionar alunos, professores e administradores</p>
          </Link>

          <Link href="/admin/usuarios" className={styles.card}>
            <div className={styles.iconWrapper}><IconUsers /></div>
            <h3>Visualizar Usuários</h3>
            <p>Ver e gerenciar todos os usuários cadastrados</p>
          </Link>

          <Link href="#" className={styles.card}>
            <div className={styles.iconWrapper}><IconChart /></div>
            <h3>Relatórios</h3>
            <p>Gerar relatórios do sistema</p>
          </Link>

        </div>
      </section>
    </div>
  );
}
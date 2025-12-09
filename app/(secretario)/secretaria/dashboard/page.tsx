import Link from 'next/link';
import styles from './SecretarioDashboard.module.css';

const IconGerenciarAlunos = () => <>🎓</>;
const IconGerenciarProfessores = () => <>👨‍🏫</>;
const IconCadastrarTurma = () => <>➕</>;
const IconDocumento = () => <>📄</>;
const IconHorario = () => <>🗓️</>;
const IconGerenciarTurmas = () => <>🏫</>; 
const IconCadastrarUsuario = () => <>👤</>; 

export default function SecretarioDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Gerenciamento</h2>
        <div className={styles.navGrid}>

          <Link href="/secretaria/alunos" className={styles.navCard}>
            {/* ... Gerenciar Alunos ... */}
            <div className={styles.iconWrapper}><IconGerenciarAlunos /></div>
            <h3>Alunos</h3>
            <p>Visualizar, filtrar e buscar alunos</p>
          </Link>

          <Link href="/secretaria/professores" className={styles.navCard}>
            {/* ... Gerenciar Professores ... */}
            <div className={styles.iconWrapper}><IconGerenciarProfessores /></div>
            <h3>Professores</h3>
            <p>Visualizar, filtrar e buscar professores</p>
          </Link>
          
          <Link href="/secretaria/cadastrar-turma" className={styles.navCard}>
            {/* ... Cadastrar Nova Turma ... */}
            <div className={styles.iconWrapper}><IconCadastrarTurma /></div>
            <h3>Cadastrar Nova Turma</h3>
            <p>Criar turmas e associar alunos</p>
          </Link>

          <Link href="/secretaria/turmas" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconGerenciarTurmas /></div>
            <h3>Gerenciar Turmas</h3>
            <p>Visualizar, editar ou excluir turmas existentes</p>
          </Link>

        </div>
      </div>
    </div>
  );
}
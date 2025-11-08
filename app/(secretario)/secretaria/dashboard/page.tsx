import Link from 'next/link';
import styles from './SecretarioDashboard.module.css';

const IconGerenciarAlunos = () => <>🎓</>;
const IconGerenciarProfessores = () => <>👨‍🏫</>;
const IconCadastrarTurma = () => <>➕</>;
const IconDocumento = () => <>📄</>;
const IconHorario = () => <>🗓️</>;
const IconGerenciarTurmas = () => <>🏫</>; 

export default function SecretarioDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Gerenciamento</h2>
        <div className={styles.navGrid}>

          <Link href="/secretaria/alunos" className={styles.navCard}>
            {/* ... Gerenciar Alunos ... */}
            <div className={styles.iconWrapper}><IconGerenciarAlunos /></div>
            <h3>Gerenciar Alunos</h3>
            <p>Visualizar, filtrar e buscar alunos</p>
          </Link>

          <Link href="/secretaria/professores" className={styles.navCard}>
            {/* ... Gerenciar Professores ... */}
            <div className={styles.iconWrapper}><IconGerenciarProfessores /></div>
            <h3>Gerenciar Professores</h3>
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
            <p>Editar ou excluir turmas existentes</p>
          </Link>

          <Link href="/secretaria/documentos" className={styles.navCard}>
            {/* ... Gerar Documentos ... */}
            <div className={styles.iconWrapper}><IconDocumento /></div>
            <h3>Gerar Documentos</h3>
            <p>Emitir atestados, declarações e relatórios</p>
          </Link>

          {/* --- CORREÇÃO AQUI ---
            O href estava "/secretaria/grade-horaria"
            Corrigido para "/secretaria/horarios" para bater com a pasta que criamos.
          */}
          <Link href="/secretaria/horarios" className={styles.navCard}>
            {/* ... Montar Grade Horária ... */}
            <div className={styles.iconWrapper}><IconHorario /></div>
            <h3>Montar Grade Horária</h3>
            <p>Organizar os horários das turmas e professores</p>
          </Link>

        </div>
      </div>
    </div>
  );
}
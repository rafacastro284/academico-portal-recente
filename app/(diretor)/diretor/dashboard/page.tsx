'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './DiretorDashboard.module.css';

const IconGerenciarDisciplinas = () => <>📊</>;
const IconCadastrarDisciplina = () => <>➕</>;
const IconGerenciarTurmas = () => <>🏫</>;
const IconGerenciarProfessores = () => <>👨‍🏫</>;
const IconGerenciarAlunos = () => <>🎓</>;

export default function DiretorDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Gestão Escolar - Diretor</h2>
        <div className={styles.navGrid}>

          <Link href="/diretor/gerenciar-disciplinas" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconGerenciarDisciplinas /></div>
            <h3>Gerenciar Disciplinas</h3>
            <p>Visualizar e gerenciar todas as disciplinas</p>
          </Link>

          <Link href="/diretor/cadastrar-disciplina" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconCadastrarDisciplina /></div>
            <h3>Cadastrar Disciplina</h3>
            <p>Criar uma nova matéria no sistema</p>
          </Link>
          
          <Link href="/diretor/gerenciar-turmas" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconGerenciarTurmas /></div>
            <h3>Gerenciar Turmas</h3>
            <p>Visualizar e editar todas as turmas</p>
          </Link>

          <Link href="/diretor/gerenciar-professores" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconGerenciarProfessores /></div>
            <h3>Gerenciar Professores</h3>
            <p>Visualizar e gerenciar corpo docente</p>
          </Link>
          
          <Link href="/diretor/gerenciar-alunos" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconGerenciarAlunos /></div>
            <h3>Gerenciar Alunos</h3>
            <p>Visualizar alunos com média de frequência</p>
          </Link>

        </div>
      </div>
    </div>
  );
}

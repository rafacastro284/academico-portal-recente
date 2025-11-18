'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './DiretorDashboard.module.css';

const IconDesempenho = () => <>📈</>;
const IconFrequencia = () => <>📅</>;
const IconCorpoDocente = () => <>👨‍🏫</>;
const IconDisciplina = () => <>📓</>; 
const IconExportar = () => <>📄</>;
const IconNovaDisciplina = () => <>➕</>; 

export default function DiretorDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Visão Geral da Escola</h2>
        <div className={styles.navGrid}>

          <Link href="/diretor/desempenho" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconDesempenho /></div>
            <h3>Desempenho Acadêmico</h3>
            <p>Relatórios de notas e aproveitamento por turma</p>
          </Link>

          <Link href="/diretor/frequencia" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconFrequencia /></div>
            <h3>Frequência Escolar</h3>
            <p>Controle de presenças e faltas geral</p>
          </Link>
          
          <Link href="/diretor/corpo-docente" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconCorpoDocente /></div>
            <h3>Corpo Docente</h3>
            <p>Informações sobre professores e disciplinas</p>
          </Link>

          <Link href="/diretor/desempenho-disciplina" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconDisciplina /></div>
            <h3>Desempenho por Disciplina</h3>
            <p>Médias e resultados por matéria</p>
          </Link>
          
          <Link href="#" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconExportar /></div>
            <h3>Exportar Relatório</h3>
            <p>Gerar relatório completo em PDF</p>
          </Link>

          { }
          <Link href="/diretor/cadastrar-disciplina" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconNovaDisciplina /></div>
            <h3>Cadastrar Disciplina</h3>
            <p>Criar uma nova matéria no sistema</p>
          </Link>
          { }

        </div>
      </div>
    </div>
  );
}
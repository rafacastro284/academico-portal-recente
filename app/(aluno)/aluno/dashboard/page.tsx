'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Home.module.css'; 

const IconBook = () => <>📚</>;
const IconChart = () => <>📊</>;
const IconCheck = () => <>✅</>;

export default function Dashboard() {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    // 🔹 Lê os dados do usuário logado do localStorage
    const dadosSalvos = localStorage.getItem('usuarioLogado');
    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    } else {
      // 🔸 Se não tiver usuário logado, redireciona pro login
      window.location.href = '/login';
    }
  }, []);

  if (!usuario) {
    return <p className={styles.loading}>Carregando...</p>;
  }

  return (
    <div className={styles.pageWrapper}>
      {/* --- Card Principal (Header e Resumo) --- */}
      <div className={styles.mainCard}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Portal do Aluno</h1>
            <p className={styles.subtitle}>
              Olá, <strong>{usuario.nome}</strong>{' '}
              {usuario.turma && (
                <span className={styles.badge}>{usuario.turma}</span>
              )}
            </p>
            <p className={styles.matricula}>
              <span className={styles.matriculaIcon}>🪪</span>
              CPF: {usuario.cpf}
            </p>
          </div>
          <button
            className={styles.logoutButton}
            onClick={() => {
              localStorage.removeItem('usuarioLogado');
              window.location.href = '/login';
            }}
          >
            Sair
          </button>
        </header>

        {/* --- Grid de Resumo Rápido --- */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#E0F2FE' }}>
              <IconBook />
            </div>
            <div>
              <strong>5</strong>
              <p>Disciplinas</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#E0F7EB' }}>
              <IconChart />
            </div>
            <div>
              <strong>8.6</strong>
              <p>Média Geral</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#E6E0F7' }}>
              <IconCheck />
            </div>
            <div>
              <strong>92%</strong>
              <p>Frequência</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Card de Disciplinas --- */}
      <div className={styles.disciplinasCard}>
        <h2 className={styles.disciplinasTitle}>Minhas Disciplinas</h2>
        <p className={styles.disciplinasSubtitle}>
          Clique em uma disciplina para ver suas notas e frequência
        </p>

        {/* Exemplo temporário */}
        <div className={styles.disciplinasGrid}>
          <Link href="/disciplinas/1" className={styles.subjectCardLink}>
            <div className={styles.subjectCard}>
              <div className={styles.subjectCardHeader}>
                <h3>Matemática</h3>
                <p>Prof. João</p>
              </div>
              <div className={styles.subjectCardStats}>
                <div>
                  <span>8.5</span>
                  <p>Nota Atual</p>
                </div>
                <div>
                  <span>95%</span>
                  <p>Frequência</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

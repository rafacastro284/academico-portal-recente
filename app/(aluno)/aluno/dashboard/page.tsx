'use client';


import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Home.module.css'; 



const IconBook = () => <>📚</>;
const IconChart = () => <>📊</>;
const IconCheck = () => <>✅</>;

export default function Dashboard() {
  const [usuario, setUsuario] = useState<any>(null);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);

  useEffect(() => {
  const dadosSalvos = localStorage.getItem('usuarioLogado');
  if (dadosSalvos) {
    const user = JSON.parse(dadosSalvos);
    setUsuario(user);

    // 🔹 Buscar disciplinas reais
    fetch("/api/aluno/disciplinas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idusuario: user.idusuario }),
    })
      .then((res) => res.json())
      .then((data) => {
        setDisciplinas(data.disciplinas || []);
      });
  } else {
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

        <div className={styles.disciplinasGrid}>
  {disciplinas.length === 0 && <p>Você não está matriculado em nenhuma disciplina.</p>}

  {disciplinas.map((d) => (
    <Link
      key={d.idalunodisciplina}
      href={`/disciplinas/${d.iddisciplina}`}
      className={styles.subjectCardLink}
    >
      <div className={styles.subjectCard}>
        <div className={styles.subjectCardHeader}>
          <h3>{d.disciplina.nome_disciplina}</h3>
          <p>Prof. {d.disciplina.usuario.nome}</p>
        </div>
        <div className={styles.subjectCardStats}>
          <div>
            <span>-</span>
            <p>Nota Atual</p>
          </div>
          <div>
            <span>-</span>
            <p>Frequência</p>
          </div>
        </div>
      </div>
    </Link>
  ))}
</div>

      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import styles from "./DiretorLayout.module.css";
import { useEffect, useState } from "react";

const IconAluno = () => <>👨‍🎓</>;
const IconProfessor = () => <>👩‍🏫</>;
const IconTurma = () => <>🏫</>;
const IconMedia = () => <>📊</>;

export default function DiretorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [header, setHeader] = useState({
    nome: "Diretor",
  });

  const [summary, setSummary] = useState({
    alunos: 0,
    professores: 0,
    turmas: 0,
    mediaGeral: 0,
  });

  // ---- Buscar dados reais do backend ----
  useEffect(() => {
    async function loadData() {
      try {
        // Contagem de alunos
        const alunosRes = await fetch("/api/diretor/total-alunos");
        const alunosJson = await alunosRes.json();

        // Contagem de professores
        const profRes = await fetch("/api/diretor/total-professores");
        const profJson = await profRes.json();

        // Contagem de turmas
        const turmasRes = await fetch("/api/diretor/total-turmas");
        const turmasJson = await turmasRes.json();

        // Média geral
        const mediaRes = await fetch("/api/notas/media-geral");
        const mediaJson = await mediaRes.json();

        setSummary({
          alunos: alunosJson.total ?? 0,
          professores: profJson.total ?? 0,
          turmas: turmasJson.total ?? 0,
          mediaGeral: mediaJson.media ?? 0,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      }
    }

    loadData();
  }, []);

  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.header}></header>

      <main className={styles.mainContent}>
        {/* -- Card de Info do Diretor -- */}
        <div className={`${styles.card} ${styles.headerCard}`}>
          <div>
            <h1>Olá, {header.nome}</h1>
          </div>
          <Link href="/login">
            <button className={styles.logoutButton}>Sair</button>
          </Link>
        </div>

        {/* -- Cards de Resumo Rápido -- */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconAluno /></div>
            <div>
              <strong>{summary.alunos}</strong>
              <p>Alunos</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconProfessor /></div>
            <div>
              <strong>{summary.professores}</strong>
              <p>Professores</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconTurma /></div>
            <div>
              <strong>{summary.turmas}</strong>
              <p>Turmas</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.iconWrapper}><IconMedia /></div>
            <div>
              <strong>{summary.mediaGeral}</strong>
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

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './CorpoDocente.module.css';

export default function CorpoDocente() {

  const [professores, setProfessores] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [turmaSel, setTurmaSel] = useState('todas');
  const [disciplinaSel, setDisciplinaSel] = useState('todas');

  useEffect(() => {
    async function carregarProfessores() {
      try {
        const res = await fetch('/api/professores');
        const data = await res.json();
        setProfessores(data);
      } catch (err) {
        console.error("Erro ao carregar professores:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregarProfessores();
  }, []);

  if (carregando) return <p>Carregando...</p>;

  const filteredDocentes = professores.filter((p: any) => {
    const porTurma =
      turmaSel === "todas" || p.turmas.some((t: any) => t.nome === turmaSel);

    const porDisciplina =
      disciplinaSel === "todas" ||
      p.disciplinas.some((d: any) => d.nome === disciplinaSel);

    return porTurma && porDisciplina;
  });

  return (
    <div className={styles.container}>
      <Link href="/diretor/dashboard" className={styles.backButton}>
        &larr; Voltar para Visão Geral
      </Link>

      <div className={styles.card}>
        <h2 className={styles.title}>Corpo Docente</h2>

        {/* Filtros */}
        <div className={styles.filterBar}>
          
          {/* Turmas */}
          <div>
            <label>Turma:</label>
            <select value={turmaSel} onChange={(e) => setTurmaSel(e.target.value)}>
              <option value="todas">Todas as Turmas</option>

              {/** Gera opções com base no banco */}
              {Array.from(
                new Set(
                  professores.flatMap((p: any) =>
                    p.turmas.map((t: any) => t.nome)
                  )
                )
              ).map((turma) => (
                <option key={turma} value={turma}>
                  {turma}
                </option>
              ))}
            </select>
          </div>

          {/* Bimestre (ainda não implementado) */}
          <div>
            <label>Bimestre:</label>
            <select disabled>
              <option>Todos os Bimestres</option>
            </select>
          </div>

          {/* Disciplinas */}
          <div>
            <label>Disciplina:</label>
            <select
              value={disciplinaSel}
              onChange={(e) => setDisciplinaSel(e.target.value)}
            >
              <option value="todas">Todas as Disciplinas</option>

              {Array.from(
                new Set(
                  professores.flatMap((p: any) =>
                    p.disciplinas.map((d: any) => d.nome)
                  )
                )
              ).map((disc) => (
                <option key={disc} value={disc}>
                  {disc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className={styles.card}>
        <h3 className={styles.subtitle}>Corpo Docente</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Professor</th>
              <th>CPF</th>
              <th>Disciplinas</th>
              <th>Turmas</th>
              <th>Total Alunos</th>
              <th>Status</th>
            </tr>
          </thead>

            <tbody>
            {filteredDocentes.map((prof: any) => (
              <tr key={prof.idusuario}>
                <td>{prof.nome}</td>
                <td>{prof.cpf}</td>
                <td>{prof.disciplinas.map((d: any) => d.nome).join(', ')}</td>
                <td>{prof.turmas.map((t: any) => t.nome).join(', ')}</td>
                <td>{prof.totalAlunos}</td>
                <td>
                  <span className={styles.ativo}>
                    {prof.status ?? "Ativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}

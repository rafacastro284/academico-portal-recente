'use client';

import styles from './AlunosLista.module.css';
import Link from 'next/link';
import React from 'react';

interface AlunoFormatado {
    idAlunoDisciplina: number;
    idAluno: number;
    nome: string;
    matricula: string | null;
    mediaAtual: string; // Tipo alterado para string
    faltas: number;
}

interface AlunosTableProps {
    alunos: AlunoFormatado[];
    turmaId: number;
    disciplinaId: number;
    turmaNome: string;
    disciplinaNome: string;
}

export default function AlunosTable({ 
    alunos, 
    turmaId, 
    disciplinaId,
    turmaNome,
    disciplinaNome
}: AlunosTableProps) {
    
    // Converte a string da média para um número para a lógica de status
    const getMediaValue = (mediaString: string): number | null => {
        if (mediaString === '-' || !mediaString) return null;
        const media = parseFloat(mediaString);
        return isNaN(media) ? null : media;
    };

    const getStatusClass = (mediaString: string) => {
        const media = getMediaValue(mediaString); // Usa a função de conversão
        if (media === null) return '';
        if (media < 5) return styles.statusRecuperacao;
        if (media >= 7) return styles.statusAprovado;
        return styles.statusCursando;
    };

    const getStatusLabel = (mediaString: string) => {
        const media = getMediaValue(mediaString); // Usa a função de conversão
        if (media === null) return 'Sem Notas';
        if (media < 5) return 'Recuperação';
        if (media >= 7) return 'Aprovado';
        return 'Cursando';
    };

    return (
        <div className={styles.container}>

            {/* Título */}
            <h1 className={styles.pageTitle}>
                {turmaNome} – {disciplinaNome}
            </h1>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Matrícula</th>
                        <th>Nome do Aluno</th>
                        <th>Média Atual</th>
                        <th>Faltas</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {alunos.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center' }}>
                                Nenhum aluno inscrito nesta disciplina.
                            </td>
                        </tr>
                    ) : (
                        alunos.map((aluno) => (
                            <tr key={aluno.idAlunoDisciplina}>

                                <td>{aluno.matricula ?? 'N/A'}</td>

                                <td>{aluno.nome}</td>

                                <td>
                                    {aluno.mediaAtual === '-' ? '-' : aluno.mediaAtual}
                                </td>

                                <td>{aluno.faltas}</td>

                                <td>
                                    <span className={`${styles.statusTag} ${getStatusClass(aluno.mediaAtual)}`}>
                                        {getStatusLabel(aluno.mediaAtual)}
                                    </span>
                                </td>

                                <td>
                                    <Link
                                        href={`/professor/turma/${turmaId}/lancar-frequencia?disciplina=${disciplinaId}&aluno=${aluno.idAlunoDisciplina}`}
                                    >
                                        <button className={styles.actionButton}>Frequência</button>
                                    </Link>

                                    <Link
                                        href={`/professor/turma/${turmaId}/lancar-notas?disciplina=${disciplinaId}&aluno=${aluno.idAlunoDisciplina}`}
                                    >
                                        <button className={styles.actionButton} style={{ marginLeft: 8 }}>
                                            Notas
                                        </button>
                                    </Link>
                                </td>

                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
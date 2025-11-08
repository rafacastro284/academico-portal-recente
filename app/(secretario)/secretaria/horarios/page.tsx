"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link'; 
import ModalEditarHorario from '../components/ModalEditarHorario'; 
import { 
  mockTurmas, 
  mockProfessores, 
  mockMaterias, 
  diasDaSemana, 
  horarios 
} from '../../../lib/mockData'; 

import styles from './horarios.module.css';

interface GradeSlot {
  materiaId: string;
  professorId: string;
}
interface GradeHoraria {
  [dia: string]: {
    [horario: string]: GradeSlot;
  };
}

export default function MontarHorarios() {
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const [gradeHoraria, setGradeHoraria] = useState<GradeHoraria>({});
  const [modalAberto, setModalAberto] = useState(false);
  const [celulaAtual, setCelulaAtual] = useState<{ dia: string; horario: string } | null>(null);

  useEffect(() => {
    if (turmaSelecionada) {
      console.log(`Buscando grade da turma ID: ${turmaSelecionada}`);
      setGradeHoraria({});
    }
  }, [turmaSelecionada]);

  const handleCellClick = (dia: string, horario: string) => {
    const isBreak = horario.includes('PAUSA') || horario.includes('ALMOÇO');
    
    if (isBreak || !turmaSelecionada) {
      if (!turmaSelecionada) {
        alert("Por favor, selecione uma turma primeiro.");
      }
      return;
    }
    setCelulaAtual({ dia, horario });
    setModalAberto(true);
  };

  const handleCloseModal = () => {
    setModalAberto(false);
    setCelulaAtual(null);
  };

  const handleSaveModal = (dados: { materiaId: string, professorId: string }) => {
    if (!celulaAtual) return; 
    const { dia, horario } = celulaAtual;

    setGradeHoraria((prevGrade) => ({
      ...prevGrade,
      [dia]: {
        ...prevGrade[dia],
        [horario]: dados,
      },
    }));
  };

  const getSlotDisplay = (dia: string, horario: string) => {
    const slot = gradeHoraria[dia]?.[horario];
    
    if (!slot) {
      return (
        <div className={styles.slotEmpty}>
          <span>(Vazio)</span>
          <span>Clique para editar</span>
        </div>
      );
    }
    
    const materiaNome = mockMaterias.find(m => m.id.toString() === slot.materiaId)?.nome || '??';
    const profNome = mockProfessores.find(p => p.id.toString() === slot.professorId)?.nome || '??';

    return (
      <div className={styles.slotFilled}>
        <strong className={styles.slotMateria}>{materiaNome}</strong>
        <span className={styles.slotProfessor}>{profNome}</span>
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      
      <Link href="/secretaria/dashboard" className={styles.backButton}>
        &larr; Voltar ao Dashboard
      </Link>

      {modalAberto && celulaAtual && (
        <ModalEditarHorario
          dia={celulaAtual.dia}
          horario={celulaAtual.horario}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
        />
      )}

      {/* Título da Página */}
      <div className={styles.header}>
        <h1 className={styles.title}>Montagem de Grade Horária</h1>
        <p className={styles.subtitle}>Selecione uma turma para editar sua grade.</p>
      </div>

      {/* 1. Seletor de Turma */}
      <div className={styles.selectorWrapper}>
        <label htmlFor="turma-select">
          Selecione a Turma:
        </label>
        <select
          id="turma-select"
          className={styles.selector}
          value={turmaSelecionada || ''} 
          onChange={(e) => setTurmaSelecionada(e.target.value)}
        >
          {!turmaSelecionada && (
            <option value="" disabled>Selecione...</option>
          )}
          {mockTurmas.map((turma) => (
            <option key={turma.id} value={turma.id}> 
              {turma.nome}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Grade Horária */}
      {turmaSelecionada && (
        <>
          <div className={styles.gradeContainer}>
            <div className={styles.tableWrapper}>
              <table className={styles.gradeTable}>
                <thead className={styles.tableHead}>
                  <tr>
                    {/* Cabeçalho da tabela */}
                    <th>Horário</th> 
                    {diasDaSemana.map((dia) => (
                      <th key={dia}> 
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  
                  {/* Mapeia a lista de horários */}
                  {horarios.map((horario) => {
                    const isBreak = horario.includes('PAUSA') || horario.includes('ALMOÇO');

                    // Linha de Pausa/Almoço
                    if (isBreak) {
                      return (
                        <tr key={horario} className={styles.breakRow}>
                          <td className={styles.timeCell}>{horario}</td>
                          <td colSpan={5} className={styles.breakCell}>
                            {horario.includes('PAUSA') ? 'Intervalo' : 'Horário de Almoço'}
                          </td>
                        </tr>
                      );
                    }

                    // Linha de Aula Normal 
                    return (
                      <tr key={horario}> 
                        <td className={styles.timeCell}>
                          {horario}
                        </td>
                        {diasDaSemana.map((dia) => (
                          <td
                            key={`${dia}-${horario}`}
                            className={styles.slotCell} 
                            onClick={() => handleCellClick(dia, horario)}
                          >
                            {getSlotDisplay(dia, horario)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.buttonWrapper}>
            <button className={styles.saveButton}>
              Salvar Grade Horária (Ainda não funcional)
            </button>
          </div>
        </>
      )}
    </div>
  );
}